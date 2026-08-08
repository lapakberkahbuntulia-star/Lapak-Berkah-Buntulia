-- Auto-fill null category_id, type_id, and mitra_id for existing products
-- Safe to run multiple times

-- 1. Ensure fallback category 'Umum' exists
INSERT INTO categories (name)
SELECT 'Umum'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Umum');

-- 2. Ensure fallback type 'Umum' exists
INSERT INTO product_types (name)
SELECT 'Umum'
WHERE NOT EXISTS (SELECT 1 FROM product_types WHERE name = 'Umum');

-- 3. Update products with null category_id
UPDATE products
SET category_id = (
  SELECT id FROM categories WHERE name = 'Umum' LIMIT 1
)
WHERE category_id IS NULL;

-- 4. Update products with null type_id
UPDATE products
SET type_id = (
  SELECT id FROM product_types WHERE name = 'Umum' LIMIT 1
)
WHERE type_id IS NULL;

-- 5. Update products with null mitra_id using first active mitra
UPDATE products
SET mitra_id = (
  SELECT id FROM mitra WHERE status = 'Aktif' ORDER BY created_at ASC LIMIT 1
)
WHERE mitra_id IS NULL;

-- 6. Show updated products
SELECT 
  p.id,
  p.nama_produk,
  p.sku,
  c.name AS category,
  t.name AS type,
  m.full_name AS mitra
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
LEFT JOIN product_types t ON t.id = p.type_id
LEFT JOIN mitra m ON m.id = p.mitra_id
ORDER BY p.created_at DESC;
