-- Disable RLS for mitra_settlements and mitra_settlement_items
-- The app uses custom auth via users table, not Supabase Auth
-- So RLS with "TO authenticated" won't work properly

ALTER TABLE mitra_settlements DISABLE ROW LEVEL SECURITY;
ALTER TABLE mitra_settlement_items DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Admin can do everything on mitra_settlements" ON mitra_settlements;
DROP POLICY IF EXISTS "Admin can do everything on mitra_settlement_items" ON mitra_settlement_items;
