-- =============================================
-- Task 5: Stored Procedures
-- =============================================

-- Procedure: Get Customer History
-- Returns all purchases for a given customer ID
CREATE OR REPLACE FUNCTION sp_get_customer_history(p_customer_id VARCHAR)
RETURNS TABLE (
    order_date DATE,
    product_name TEXT,
    quantity INT,
    sales DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.order_date,
        p.product_name,
        oi.quantity,
        oi.sales
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    JOIN products p ON oi.product_id = p.product_id
    WHERE o.customer_id = p_customer_id
    ORDER BY o.order_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Procedure: Maintenance - Refresh Materialized Views
-- call sp_refresh_materialized_views();
CREATE OR REPLACE PROCEDURE sp_refresh_materialized_views()
LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW mv_returned_sales;
    RAISE NOTICE 'Materialized views refreshed successfully.';
END;
$$;
