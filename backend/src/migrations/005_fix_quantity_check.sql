ALTER TABLE products DROP CONSTRAINT IF EXISTS ck_quantity;
ALTER TABLE products ADD CONSTRAINT ck_quantity CHECK (quantity >= 0);