const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

const sqlFile = process.argv[2];

if (!sqlFile) {
    console.error("Usage: node scripts/run-sql.js <path-to-sql-file>");
    process.exit(1);
}

async function runSql() {
    try {
        await client.connect();
        const sql = fs.readFileSync(sqlFile, 'utf8');
        
        console.log(`📜 Executing ${path.basename(sqlFile)}...`);
        
        // Split by semicolon, but handle the function body (which contains semicolons)
        // Simple split might break Stored Procedures. 
        // For Views/Procedures, running the whole file as one query usually works if it's one block.
        // But queries.sql has multiple.
        
        if (sqlFile.includes('queries.sql')) {
            // Naive split for queries.sql demo
            const queries = sql.split(';').filter(q => q.trim().length > 0);
            for (const q of queries) {
                console.log(`\n--- Query ---`);
                console.log(q.trim().substring(0, 50) + "...");
                const res = await client.query(q);
                if (res.rows) {
                    console.table(res.rows);
                } else if (Array.isArray(res)) {
                    // Explain analyze returns array sometimes
                    res.forEach(r => console.table(r.rows));
                }
            }
        } else {
            // Run as single block for Views/Procedures
            await client.query(sql);
            console.log("✅ Executed successfully.");
        }

    } catch (err) {
        console.error("❌ SQL Error:", err.message);
    } finally {
        await client.end();
    }
}

runSql();
