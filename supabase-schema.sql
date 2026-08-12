CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'kasir', 'mitra')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mitra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Laki-laki', 'Perempuan')),
  photo TEXT,
  status TEXT NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Tidak Aktif')),
  total_transaction INTEGER DEFAULT 0,
  total_omzet DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_produk TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES categories(id),
  type_id UUID REFERENCES product_types(id),
  mitra_id UUID REFERENCES mitra(id),
  mitra_price DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'Pcs',
  photo TEXT,
  description TEXT,
  barcode_id TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  mitra_id UUID REFERENCES mitra(id),
  total DECIMAL(10,2) NOT NULL,
  paid DECIMAL(10,2),
  change DECIMAL(10,2) DEFAULT 0,
  metode_pembayaran TEXT CHECK (metode_pembayaran IN ('Tunai', 'QRIS', 'Transfer')),
  status TEXT NOT NULL DEFAULT 'Selesai' CHECK (status IN ('Selesai', 'Pending', 'Dibatalkan')),
  completed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  harga_satuan DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  type TEXT NOT NULL CHECK (type IN ('in', 'out')),
  quantity INTEGER NOT NULL,
  note TEXT,
  mitra_id UUID REFERENCES mitra(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pending_stock_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mitra_id UUID REFERENCES mitra(id),
  product_id UUID REFERENCES products(id),
  date DATE NOT NULL,
  quantity INTEGER NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO categories (name) VALUES
  ('Perishable'),
  ('Non-Perishable')
ON CONFLICT (name) DO NOTHING;

INSERT INTO product_types (name) VALUES
  ('Makanan Basah'),
  ('Makanan Kering'),
  ('Minuman'),
  ('Rokok'),
  ('Bumbu Dapur'),
  ('Lainnya')
ON CONFLICT (name) DO NOTHING;

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Hash existing plaintext passwords
UPDATE users
SET password = crypt(password, gen_salt('bf', 10))
WHERE password IS NOT NULL
  AND password != ''
  AND password !~ '^\$2[aby]\$';

-- Auto-hash passwords on insert/update
CREATE OR REPLACE FUNCTION hash_user_password()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.password IS NOT NULL AND NEW.password != '' THEN
    IF NEW.password !~ '^\$2[aby]\$' THEN
      NEW.password = crypt(NEW.password, gen_salt('bf', 10));
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS hash_user_password_trigger ON users;
CREATE TRIGGER hash_user_password_trigger
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION hash_user_password();

-- Secure login RPC
CREATE OR REPLACE FUNCTION login_user(p_email TEXT, p_password TEXT, p_role TEXT)
RETURNS TABLE(id UUID, email TEXT, role TEXT, nama TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.role, u.nama
  FROM users u
  WHERE u.email = p_email
    AND u.role = p_role
    AND u.password = crypt(p_password, u.password);
END;
$$ LANGUAGE plpgsql STABLE;
