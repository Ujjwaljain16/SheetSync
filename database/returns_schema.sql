-- Task 7: Schema for Returns Data
CREATE TABLE IF NOT EXISTS returns (
    return_id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    returned VARCHAR(10),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Note: We initially do NOT add a Foreign Key constraint to 'orders'
-- This allows us to load 'messy' data (orphaned returns) first, 
-- and then clean it up or analyze it later.
