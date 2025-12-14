-- =============================================
-- Task 7: Database Optimizations
-- =============================================

-- 1. Indexing
-- Optimize joins between Returns and Orders which is a common analytical operation
CREATE INDEX IF NOT EXISTS idx_returns_order_id ON returns(order_id);

-- 2. Materialized View: Lost Revenue by Region
-- Expensive aggregation pre-calculated for dashboards
DROP MATERIALIZED VIEW IF EXISTS mv_returned_sales;

CREATE MATERIALIZED VIEW mv_returned_sales AS
SELECT 
    l.region,
    COUNT(r.return_id) as return_count,
    SUM(oi.sales) as lost_revenue
FROM returns r
JOIN orders o ON r.order_id = o.order_id
JOIN order_items oi ON o.order_id = oi.order_id
JOIN locations l ON o.location_id = l.location_id
GROUP BY l.region
ORDER BY lost_revenue DESC;

-- Index the view itself for faster read
CREATE INDEX idx_mv_returned_sales_region ON mv_returned_sales(region);
