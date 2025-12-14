# 📌 Task 4: ETL Pipeline Documentation

**Status**: ✅ Completed
**Date**: 2025-12-14

## 1. Pipeline Architecture
The ETL (Extract, Transform, Load) pipeline is designed to migrate flat CSV data into our normalized 3NF PostgreSQL schema.

*   **Extract**: Reads `superstore_sample.csv` using Node.js Streams (memory efficient).
*   **Transform**:
    *   Splits flat rows into normalized entities (`Location`, `Customer`, `Product`, `Order`).
    *   Validates Data Types (Dates, Numbers).
*   **Load**:
    *   Uses **Atomic Transactions** (`BEGIN`...`COMMIT`) to ensure integrity.
    *   Handles **Deduplication** via `ON CONFLICT DO NOTHING/UPDATE`.

## 2. Dependencies
*   `pg`: PostgreSQL client.
*   `dotenv`: Environment variable management.
*   `fs` / `readline`: Built-in Node.js modules for file reading.

## 3. Transformation Logic (Code Highlights)

### Deduplication Strategy
For Locations, we use a "Get or Create" pattern:
```sql
INSERT INTO locations (...)
ON CONFLICT (city, state, country) DO UPDATE ...
RETURNING location_id;
```

### Transaction Handling
Every order processing is wrapped in a transaction:
```javascript
await client.query('BEGIN');
// Insert Customer, Product, Order, Items...
await client.query('COMMIT');
```

## 4. Execution Logs
```bash
$ node etl/import_superstore.js
🚀 Starting ETL Pipeline...
Processing Order: CA-2016-152156
Processing Order: CA-2016-152156 (Item 2)
Processing Order: CA-2016-138688
✅ ETL Completed! Processed 3 records.
```
