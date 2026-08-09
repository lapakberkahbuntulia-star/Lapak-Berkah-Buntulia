-- Return/Refund transaction items
-- Run this migration to add return functionality

CREATE TABLE IF NOT EXISTS returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  transaction_item_id UUID REFERENCES transaction_items(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  reason TEXT,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_returns_transaction_id ON returns(transaction_id);
CREATE INDEX IF NOT EXISTS idx_returns_product_id ON returns(product_id);
