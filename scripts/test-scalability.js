const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

const API_URL = 'http://localhost:3000/sheetsync/batch';
const API_KEY = process.env.API_KEY;
const BATCH_SIZE = 5000; // Test with 5000 rows

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function clearDb() {
    console.log('🧹 Clearing database...');
    await pool.query('TRUNCATE TABLE employees RESTART IDENTITY');
    console.log('✅ Database cleared.');
}

function generateData(count) {
    console.log(`🏭 Generating ${count} rows...`);
    const rows = [];
    for (let i = 0; i < count; i++) {
        rows.push({
            full_name: `User ${i}`,
            email: `user${i}@example.com`,
            phone: `555-${String(i).padStart(4, '0')}`,
            joined_at: new Date().toISOString().split('T')[0],
            status: i % 10 === 0 ? 'INACTIVE' : 'ACTIVE', // 10% Inactive
            performance_score: Math.floor(Math.random() * 100)
        });
    }

    // Add some duplicates to test deduplication
    console.log('🔂 Adding 100 duplicates...');
    for (let i = 0; i < 100; i++) {
        rows.push({
            full_name: `User ${i} Duplicate`, // Name changed, should update
            email: `user${i}@example.com`, // Same email
            phone: `555-${String(i).padStart(4, '0')}`,
            joined_at: new Date().toISOString().split('T')[0],
            status: 'ACTIVE',
            performance_score: 99
        });
    }

    // Add some invalid rows
    console.log('🚫 Adding 50 invalid rows...');
    for (let i = 0; i < 50; i++) {
        rows.push({
            full_name: `Invalid User ${i}`,
            email: '', // Missing email
            status: 'ACTIVE'
        });
    }

    return rows;
}

async function verifyDb(expectedCount) {
    const res = await pool.query('SELECT COUNT(*) FROM employees');
    const count = parseInt(res.rows[0].count);
    console.log(`📊 Database Count: ${count}`);
    
    if (count === expectedCount) {
        console.log('✅ Verification PASSED: Row count matches expected unique users.');
    } else {
        console.error(`❌ Verification FAILED: Expected ${expectedCount}, got ${count}`);
    }
}

async function runTest() {
    try {
        await clearDb();

        const rows = generateData(BATCH_SIZE);
        const totalRows = rows.length;
        
        // Expected in DB: 
        // BATCH_SIZE (unique) 
        // + 0 (duplicates should update existing, not add new)
        // + 0 (invalid should be rejected)
        const expectedDbCount = BATCH_SIZE;

        console.log(`🚀 Sending ${totalRows} rows to API...`);
        
        const startTime = Date.now();
        
        const response = await axios.post(API_URL, {
            source: 'scalability-test',
            sync_id: new Date().toISOString(),
            rows: rows
        }, {
            headers: { 'x-api-key': API_KEY },
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        });

        const duration = (Date.now() - startTime) / 1000;

        console.log(`\n⏱️  Time Taken: ${duration}s`);
        console.log(`⚡ Speed: ${Math.round(totalRows / duration)} rows/sec`);
        console.log('\n📝 API Response Summary:');
        console.log(`   Success: ${response.data.rows_success}`);
        console.log(`   Failed: ${response.data.rows_failed.length}`);

        await verifyDb(expectedDbCount);

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
        if (error.response) {
            console.error('   API Error:', error.response.data);
        }
    } finally {
        await pool.end();
    }
}

runTest();
