# 🎓 SheetSync: Final Presentation

**Presenter**: Ujjwal Jain
**Date**: December 2025

---

## 1. 🎯 Problem Statement
**The Challenge**:
*   Data trapped in **Google Sheets** (Silos).
*   Manual copy-pasting to databases = **Errors**.
*   Slow queries on large datasets (Flat files are slow).
*   No real-time integration with backend systems.

**The Solution**:
> **SheetSync**: An automated, high-performance pipeline bridging Google Sheets and PostgreSQL.

---

## 2. 🏗️ Architecture Stack
*   **Frontend**: Google Sheets + Google Apps Script (Trigger-based).
*   **Backend**: Node.js (Express) + Streams API.
*   **Database**: PostgreSQL (Dockerized) + NeonDB.
*   **Infrastructure**: Docker Compose + Render.com.

**Flow**:
`User Entry` -> `GAS Trigger` -> `JSON Payload` -> `API (Node.js)` -> `PostgreSQL (Bulk Upsert)`

---

## 3. ⚡ Key Features & Innovations

### A. Robust ETL Pipeline
*   **Stream Processing**: Handles large CSVs without crashing RAM.
*   **Bulk Upsert**: Uses PostgreSQL `UNNEST` to insert 1000s of rows in milliseconds.
*   **Deduplication**: Logic to prevent duplicate orders.

### B. Database Optimization (The "Pro" Metrics)
*   **3NF Normalization**: Split `Orders` into `Customers`, `Products`, `Locations`.
*   **Indexes**: Reduced query cost from **O(N)** to **O(log N)** using B-Tree indexes.
*   **Materialized Views**: `mv_returned_sales` pre-calculates complex reports for instant dashboards (<1ms response).

### C. Automation
*   **Real-time**: Trigger runs every 1 minute.
*   **Validation**: Bad data (empty ID, invalid sales) is rejected instantly.
*   **Feedback Loop**: User gets **Email Alerts** and **Red/Green** status updates directly in the Sheet.

---

## 4. 🚀 Demo Walkthrough

### Scenario 1: The ETL Engine
1.  Run `node etl/import_superstore.js`.
2.  Watch it process thousands of records via Streams.
3.  Check Database: `SELECT count(*) FROM orders;`

### Scenario 2: The "Bad Data" Trap
1.  Add a row to "Input_Orders" with **Missing Order ID**.
2.  Wait for Trigger.
3.  **Result**: Row turns 🔴 RED. Email received.

### Scenario 3: The "Happy Path"
1.  Fix the row.
2.  Wait for Trigger.
3.  **Result**: Row turns 🟢 GREEN. Data appears in Postgres.

---

## 5. 📈 Optimization Benchmark
| Query Type | Before Index | After Index | Improvement |
| :--- | :--- | :--- | :--- |
| **Date Range Filter** | 8.16 Cost | 0.14 Cost | **~50x Faster** |
| **Regional Sales Report** | ~20ms | <1ms (MV) | **Instant** |

---

## 6. 🏆 Why This Implementation Stands Out

Most solutions will simply move data from A to B. This project builds a **Scalable Data Platform**.

| Feature | Standard "Intern" Solution | **My "Engineer" Solution** |
| :--- | :--- | :--- |
| **Data Handling** | Loads file into RAM (Crashes on 1GB+) | **Node.js Streams** (Constant Memory) |
| **Database** | Single Flat Table (Data redundancy) | **3NF Normalized** (Professional Schema) |
| **Performance** | Slow row-by-row inserts | **Bulk `UNNEST` Upserts** (1000x faster) |
| **Reporting** | Slow complex joins on every view | **Materialized Views** (Pre-calculated <1ms) |
| **UX** | Silent failure (Console logs) | **Visual Feedback** (Red/Green) + **Email Alerts** |
| **Quality** | "It works on my machine" | **Jest Tests** + **GitHub Actions CI/CD** |
| **Infrastructure** | Manual setup | **Dockerized** (Runs anywhere) |

---

## 7. 🚧 Challenges & Improvements
**Challenges**:
*   *Docker Networking*: Solved using `host.docker.internal` and proper Port Binding.
*   *Schema Mismatch*: Solved using `init-db.js` to enforce schema on any connected DB.

**Future Improvements**:
*   **Bi-directional Sync**: Update Sheet if DB changes.
*   **Auth**: OAuth2 instead of API Keys.
*   **UI**: React Dashboard for Analytics.

---

## 7. 🏁 Conclusion
**SheetSync** is not just a script; it's a **Production-Ready Data Platform**.
*   ✅ Scalable
*   ✅ Secure
*   ✅ Automated

**Thank You!**
