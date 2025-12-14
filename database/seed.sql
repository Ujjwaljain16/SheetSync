-- =============================================
-- Seed Data for Global Superstore
-- =============================================

-- Seed Locations
INSERT INTO locations (city, state, country, region) VALUES
('Henderson', 'Kentucky', 'United States', 'South'),
('Los Angeles', 'California', 'United States', 'West'),
('Fort Lauderdale', 'Florida', 'United States', 'South')
ON CONFLICT (city, state, country) DO NOTHING;

-- Seed Customers
INSERT INTO customers (customer_id, customer_name, segment) VALUES
('CG-12520', 'Claire Gute', 'Consumer'),
('DV-13045', 'Darrin Van Huff', 'Corporate'),
('SO-20335', 'Sean O''Donnell', 'Consumer')
ON CONFLICT (customer_id) DO NOTHING;

-- Seed Products
INSERT INTO products (product_id, category, sub_category, product_name) VALUES
('FUR-BO-10001798', 'Furniture', 'Bookcases', 'Bush Somerset Collection Bookcase'),
('FUR-CH-10000454', 'Furniture', 'Chairs', 'Hon Deluxe Fabric Upholstered Stacking Chairs'),
('OFF-LA-10000240', 'Office Supplies', 'Labels', 'Self-Adhesive Address Labels')
ON CONFLICT (product_id) DO NOTHING;

-- Seed Orders
INSERT INTO orders (order_id, order_date, ship_date, ship_mode, customer_id, location_id) VALUES
('CA-2016-152156', '2016-11-08', '2016-11-11', 'Second Class', 'CG-12520', 1),
('CA-2016-138688', '2016-06-12', '2016-06-16', 'Second Class', 'DV-13045', 2),
('US-2015-108966', '2015-10-11', '2015-10-18', 'Standard Class', 'SO-20335', 3)
ON CONFLICT (order_id) DO NOTHING;

-- Seed Order Items
INSERT INTO order_items (order_id, product_id, sales, quantity, discount, profit) VALUES
('CA-2016-152156', 'FUR-BO-10001798', 261.96, 2, 0.0, 41.91),
('CA-2016-152156', 'FUR-CH-10000454', 731.94, 3, 0.0, 219.58),
('US-2015-108966', 'OFF-LA-10000240', 14.62, 2, 0.0, 6.87);
