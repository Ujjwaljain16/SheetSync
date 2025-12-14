const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function runBenchmark() {
    try {
        await client.connect();
        
        console.log("\n[INFO] Running Performance Benchmark...\n");

        // 1. Slow Query (Complex Join)
        const slowQuery = `
            EXPLAIN ANALYZE 
            SELECT l.region, COUNT(r.return_id), SUM(oi.sales)
            FROM returns r 
            JOIN orders o ON r.order_id = o.order_id 
            JOIN order_items oi ON o.order_id = oi.order_id 
            JOIN locations l ON o.location_id = l.location_id 
            GROUP BY l.region
        `;
        const resSlow = await client.query(slowQuery);
        const timeSlow = parseExecutionTime(resSlow.rows);

        // 2. Fast Query (Materialized View)
        const fastQuery = `EXPLAIN ANALYZE SELECT * FROM mv_returned_sales`;
        const resFast = await client.query(fastQuery);
        const timeFast = parseExecutionTime(resFast.rows);

        // Display Results
        console.log("+------------------------------+------------------+");
        console.log("| Query Type                   | Execution Time   |");
        console.log("+------------------------------+------------------+");
        console.log(`| Unoptimized (Complex JOIN)   | ${timeSlow.padEnd(16)} |`);
        console.log(`| Optimized (Materialized View)| ${timeFast.padEnd(16)} |`);
        console.log("+------------------------------+------------------+");
        
        const improvement = (parseFloat(timeSlow) / parseFloat(timeFast)).toFixed(1);
        console.log(`\n[RESULT] Speedup Factor: ${improvement}x Faster`);

    } catch (err) {
        console.error("Benchmark Error:", err);
    } finally {
        await client.end();
    }
}

function parseExecutionTime(rows) {
    // PG Explain output puts 'Execution Time: X ms' in the last row usually
    for (const row of rows) {
        const plan = row['QUERY PLAN'];
        if (plan && plan.includes('Execution Time')) {
            return plan.split(':')[1].trim();
        }
    }
    return "N/A";
}

runBenchmark();
