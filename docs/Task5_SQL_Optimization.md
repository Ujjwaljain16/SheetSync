# 📌# 📘 Task 5: SQL Development & Optimization

## **📌 Objective**
Develop analytical queries, views, and stored procedures to extract business intelligence from the normalized database, and optimize query performance using indexing strategies.

## **📊 Analytical Reporting**
We answered key business questions using complex SQL Joins:

### 1. Top Performing Regions
*   **Query**: Aggregated `SUM(sales)` joined across `orders` and `locations`.
*   **Insight**: **West** is the leading region, followed closely by **Ontario**.
*   **SQL Feature**: `GROUP BY`, `ORDER BY DESC`, `JOIN` (4 tables).

### 2. Best Customers (Golden Cohort)
*   **Query**: Ranked customers by total lifetime value (LTV).
*   **Result**:
    1.  **Emily Phan**
    2.  **Alejandro Grove**
*   **SQL Feature**: `SUM()` aggregation on `order_items` grouped by `customer_name`.

## **🛡️ Database Objects**

### Views
*   **`v_order_summary`**: Abstraction layer that joins Orders, Customers, and Items. Allows analysts to query `SELECT * FROM v_order_summary` without writing joins every time.

### Stored Procedures
*   **`sp_get_monthly_sales(year INT)`**: Encapsulated logic to generate monthly sales reports. Accepts parameters to filter dynamically.

## **⚡ Performance Optimization**
*   **Problem**: Querying sales by `Order Date` was performing a full table scan (`Seq Scan`) on the `orders` table.
*   **Solution**: Created B-Tree Index `idx_orders_date`.
*   **Impact**:
    *   **Before**: Cost ~154.00 (Seq Scan)
    *   **After**: Cost ~8.00 (Index Scan)
*   **Verification**: Validated using `EXPLAIN ANALYZE`.
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

### Sales by Region (Actual Data)
| Region | Total Orders | Revenue |
| :--- | :--- | :--- |
| **West** | 1,277 | $6,981,888.58 |
| **Ontario** | 1,175 | $6,130,793.90 |
| **Prarie** | 1,111 | $5,615,340.88 |

### Top Customers
1.  **Emily Phan**: $194,022.38
2.  **Alejandro Grove**: $167,123.86
3.  **John Lucas**: $159,392.38

## 4. Automation Scripts
Included `scripts/run-sql.js` to automatically execute these queries against any connected environment (Local or Docker).
