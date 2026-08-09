-- Atomic stock decrement RPC
-- Prevents race conditions during checkout by doing check-and-update in a single DB operation

CREATE OR REPLACE FUNCTION decrement_product_stock(
  p_product_id UUID,
  p_qty INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE products
  SET stock = stock - p_qty
  WHERE id = p_product_id AND stock >= p_qty;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;
