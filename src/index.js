const path = require('path');
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: path.join(__dirname, '../.env') });
}
const db = require('./db');
const app = require('./app');

const PORT = process.env.PORT || 3000;

(async () => {
    try {
        console.log("Attempting Database Connection...");
        if (!process.env.DATABASE_URL) {
            throw new Error("DATABASE_URL is undefined in process.env");
        }
        
        const dbUrl = process.env.DATABASE_URL;
        console.log(`Debug: Connecting to ${dbUrl.split('@')[1] || 'Unknown Host'}...`);

        const client = await db.pool.connect();
        const res = await client.query('SELECT NOW()');
        client.release();
        console.log(`[SUCCESS] Database Connected! Time: ${res.rows[0].now}`);

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`[INFO] Server is running on port ${PORT}`);
        });

    } catch (err) {
        console.error("[ERROR] Critical Startup Error:", err.message);
        process.exit(1);
    }
})();

// Global Error Handlers to prevent crash
process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception:', err);
    // Keep process alive if possible, or exit gracefully
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful Shutdown
process.on('SIGINT', async () => {
    console.log('\n[INFO] Shutting down server...');
    await db.pool.end();
    console.log('[INFO] Database pool closed.');
    process.exit(0);
});
