CREATE TABLE IF NOT EXISTS mitra_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mitra_id UUID REFERENCES mitra(id),
  invoice_number TEXT UNIQUE NOT NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  total_profit DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mitra_settlement_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_id UUID REFERENCES mitra_settlements(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  profit DECIMAL(12,2) NOT NULL
);
