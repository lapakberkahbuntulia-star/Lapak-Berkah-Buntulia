-- Prevent negative stock values in products table
-- Run this after deploying the atomic decrement RPC

-- First, fix any existing negative stock values
UPDATE products SET stock = 0 WHERE stock < 0;

-- Add CHECK constraint to prevent future negative stock
ALTER TABLE products ADD CONSTRAINT products_stock_non_negative CHECK (stock >= 0);
