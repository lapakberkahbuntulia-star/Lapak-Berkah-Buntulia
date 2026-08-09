-- Hash all existing plaintext passwords in the users table
-- Run this AFTER running password-hashing-migration.sql
-- WARNING: This will permanently change all passwords. Users will need to use their current plaintext passwords to login,
-- but after this migration, the database will store bcrypt hashes instead.

UPDATE users
SET password = crypt(password, gen_salt('bf', 10))
WHERE password IS NOT NULL
  AND password != ''
  AND password !~ '^\$2[aby]\$';

-- Verify the migration
SELECT 
  id, 
  email, 
  role, 
  CASE 
    WHEN password ~ '^\$2[aby]\$' THEN 'HASHED' 
    ELSE 'PLAINTEXT (ERROR!)' 
  END as password_status,
  length(password) as hash_length
FROM users;
