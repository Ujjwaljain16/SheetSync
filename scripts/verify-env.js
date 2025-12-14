const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function verifyConnection() {
    try {
        await client.connect();
        // This specific string is required by the Task 1 deliverables
        console.log("Connected to PostgreSQL/NeonDB");
        
        const res = await client.query('SELECT NOW() as now');
        console.log('Server Time:', res.rows[0].now);
        
        await client.end();
    } catch (err) {
        console.error('Connection Failed:', err.message);
        process.exit(1);
    }
}

verifyConnection();
