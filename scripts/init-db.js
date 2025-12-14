const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function initDB() {
    try {
        await client.connect();
        console.log("🔌 Connected to database...");

        // Read Schema Files
        const schemaPath = path.join(__dirname, '../database/superstore_schema.sql');
        const seedPath = path.join(__dirname, '../database/seed.sql');

        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        const seedSql = fs.readFileSync(seedPath, 'utf8');

        console.log("⚙️ Applying Schema...");
        await client.query(schemaSql);
        console.log("✅ Schema Applied.");

        console.log("🌱 Seeding Data...");
        await client.query(seedSql);
        console.log("✅ Data Seeded.");

    } catch (err) {
        console.error("❌ Error initializing DB:", err.message);
    } finally {
        await client.end();
    }
}

initDB();
