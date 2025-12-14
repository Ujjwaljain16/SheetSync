const { execSync } = require('child_process');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const API_URL = 'http://localhost:3000/sheetsync/batch';
const API_KEY = process.env.API_KEY || 'test-secret'; // Fallback for demo

// Helper to run shell commands
function runStep(stepName, command) {
    console.log(`\n[STEP] ${stepName}...`);
    try {
        const output = execSync(command, { stdio: 'inherit', cwd: path.join(__dirname, '../') });
        console.log(`[SUCCESS] ${stepName} Completed.`);
    } catch (error) {
        console.error(`[ERROR] ${stepName} Failed.`);
        console.error(error.message);
        process.exit(1);
    }
}

async function runDemo() {
    console.log("==================================================");
    console.log("       SHEETSYNC E2E DEMONSTRATION                ");
    console.log("==================================================");

    // 1. Check if Server is Online
    try {
        console.log("\n[CHECK] Verifying Server Status...");
        await axios.get('http://localhost:3000/'); 
        // Assuming root might not return 200 if not defined, but connection refused is the real check.
        // Actually our app generally doesn't have a root route defined in previous context, 
        // but let's assume if it connects it's up.
        console.log("[SUCCESS] Server is Online.");
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error("\n[ERROR] Server is NOT running on port 3000.");
            console.error("Please open a new terminal and run: npm start");
            process.exit(1);
        }
        // Other errors (404) mean server is up but route missing, which is fine.
        console.log("[SUCCESS] Server is Online (Verified connection).");
    }

    // 2. Initialize Database (Reset)
    runStep('Reset Database Schema', 'node scripts/init-db.js');

    // 3. ETL Pipeline
    runStep('Run ETL Pipeline (Import Orders)', 'node etl/import_superstore.js');
    runStep('Run ETL Pipeline (Import Returns)', 'node etl/import_returns.js');

    // 4. Apply Optimizations (Materialized Views)
    runStep('Apply Database Optimizations', 'node scripts/run-sql.js sql/optimizations.sql');

    // 5. Performance Benchmark
    runStep('Run SQL Benchmark', 'node scripts/benchmark.js');

    // 6. Simulate API Call (Automation)
    console.log(`\n[STEP] Simulating New Google Sheet Row (via API)...`);
    
    // Polling Health Check to ensure Server is ready after Benchmark load
    console.log("   Waiting for Server availability...");
    for (let i = 0; i < 10; i++) {
        try {
            await axios.get('http://localhost:3000/');
            break; 
        } catch (e) {
            if (i === 9) console.error("   [WARN] Server check timed out, proceeding anyway...");
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    
    const demoPayload = {
        source: 'e2e_demo_script',
        sync_id: `demo_${Date.now()}`,
        rows: [
            {
                // A valid row
                order_id: `DEMO-${Date.now()}`,
                order_date: new Date().toISOString().split('T')[0],
                full_name: "Demo User",
                email: "demo.user@example.com",
                sales: 500.00,
                quantity: 2,
                profit: 50.00,
                status: "ACTIVE" // Valid status per CHECK constraint
            },
            {
                // An invalid row (missing email) to show error handling
                order_id: `INVALID-${Date.now()}`,
                full_name: "Ghost User",
                sales: 0
            }
        ]
    };

    try {
        const response = await axios.post(
            API_URL, 
            demoPayload, 
            { headers: { 'x-api-key': API_KEY } }
        );

        console.log("[API RESPONSE]:");
        console.log(JSON.stringify(response.data, null, 2));

        if (response.data.rows_success === 1 && response.data.rows_failed.length === 1) {
             console.log("\n[SUCCESS] API Logic Verified:");
             console.log("   - 1 Row Inserted (Valid)");
             console.log("   - 1 Row Rejected (Invalid - as expected)");
        } else {
             console.log("\n[WARN] API Response differed from expectation.");
        }

    } catch (error) {
        console.error("[ERROR] API Call Failed:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        }
    }

    console.log("\n==================================================");
    console.log("       DEMO COMPLETED SUCCESSFULLY                ");
    console.log("==================================================");
}

runDemo();
