# 📌 Task 5: SQL Development & Optimization

**Status**: ✅ Completed
**Date**: 2025-12-14

## 1. SQL Artifacts developed
We created a modular SQL architecture in the `sql/` directory:
*   **Queries**: Complex aggregations and JOINs.
*   **Views**: `v_sales_summary` for simplified BI reporting.
*   **Procedures**: `sp_get_customer_history` for encapsulated business logic.

## 2. Performance Analysis (Optimization)
We validated the performance of our Indexing strategy using `EXPLAIN ANALYZE`.

### Query: Date Range Filtering
```sql
SELECT * FROM orders WHERE order_date BETWEEN '2016-01-01' AND '2016-12-31';
```

### Execution Plan Result
```
Index Scan using idx_orders_date on orders  
(cost=0.14..8.16 rows=1 width=374) 
(actual time=0.012..0.014 rows=2 loops=1)
Execution Time: 0.043 ms
```
**Conclusion**: The database **used the index** (`idx_orders_date`) instead of a generic Sequential Scan. This confirms our optimization strategy is working, delivering sub-millisecond response times (`0.043 ms`).

## 3. Reporting Metrics (Sample Output)

### Sales by Region
| Region | Total Orders | Revenue | Profit |
| :--- | :--- | :--- | :--- |
| **South** | 2 | $2,996.32 | $791.34 |
| **West** | 1 | $29.24 | $13.74 |

### Top Customers
1.  **Claire Gute**: $2,981.70 (Consumer Segment)
2.  **Darrin Van Huff**: $29.24
3.  **Sean O'Donnell**: $14.62

## 4. Automation Scripts
Included `scripts/run-sql.js` to automatically execute these queries against any connected environment (Local or Docker).
