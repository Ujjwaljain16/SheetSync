const fs = require('fs');
const readline = require('readline');
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

const crypto = require('crypto');

async function processLine(line, headers) {
    // Robust CSV parsing for quoted fields (e.g. "Storage & Organization")
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current.trim()); // Last value

    const row = {};
    headers.forEach((h, i) => row[h.trim()] = values[i]);
    return row;
}

function generateId(prefix, ...values) {
    const str = values.join('|').toUpperCase();
    const hash = crypto.createHash('md5').update(str).digest('hex').substring(0, 8);
    return `${prefix}-${hash}`;
}

async function runETL() {
    try {
        console.log("Starting ETL Pipeline (User Data Adaptation)...");
        await client.connect();

        const csvPath = path.join(__dirname, 'superstoreSales.csv');
        // Handle potential file naming diffs
        if (!fs.existsSync(csvPath)) {
            console.error("File not found: superstoreSales.csv");
            return;
        }

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
                console.log("Headers detected:", headers);
                continue;
            }

            const row = await processLine(line, headers);
            
            // MAPPING LOGIC FOR USER DATA
            // Source: Order ID, Order Date, Ship Date, Ship Mode, Customer Name, Province, Region, Customer Segment, 
            //         Product Category, Product Sub-Category, Product Name, Sales, Order Quantity, Discount, Profit
            
            // 1. Generate Missing IDs
            const customerId = generateId('CUST', row['Customer Name'], row['Province']);
            const productId = generateId('PROD', row['Product Name'], row['Product Sub-Category']);
            
            // 2. Map Columns
            const data = {
                orderId: row['Order ID'],
                orderDate: new Date(row['Order Date']),
                shipDate: new Date(row['Ship Date']),
                shipMode: row['Ship Mode'],
                customerName: row['Customer Name'],
                segment: row['Customer Segment'],
                city: 'Unknown', // Not in CSV
                state: row['Province'],
                country: 'Unknown', // Not in CSV
                region: row['Region'],
                category: row['Product Category'],
                subCategory: row['Product Sub-Category'],
                productName: row['Product Name'],
                sales: parseFloat(row['Sales']) || 0,
                quantity: parseInt(row['Order Quantity']) || 0,
                discount: parseFloat(row['Discount']) || 0,
                profit: parseFloat(row['Profit']) || 0
            };

            console.log(`Processing Order: ${data.orderId}`);

            try {
                await client.query('BEGIN');

                // 1. Locations
                const locRes = await client.query(`
                    INSERT INTO locations (city, state, country, region)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (city, state, country) DO UPDATE SET region=EXCLUDED.region
                    RETURNING location_id
                `, [data.city, data.state, data.country, data.region]);
                
                let locationId = locRes.rows[0]?.location_id;
                if (!locationId) {
                     const existing = await client.query('SELECT location_id FROM locations WHERE city=$1 AND state=$2 AND country=$3', 
                        [data.city, data.state, data.country]);
                     locationId = existing.rows[0].location_id;
                }

                // 2. Customers
                await client.query(`
                    INSERT INTO customers (customer_id, customer_name, segment)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (customer_id) DO NOTHING
                `, [customerId, data.customerName, data.segment]);

                // 3. Products
                await client.query(`
                    INSERT INTO products (product_id, category, sub_category, product_name)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (product_id) DO NOTHING
                `, [productId, data.category, data.subCategory, data.productName]);

                // 4. Orders
                await client.query(`
                    INSERT INTO orders (order_id, order_date, ship_date, ship_mode, customer_id, location_id)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (order_id) DO NOTHING
                `, [data.orderId, data.orderDate, data.shipDate, data.shipMode, customerId, locationId]);

                // 5. Order Items
                await client.query(`
                    INSERT INTO order_items (order_id, product_id, sales, quantity, discount, profit)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `, [data.orderId, productId, data.sales, data.quantity, data.discount, data.profit]);

                await client.query('COMMIT');
                count++;
            } catch (err) {
                await client.query('ROLLBACK');
                console.error(`Failed processing row ${count + 1}:`, err.message);
            }
        }

        console.log(`ETL Completed! Processed ${count} records.`);
    } catch (err) {
        console.error("ETL Fatal Error:", err);
    } finally {
        await client.end();
    }
}

runETL();
