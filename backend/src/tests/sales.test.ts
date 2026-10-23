import { describe, expect, it } from "vitest";
import { call_sale, TAG, make_product, make_report } from "./helper";
import { randomUUID } from "crypto";

const ADMIN_KEY = process.env.ADMIN_KEY;

describe("create product", () => {
    it("creates a product and returns 200", async () => {
        const res = await call_sale(
            "POST",
            "",
            {
                name: `SALE-${TAG}`,
                quantity: Math.floor(Math.random() * 256) + 1,
            },
            {
                Authorization: ADMIN_KEY,
            },
        );

        expect(res.status).toBe(201);
        expect(res.body.data.name).toBe(`SALE-${TAG}`);
    });

    it("401 On fake personelle", async () => {
        const res = await call_sale(
            "POST",
            "",
            {
                name: `SALE-${TAG}`,
                quantity: Math.floor(Math.random() * 256) + 1,
            },
            {
                Authorization: "skindread-deadhead",
            },
        );

        expect(res.status).toBe(401);
    });

    it("401 On no header", async () => {
        const res = await call_sale("POST", "", {
            name: `SALE-${TAG}`,
            quantity: Math.floor(Math.random() * 256) + 1,
        });

        expect(res.status).toBe(401);
    });
});

const buy = async (product_id: number, username = "u", key = randomUUID()) => {
    return await call_sale(
        "POST",
        "/buy",
        { username, product_id },
        { "Idempotency-Key": key },
    );
};

async function stock(product_id: number) {
    const res = await call_sale("GET", "");
    return res.body.data.find((p: any) => p.product_id === product_id)
        .quantity as number;
}

describe("buy", () => {
    it("buys one unit and replays from same key", async () => {
        const id = await make_product(5);
        const key = randomUUID();
        const buy_A = await buy(id, "Orion", key);
        const buy_B = await buy(id, "Orion", key);

        expect(buy_A.status).toBe(201);
        expect(buy_B.status).toBe(200);
        expect(buy_B.body.purchase_id).toBe(buy_A.body.purchase_id);
        expect(await stock(id)).toBe(4);
    });

    it("409 When sold out", async () => {
        const id = await make_product(1);
        expect((await buy(id, "Dabb")).status).toBe(201);
        expect((await buy(id, "Naymuth")).status).toBe(409);
    });

    it("race 50 buys 5 products", async () => {
        const id = await make_product(5);
        const rs = await Promise.all(
            Array.from({ length: 50 }).map((_, i) => buy(id, `u${i}`)),
        );

        expect(rs.filter((r) => r.status === 201)).toHaveLength(5);
        expect(rs.filter((r) => r.status === 409)).toHaveLength(45);
        expect(await stock(id)).toBe(0);
    });

    it("race 10 by same person, idempotent", async () => {
        const id = await make_product(5);
        const key = randomUUID();
        const rs = await Promise.all(
            Array.from({ length: 10 }).map((_, i) => buy(id, "Exo", key)),
        );

        expect(rs.filter((r) => r.status === 201)).toHaveLength(1);
        expect(rs.filter((r) => r.status === 200)).toHaveLength(9);
        expect(await stock(id)).toBe(4);
    });
});
