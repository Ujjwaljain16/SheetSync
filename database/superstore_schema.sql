-- =============================================
-- Database Schema for Global Superstore (3NF)
-- =============================================

-- 1. Locations Table (Normalized to remove redundancy)
CREATE TABLE locations (
    location_id SERIAL PRIMARY KEY,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    region VARCHAR(50),
    CONSTRAINT uq_location UNIQUE (city, state, country)
);

-- 2. Customers Table
CREATE TABLE customers (
    customer_id VARCHAR(50) PRIMARY KEY, -- Using Source ID (e.g., AB-10015)
    customer_name VARCHAR(100) NOT NULL,
    segment VARCHAR(50) CHECK (segment IN ('Consumer', 'Corporate', 'Home Office'))
);

-- 3. Products Table
CREATE TABLE products (
    product_id VARCHAR(50) PRIMARY KEY, -- Using Source ID (e.g., FUR-BO-10001798)
    category VARCHAR(50) NOT NULL,
    sub_category VARCHAR(50) NOT NULL,
    product_name TEXT NOT NULL
);

-- 4. Orders Table (The Transaction Header)
CREATE TABLE orders (
    order_id VARCHAR(50) PRIMARY KEY, -- One Order ID has many Items
    order_date DATE NOT NULL,
    ship_date DATE,
    ship_mode VARCHAR(50),
    customer_id VARCHAR(50) REFERENCES customers(customer_id),
    location_id INT REFERENCES locations(location_id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Order Items Table (The Transaction Details)
CREATE TABLE order_items (
    item_id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id VARCHAR(50) REFERENCES products(product_id),
    sales DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    discount DECIMAL(4, 2) DEFAULT 0.0,
    profit DECIMAL(10, 2) NOT NULL
);

-- Indexes for High Performance
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_items_product ON order_items(product_id);
