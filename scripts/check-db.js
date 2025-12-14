const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function check() {
    try {
        await client.connect();
        const res = await client.query('SELECT id, full_name, email, status, created_at FROM employees ORDER BY id DESC LIMIT 5');
        console.log(`Found ${res.rowCount} employees:`);
        if (res.rowCount > 0) {
            console.table(res.rows);
        } else {
            console.log("Table is empty.");
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
check();
