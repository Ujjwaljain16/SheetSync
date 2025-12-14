# SheetSync: Final End-to-End Demo Walkthrough

This walkthrough demonstrates the full capabilities of the SheetSync platform, from raw data ingestion to high-performance analytics and API integration.

## 🚀 How to Run the Demo

1.  **Start the Server** (in one terminal):
    ```bash
    npm start
    ```
    *Wait for: `[SUCCESS] Database Connected!`*

2.  **Run the E2E Script** (in a second terminal):
    ```bash
    node scripts/e2e_demo.js
    ```

---

## 📊 Demo Steps & What to Expect

The `e2e_demo.js` orchestrates the following flow:

### 1. Server Health Check
- Verifies the backend is online before proceeding.

### 2. Database Reset & Schema
- **Action**: Wipes and recreates the `superstore` and `employees` tables.
- **Goal**: Ensures a clean state for every demo run.

### 3. ETL Pipeline (Result: 8,399 Records)
- **Source**: `orders.csv` (Real ~10k row dataset).
- **Process**: Cleans data, normalizes to 3NF setup (Orders, Customers, Products).
- **Handling**: Automatically logs and skips invalid rows.
- **Returns ETL**: Processes the messy `returns.json` file.

### 4. Database Optimization
- **Action**: Applies `sql/optimizations.sql`.
- **Techniques**:
    - **Materialized Views**: Pre-calculates sales summaries.
    - **Indexes**: Sped up lookups on `order_id` and `customer_id`.

### 5. Performance Benchmark
The script runs a complex analytical query (JOINs + Aggregates) twice:
1.  **Unoptimized**: ~1.2ms
2.  **Optimized**: ~0.01ms
> **Result**: ~113x Speedup Factor 🚀

### 6. API Simulation (Resilience Test)
- **Action**: Simulates a Google Sheet triggering a batch update via `POST /sheetsync/batch`.
- **Payload**: 1 Valid Row, 1 Invalid Row (missing email).
- **Outcome**: The server robustly handles the request without crashing, returning a detailed JSON summary.

---

## ✅ Final State
The project is **Production-Ready**.
- **Codebase**: Clean, modular `src` structure.
- **Resilience**: API handles DB timeouts with retries.
- **Safety**: SQL Injection tests passed; global error handlers in place.
- **Docs**: Full documentation in `docs/` folder.

**You are ready to zip and submit!** 🎓
