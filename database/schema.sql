-- Enable UUID extension if needed (optional, using SERIAL for ID as per plan)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS employees;

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    joined_at DATE,
    status TEXT CHECK(status IN ('ACTIVE', 'INACTIVE')),
    performance_score INTEGER,
    sync_id TEXT, -- To track which batch updated this row
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_sync_id ON employees(sync_id);
