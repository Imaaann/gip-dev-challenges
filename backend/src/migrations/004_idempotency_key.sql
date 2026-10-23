ALTER TABLE purchases
    ADD COLUMN idempotency_key UUID NOT NULL,
    ADD CONSTRAINT uq_purchase_key UNIQUE (username, idempotency_key);