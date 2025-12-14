-- =============================================
-- Task 5: Analytical Queries (Superstore)
-- =============================================

-- 1. Aggregations: Total Sales and Profit by Region
SELECT 
    l.region,
    COUNT(DISTINCT o.order_id) as total_orders,
    SUM(oi.sales) as total_revenue,
    SUM(oi.profit) as total_profit,
    ROUND(AVG(oi.profit), 2) as avg_profit_per_item
FROM orders o
JOIN locations l ON o.location_id = l.location_id
JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY l.region
ORDER BY total_revenue DESC;

-- 2. JOIN-Heavy: Top 5 Customers by Spending
SELECT 
    c.customer_name,
    c.segment,
    COUNT(DISTINCT o.order_id) as orders_placed,
    SUM(oi.sales) as total_spend
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY c.customer_id, c.customer_name, c.segment
ORDER BY total_spend DESC
LIMIT 5;

-- 3. Detect Duplicates/Anomalies (Potential same person, different ID)
SELECT 
    customer_name, 
    COUNT(DISTINCT customer_id) as id_count 
FROM customers 
GROUP BY customer_name 
HAVING COUNT(DISTINCT customer_id) > 1;

-- 4. Performance Analysis: Explain Analyze for Date Range Query
-- Check cost before and after index (Index already added in Task 3)
EXPLAIN ANALYZE 
SELECT * FROM orders 
WHERE order_date BETWEEN '2016-01-01' AND '2016-12-31';
