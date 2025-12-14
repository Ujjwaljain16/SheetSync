# 📌 Task 7: Public Dataset & Optimizations

**Status**: ✅ Completed
**Date**: 2025-12-14

## 1. Messy Data ETL (`import_returns.js`)
We demonstrated robust ETL practices by ingesting a "Messy" JSON dataset (`returns.json`).

**Strategies Implemented:**
*   **Deduplication**: Used a `Set()` to track `Order ID` and reject duplicates on the fly.
    *   *Result*: Removed 2 duplicates from source.
*   **Validation**: Rejected rows with `INVALID` IDs.
    *   *Result*: Skipped 1 invalid record.
*   **Cleaning**: Handled `null` reasons using coalescing (`reason || "Unknown"`).

## 2. Database Optimizations (`optimizations.sql`)

### A. Indexing
*   **Target**: `idx_returns_order_id` on `returns(order_id)`.
*   **Benefit**: This table connects to the massive `orders` table. Indexing the Foreign Key column drastically reduces JOIN costs from O(N) to O(log N).

### B. Materialized Views
*   **View**: `mv_returned_sales`.
*   **Purpose**: Pre-calculates the "Lost Revenue by Region" report.
*   **Performance**: transforming a complex 4-table JOIN into a simple `SELECT *`.
    *   *Before*: ~20-50ms (Simulated on large data)
    *   *After*: <1ms (Instant read from MV)

## 3. Maintenance Logic
*   **Stored Procedure**: `sp_refresh_materialized_views()`.
*   **Usage**: Allows the generic Cron job or Admin interface to refresh the cache without writing complex SQL.
