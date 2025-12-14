-- =============================================
-- Task 5: Database Views (Reporting Layers)
-- =============================================

-- View 1: v_sales_summary
-- Simplifies complex joins for the Dashboard
CREATE OR REPLACE VIEW v_sales_summary AS
SELECT 
    o.order_date,
    p.category,
    p.sub_category,
    l.state,
    SUM(oi.sales) as daily_sales,
    SUM(oi.profit) as daily_profit
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.product_id
JOIN locations l ON o.location_id = l.location_id
GROUP BY o.order_date, p.category, p.sub_category, l.state;

-- Usage: SELECT * FROM v_sales_summary WHERE state = 'California';
