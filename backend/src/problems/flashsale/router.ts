import express from "express";
import {
    addProduct,
    buyitem,
    buySchema,
    createProductSchema,
    getAllProducts,
    getProduct,
} from "./controller";
import { adminOnly, validateBody } from "../../middleware";
import z from "zod";

const router = express.Router();

// To get all products
router.get("/", async (req, res) => {
    res.status(200).json(await getAllProducts());
});

// Add a new product
router.post(
    "/",
    adminOnly,
    validateBody(createProductSchema),
    async (req, res) => {
        const results = await addProduct(req.body.name, req.body.quantity);
        res.status(201).json(results);
    },
);

// Buying a certain product, ACID + Idempotent
router.post("/buy", validateBody(buySchema), async (req, res) => {
    const idempKey = z.uuid().safeParse(req.header("Idempotency-Key"));

    if (!idempKey.success) {
        res.status(400).json({
            error: "Idempotency Key must be a UUID",
        });
        return;
    }

    const purchase = await buyitem(
        req.body.username,
        req.body.product_id,
        idempKey.data,
    );

    res.status(purchase.replay ? 200 : 201).json(purchase);
});

// View the products bought by a certain user.
router.get("/view/:name", async (req, res) => {
    const purchases = await getProduct(req.params.name);
    res.status(200).json(purchases);
});

export { router };
