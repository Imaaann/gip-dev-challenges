import z from "zod";
import { pool } from "../../db";
import { ConflictError, HttpError, NotFoundError } from "../../errors";

type Product = {
    product_id: number;
    name: string;
    quantity: number;
};

export async function getAllProducts() {
    const result = await pool.query<Product>("SELECT * FROM products");
    return {
        count: result.rows.length,
        data: result.rows,
    };
}

export const createProductSchema = z.object({
    name: z.string(),
    quantity: z.number().int().min(0),
});

export async function addProduct(name: string, quantity: number) {
    const result = await pool.query(
        "INSERT INTO products (name, quantity) VALUES ($1, $2) RETURNING *",
        [name, quantity],
    );

    return {
        count: result.rows.length,
        data: result.rows[0],
    };
}

export async function getProduct(name: string) {
    const products = await pool.query(
        "SELECT pur.id, p.name FROM purchases pur, products p WHERE p.product_id = pur.product_id AND pur.username = $1",
        [name],
    );

    return {
        count: products.rows.length,
        data: products.rows,
    };
}

export const buySchema = z.object({
    username: z.string(),
    product_id: z.number().int().min(1),
});

export async function buyitem(
    username: string,
    productid: number,
    key: string,
) {
    // We'll use transactions and Idempotent keys to prevent
    // 1. Any dead time where data races could corrupt state
    // 2. Any Accidental Double-clicks or network schenanigans
    // We love ACID compliance don't we .-. vive-sql

    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        const { rows } = await client.query(
            `INSERT INTO purchases (username, product_id, idempotency_key)
             VALUES ($1, $2, $3)
             ON CONFLICT (username, idempotency_key) DO NOTHING
             RETURNING *`,
            [username, productid, key],
        );

        if (rows.length === 0) {
            const old = await client.query("SELECT id, product_id FROM purchases WHERE username = $1 AND idempotency_key = $2", [username, key]);

            if (old.rows[0].product_id !== productid) {
                throw new HttpError(422, "idempotency key with a different product")
            }
            
            await client.query("COMMIT");
            return {
                purchase_id: old.rows[0].id as number,
                product_id: productid,
                username,
                key,
                replay: true,
            };
        }

        const purchase = await client.query(
            `UPDATE products
             SET quantity = quantity - 1
             WHERE product_id = $1
             AND quantity > 0`,
            [productid],
        );

        if (purchase.rowCount === 0) {
            throw new ConflictError("Stock is sold out.");
        }

        await client.query("COMMIT");
        return {
            purchase_id: rows[0].id as number,
            product_id: productid,
            username,
            key,
            replay: false,
        };
    } catch (err) {
        await client.query("ROLLBACK");
        if ((err as { code?: string }).code === "23503") {
            throw new NotFoundError();
        }

        throw err;
    } finally {
        client.release();
    }
}
