-- Insert user accounts for mitra that don't have one yet
-- Default password: mitra123
-- Safe to run multiple times

INSERT INTO users (nama, email, password, role)
SELECT 
  m.full_name,
  m.email,
  'mitra123',
  'mitra'
FROM mitra m
WHERE NOT EXISTS (
  SELECT 1 FROM users u 
  WHERE u.email = m.email 
  AND u.role = 'mitra'
);

-- Show inserted accounts
SELECT 
  m.full_name AS mitra_name,
  m.email,
  u.role,
  u.created_at
FROM mitra m
JOIN users u ON u.email = m.email AND u.role = 'mitra'
ORDER BY u.created_at DESC;
