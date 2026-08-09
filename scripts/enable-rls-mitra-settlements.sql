-- Enable RLS for mitra_settlements and mitra_settlement_items
ALTER TABLE mitra_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE mitra_settlement_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin can do everything on mitra_settlements" ON mitra_settlements;
DROP POLICY IF EXISTS "Admin can do everything on mitra_settlement_items" ON mitra_settlement_items;

-- Create policies for mitra_settlements
CREATE POLICY "Admin can do everything on mitra_settlements"
  ON mitra_settlements
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for mitra_settlement_items
CREATE POLICY "Admin can do everything on mitra_settlement_items"
  ON mitra_settlement_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
