CREATE TABLE IF NOT EXISTS products(
    product_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    CONSTRAINT ck_quantity CHECK (quantity >= 0)
);

CREATE TABLE IF NOT EXISTS purchases(
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    product_id INTEGER NOT NULL,
    CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products(product_id)
)
