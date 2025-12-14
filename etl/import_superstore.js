const fs = require('fs');
const readline = require('readline');
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function processLine(line, headers) {
    const values = line.split(',');
    // Simple CSV parser (assuming no commas in values for this demo)
    const row = {};
    headers.forEach((h, i) => row[h.trim()] = values[i]);

    return row;
}

async function runETL() {
    try {
        console.log("🚀 Starting ETL Pipeline...");
        await client.connect();

        const csvPath = path.join(__dirname, 'superstore_sample.csv');
        const fileStream = fs.createReadStream(csvPath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let headers = null;
        let count = 0;

        for await (const line of rl) {
            if (!headers) {
                headers = line.split(',');
                continue;
            }

            const row = await processLine(line, headers);
            console.log(`Processing Order: ${row['Order ID']}`);

            try {
                await client.query('BEGIN');

                // 1. Locations (Deduplicated)
                const locRes = await client.query(`
                    INSERT INTO locations (city, state, country, region)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (city, state, country) DO UPDATE SET city=EXCLUDED.city
                    RETURNING location_id
                `, [row['City'], row['State'], row['Country'], row['Region']]);
                
                // If ON CONFLICT DO NOTHING returned null, fetch existing ID
                let locationId = locRes.rows[0]?.location_id;
                if (!locationId) {
                    const existingLoc = await client.query(
                        'SELECT location_id FROM locations WHERE city=$1 AND state=$2 AND country=$3',
                        [row['City'], row['State'], row['Country']]
                    );
                    locationId = existingLoc.rows[0].location_id;
                }

                // 2. Customers
                await client.query(`
                    INSERT INTO customers (customer_id, customer_name, segment)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (customer_id) DO NOTHING
                `, [row['Customer ID'], row['Customer Name'], row['Segment']]);

                // 3. Products
                await client.query(`
                    INSERT INTO products (product_id, category, sub_category, product_name)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (product_id) DO NOTHING
                `, [row['Product ID'], row['Category'], row['Sub-Category'], row['Product Name']]);

                // 4. Orders
                await client.query(`
                    INSERT INTO orders (order_id, order_date, ship_date, ship_mode, customer_id, location_id)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (order_id) DO NOTHING
                `, [row['Order ID'], row['Order Date'], row['Ship Date'], row['Ship Mode'], row['Customer ID'], locationId]);

                // 5. Order Items
                await client.query(`
                    INSERT INTO order_items (order_id, product_id, sales, quantity, discount, profit)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `, [row['Order ID'], row['Product ID'], row['Sales'], row['Quantity'], row['Discount'], row['Profit']]);

                await client.query('COMMIT');
                count++;
            } catch (err) {
                await client.query('ROLLBACK');
                console.error(`❌ Failed processing row ${count + 1}:`, err.message);
            }
        }

        console.log(`✅ ETL Completed! Processed ${count} records.`);
    } catch (err) {
        console.error("🔥 ETL Fatal Error:", err);
    } finally {
        await client.end();
    }
}

runETL();
