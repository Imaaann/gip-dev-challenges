import express from "express";
import { migrate, pool } from "./db";
import { router as lostRouter } from "./problems/lostfound/router";
import { router as authRouter } from "./problems/auth/router";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware";

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use("/api/lostfound", lostRouter);
app.use("/api/auth", authRouter);
app.use(errorHandler);

app.get("/health", async (req, res) => { 
    const { rows } = await pool.query("SELECT now() AS time");
    res.json({
        ok: true,
        dbTime: rows[0].time
    });
})

const port = Number(process.env.PORT) || 8000;

console.log("Starting Migrations");
migrate();
console.log("Migrations done!");

app.listen(port, () => { 
    console.log(`GIP-API Running on port ${port}`);
})