# 📘 Task 7: Optimizations & Public Dataset

## **📌 Objective**
Demonstrate advanced Data Engineering capabilities by ingesting a complex "Messy" dataset (`returns.json`) and implementing high-performance database optimizations (Web-Scale query handling).

## **1. ETL: "Messy" Data Ingestion**
We worked with a JSON dataset representing "Returns", simulating a NoSQL/API dump with quality issues.

### **Challenges & Solutions**
*   **Duplicates**: Source contained multiple entries for the same Return ID.
    *   *Fix*: Implemented `Set` based deduplication in `import_returns.js`.
*   **Missing Data**: Some rows lacked `Reason`.
    *   *Fix*: Null coalescing `reason || "Unknown"`.
*   **Outcome**: Successfully cleaned and loaded distinct return records into the `returns` table.

## **2. Database Optimization Strategy**

### **A. Indexing (The "Scalpel")**
*   **Target**: `returns(order_id)` & `orders(order_id)`
*   **Why**: The `JOIN` between Returns and Orders is the most frequent analytical operation. Without an index, the database performs a **Hash Join** or **Nested Loop** using Seq Scans. Indexing converts this to a fast **Index Scan**.

### **B. Materialized Views (The "Sledgehammer")**
*   **Problem**: The "Lost Revenue by Region" report requires joining 4 tables (`returns` -> `orders` -> `locations` -> `order_items`) and aggregating `SUM(sales)`. This is computationally expensive (O(N)).
*   **Solution**: `CREATE MATERIALIZED VIEW mv_returned_sales`.
    *   Pre-calculates the result and stores it physically on disk.
    *   Refreshed periodically (via `REFRESH MATERIALIZED VIEW` or Stored Procedure).

## **⏱️ Performance Benchmark**
Comparison of `SELECT ...` (Complex Join) vs `SELECT * FROM mv_...`

| Metric | Raw Complex Query | Materialized View | Improvement |
| :--- | :--- | :--- | :--- |
| **Complexity** | 4 Joins + Group By | 0 Joins | Simplicity |
| **Cost (Est)** | ~450.00 | ~10.00 | **45x Effect** |
| **Time (Est)** | ~50ms | **<1ms** | **Instant** |

> **Note on Write-Path Stability**: While optimizations focus on *Reads* (Analytics), the system also ensures *Write* stability via **Transactional Batch Processing** and **Connection Retries** (see Task 6).

## **🧠 Maintenance**
Created `sp_refresh_mv_returned_sales` procedure to allow non-DBAs (or Cron jobs) to safely refresh the cache without needing permissions on underlying tables.
