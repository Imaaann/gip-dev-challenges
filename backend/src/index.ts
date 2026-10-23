import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import swaggerUi from "swagger-ui-express";
import express from "express";
import { migrate, pool } from "./db";
import { router as lostRouter } from "./problems/lostfound/router";
import { router as authRouter } from "./problems/auth/router";
import { router as saleRouter } from "./problems/flashsale/router";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware";

const app = express();

// Configuration
app.use(cookieParser());
app.use(express.json());
app.set("trust proxy", 1);

// API
app.use("/api/lostfound", lostRouter);
app.use("/api/auth", authRouter);
app.use("/api/sale", saleRouter);
app.get("/health", async (req, res) => {
    const { rows } = await pool.query("SELECT now() AS time");
    res.json({
        ok: true,
        dbTime: rows[0].time,
    });
});

// Documentation
const spec = YAML.parse(
    fs.readFileSync(path.join(process.cwd(), "openapi.yml"), "utf8"),
);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec));

// Frontend Static Serving
const publicDir = path.join(__dirname, "public");
app.use("/calculator", express.static(path.join(publicDir, "calculator")));
app.use(express.static(path.join(publicDir, "app")));

// Fall Backs & Errors
app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Command not found" });
});
app.use((req, res, next) => {
    if (req.method !== "GET") return next();
    res.sendFile(path.join(publicDir, "app", "index.html"));
});
app.use(errorHandler);


// Starting
const port = Number(process.env.PORT) || 8000;
async function start() {
  console.log("Starting Migrations");
  migrate();
  console.log("Migrations done!");
  app.listen(port, () => {
      console.log(`GIP-API Running on port ${port}`);
  });
}

start().catch((err) => { 
    console.error(err);
    process.exit(1);    
})



