const db = require('./db');



const processBatch = async (req, res) => {
    const { source, sync_id, rows } = req.body;

    if (!rows || !Array.isArray(rows)) {
        return res.status(400).json({ error: 'Invalid payload: rows must be an array' });
    }

    if (rows.length === 0) {
        return res.json({ success: true, rows_received: 0, rows_success: 0, rows_failed: [] });
    }

    const client = await db.pool.connect();
    const results = {
        success: true,
        rows_received: rows.length,
        rows_success: 0,
        rows_failed: []
    };

    try {
        await client.query('BEGIN');

        // Prepare arrays for Bulk Insert (UNNEST)
        const full_names = [];
        const emails = [];
        const phones = [];
        const joined_ats = [];
        const statuses = [];
        const scores = [];
        const sync_ids = [];

        // Pre-validation loop
        const validRowsIndices = [];
        const uniqueRowsMap = new Map();

        // 1. Deduplicate rows by email (Last Write Wins within the batch)
        rows.forEach((row, index) => {
             if (row.email) {
                 uniqueRowsMap.set(row.email, { row, index });
             }
        });

        // 2. Process unique rows
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

            full_names.push(row.full_name);
            emails.push(row.email);
            phones.push(row.phone || null);
            joined_ats.push(row.joined_at || null);
            statuses.push(row.status || 'ACTIVE');
            scores.push(row.performance_score || 0);
            sync_ids.push(sync_id);
            
            validRowsIndices.push(index);
        });

        if (full_names.length > 0) {
            const query = `
                INSERT INTO employees (full_name, email, phone, joined_at, status, performance_score, sync_id, updated_at)
                SELECT * FROM UNNEST(
                    $1::text[], 
                    $2::text[], 
                    $3::text[], 
                    $4::date[], 
                    $5::text[], 
                    $6::int[], 
                    $7::text[],
                    ARRAY_FILL(NOW(), ARRAY[CARDINALITY($1::text[])]) -- updated_at for all rows
                )
                ON CONFLICT (email) 
                DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    phone = EXCLUDED.phone,
                    joined_at = EXCLUDED.joined_at,
                    status = EXCLUDED.status,
                    performance_score = EXCLUDED.performance_score,
                    sync_id = EXCLUDED.sync_id,
                    updated_at = NOW()
                RETURNING email;
            `;

            const values = [full_names, emails, phones, joined_ats, statuses, scores, sync_ids];
            
            const result = await client.query(query, values);
            results.rows_success = result.rowCount;
        }

        await client.query('COMMIT');
        res.json(results);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Batch processing error:', error);
        // In a bulk operation, if the SQL fails (e.g. constraint violation not covered by ON CONFLICT), 
        // the whole batch fails. This is a trade-off for speed.
        // For a more robust solution, we could fallback to row-by-row on error, 
        // but for this demo, failing the batch is acceptable or we assume validation catches most things.
        res.status(500).json({ error: 'Internal Server Error: ' + error.message });
    } finally {
        client.release();
    }
};

module.exports = {
    processBatch
};

module.exports = {
    processBatch
};
