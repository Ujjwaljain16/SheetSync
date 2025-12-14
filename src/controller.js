const db = require('./db');



const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);

const connectWithRetry = async (retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const client = await db.pool.connect();
            return client;
        } catch (err) {
            console.warn(`[WARN] DB Connection attempt ${i + 1} failed: ${err.message}. Retrying in ${delay}ms...`);
            if (i === retries - 1) throw err;
            await setTimeoutPromise(delay);
        }
    }
};

const processBatch = async (req, res) => {
    console.log('[DEBUG] processBatch called. Body rows:', req.body.rows?.length);
    const { source, sync_id, rows } = req.body;

    if (!rows || !Array.isArray(rows)) {
        return res.status(400).json({ error: 'Invalid payload: rows must be an array' });
    }

    if (rows.length === 0) {
        return res.json({ success: true, rows_received: 0, rows_success: 0, rows_failed: [] });
    }

    let client;
    const results = {
        success: true,
        rows_received: rows.length,
        rows_success: 0,
        rows_failed: []
    };

    try {
        client = await connectWithRetry();
        await client.query('BEGIN');

        // Prepare arrays for Bulk Insert (UNNEST)
        const full_names = [];
        const emails = [];
        const phones = [];
        const joined_ats = [];
        const statuses = [];
        const scores = [];
        const metadatas = [];
        const sync_ids = [];

        // Pre-validation loop
        const validRowsIndices = [];
        const uniqueRowsMap = new Map();

        // 1. Deduplicate rows by email (Last Write Wins within the batch)
        rows.forEach((row, index) => {
             // Immediate validation for missing identifier
             if (!row.email) {
                 results.rows_failed.push({
                     row_number: index + 1,
                     error: 'Missing required field: email',
                     data: row
                 });
                 return;
             }
             
             // Deduplicate
             uniqueRowsMap.set(row.email, { row, index });
        });

        // 2. Processing unique rows
        uniqueRowsMap.forEach(({ row, index }) => {
            // Basic Backend Validation
            if (!row.email || !row.full_name) {
                results.rows_failed.push({
                    row_number: index + 1,
                    error: 'Missing required fields: email, full_name',
                    data: row
                });
                return;
            }

            // Separate standard fields from metadata
            const { 
                full_name, email, phone, joined_at, status, performance_score, 
                ...rest 
            } = row;

            full_names.push(full_name);
            emails.push(email);
            phones.push(phone || null);
            joined_ats.push(joined_at || null);
            statuses.push(status || 'ACTIVE');
            scores.push(performance_score || 0);
            metadatas.push(JSON.stringify(rest)); // Store remaining fields as JSON
            sync_ids.push(sync_id);
            
            validRowsIndices.push(index);
        });

        // Batch Insert using Loop (Simpler/Safer than UNNEST for avoiding driver/serialization bugs)
        // Since we are in a Transaction (BEGIN/COMMIT), this is still ACID compliant and efficient enough for batch sizes < 100.
        let successCount = 0;
        
        for (const index of validRowsIndices) {
            const rowQuery = `
                INSERT INTO employees (
                    full_name, email, phone, joined_at, status, 
                    performance_score, metadata, sync_id, updated_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
                ON CONFLICT (email) 
                DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    phone = EXCLUDED.phone,
                    joined_at = EXCLUDED.joined_at,
                    status = EXCLUDED.status,
                    performance_score = EXCLUDED.performance_score,
                    metadata = employees.metadata || EXCLUDED.metadata,
                    sync_id = EXCLUDED.sync_id,
                    updated_at = NOW()
                RETURNING email;
            `;

            const rowValues = [
                full_names[index], 
                emails[index], 
                phones[index], 
                joined_ats[index], 
                statuses[index], 
                scores[index], 
                metadatas[index], // This is a JSON string, PG driver handles string -> jsonb cast easily
                sync_ids[index]
            ];

            await client.query(rowQuery, rowValues);
            successCount++;
        }
        
        results.rows_success = successCount;

        await client.query('COMMIT');
        
        // Send Success Notification
        if (results.rows_success > 0) {
            const { sendNotification } = require('./services/notification');
            await sendNotification(`Sync Success! Processed ${results.rows_received} rows. Inserted/Updated: ${results.rows_success} Failed: ${results.rows_failed.length}`, 'success');
        }
        
        res.json(results);

    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error('Batch processing error:', error);
        
        // Send Error Notification
        const { sendNotification } = require('./services/notification');
        await sendNotification(`Sync Critical Failure: ${error.message}`, 'error');

        res.status(500).json({ error: 'Internal Server Error: ' + error.message });
    } finally {
        if (client) client.release();
    }
};

module.exports = {
    processBatch
};
