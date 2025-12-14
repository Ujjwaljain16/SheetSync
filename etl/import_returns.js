const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function importReturns() {
    try {
        console.log("🚀 Starting Returns ETL...");
        await client.connect();

        // 1. EXTRACT
        const jsonPath = path.join(__dirname, 'returns.json');
        const rawData = fs.readFileSync(jsonPath, 'utf8');
        const returns = JSON.parse(rawData);
        console.log(`📦 Extracted ${returns.length} records.`);

        // 2. TRANSFORM
        const seenOrders = new Set();
        const cleanData = [];

        for (const item of returns) {
            const orderId = item["Order ID"];
            
            // Validation: Skip if no Order ID
            if (!orderId || orderId.startsWith("INVALID")) {
                console.warn(`⚠️ Skipping Invalid ID: ${orderId}`);
                continue;
            }

            // Deduplication
            if (seenOrders.has(orderId)) {
                console.warn(`♻️ Duplicate removed: ${orderId}`);
                continue;
            }
            seenOrders.add(orderId);

            // Cleaning: Null Coalescing for Reason
            const reason = item["Reason"] || "Unknown";

            cleanData.push({
                order_id: orderId,
                returned: item["Returned"],
                reason: reason
            });
        }
        console.log(`✨ Transformed to ${cleanData.length} clean records.`);

        // 3. LOAD (Batch Insert)
        // Simple loop for this small dataset, but prepared statements for security
        for (const row of cleanData) {
            await client.query(
                'INSERT INTO returns (order_id, returned, reason) VALUES ($1, $2, $3)',
                [row.order_id, row.returned, row.reason]
            );
        }
        console.log("✅ Load Complete!");

    } catch (err) {
        console.error("🔥 ETL Error:", err);
    } finally {
        await client.end();
    }
}

importReturns();
