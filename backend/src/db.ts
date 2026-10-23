import { Pool } from "pg";
import fs from "node:fs";
import path from "node:path";

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
});

const migrationTableSql = `
  CREATE TABLE IF NOT EXISTS migrations (
    file_name TEXT PRIMARY KEY,
    ran BOOLEAN
  )
`;

// Small migration function
export async function migrate() {
    await pool.query(migrationTableSql);
    const migrations = path.join(__dirname, "migrations");

    if (!fs.existsSync(migrations)) {
        throw new Error("No Migration folder found!");
    }

    const migrationFiles = fs
        .readdirSync(migrations)
        .sort()
        .map((fileName) => path.join(migrations, fileName))
        .filter((f) => path.extname(f) === ".sql");

    for (const filePath of migrationFiles) {
        const client = await pool.connect();

        try {
            const sql = fs.readFileSync(filePath, "utf-8");
            await client.query("BEGIN");
            const { rows } = await client.query(
                "SELECT * FROM migrations WHERE file_name = $1",
                [path.basename(filePath)],
            );
            if (rows[0] && rows[0].ran) {
                await client.query("COMMIT");
                continue;
            }

            await client.query(sql);
            await client.query(
                "INSERT INTO migrations (file_name, ran) VALUES ($1, $2)",
                [path.basename(filePath), true],
            );
            await client.query("COMMIT");
        } catch (err) {
            await client.query("ROLLBACK");
            console.error(`Migrations Failed, File Name: ${filePath}.`);
            throw err;
        } finally {
            client.release();
        }
    }
}
