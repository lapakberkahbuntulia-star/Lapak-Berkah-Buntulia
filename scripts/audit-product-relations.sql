-- Report only: do not change data yet
-- Run this first to see the actual state

SELECT 
  p.id,
  p.nama_produk,
  p.sku,
  p.category_id,
  p.type_id,
  p.mitra_id,
  c.name AS category_name,
  t.name AS type_name,
  m.full_name AS mitra_name,
  m.email AS mitra_email
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
LEFT JOIN product_types t ON t.id = p.type_id
LEFT JOIN mitra m ON m.id = p.mitra_id
ORDER BY p.created_at DESC;
