-- Held transactions table for POS
-- Allows persisting incomplete transactions so they survive browser refresh/crash

CREATE TABLE IF NOT EXISTS held_transactions (
  id BIGSERIAL PRIMARY KEY,
  local_id BIGINT NOT NULL,
  user_id UUID REFERENCES users(id),
  items JSONB NOT NULL,
  payment_method TEXT DEFAULT 'Tunai',
  status TEXT DEFAULT 'held',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_held_transactions_user_id ON held_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_held_transactions_status ON held_transactions(status);
CREATE INDEX IF NOT EXISTS idx_held_transactions_local_id ON held_transactions(local_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_held_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_held_transactions_updated_at_trigger ON held_transactions;
CREATE TRIGGER update_held_transactions_updated_at_trigger
BEFORE UPDATE ON held_transactions
FOR EACH ROW EXECUTE FUNCTION update_held_transactions_updated_at();
