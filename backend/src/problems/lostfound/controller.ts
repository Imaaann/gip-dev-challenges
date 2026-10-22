import z from "zod";
import { validateBody } from "../../middleware";
import { pool } from "../../db";

const reportSchema = z.object({
    id: z.uuid(),
    username: z.string(),
    title: z.string(),
    description: z.string(),
    type: z.enum(["lost", "found"]),
    created_at: z.date(),
    resolved_id: z.uuid().nullable(),
});

export const createReportSchema = reportSchema.pick({
    username: true,
    title: true,
    description: true,
    type: true,
});

type Report = z.infer<typeof reportSchema>;

type CreateReportDTO = z.infer<typeof createReportSchema>;

export async function createReport(data: CreateReportDTO) {
    const { rows } = await pool.query<Report>(
        "INSERT INTO reports (username, title, description, type) VALUES ($1,$2,$3,$4) RETURNING *",
        [data.username, data.title, data.description, data.type],
    );
    return rows[0];
}

export async function getAllReports() {
    // could add pagination... but eh
    // something something add a cursor for page and offset on the GET route
    const results = await pool.query<Report>("SELECT * FROM reports");
    return {
        count: results.rows.length,
        data: results.rows,
    };
}

export const searchSchema = z
    .object({
        type: z.enum(["lost", "found"]),
        title: z.string(),
        description: z.string(),
        resolved: z.stringbool(),
    })
    .partial();

type SearchOptions = z.infer<typeof searchSchema>;

export async function search(options: SearchOptions) {
    let parameter = 1;
    const filters = [];
    if (options.description) {
        filters.push({
            statement: `description ILIKE $${parameter}`,
            value: `%${options.description}%`,
        });
        parameter++;
    }

    if (options.title) {
        filters.push({
            statement: `title ILIKE $${parameter}`,
            value: `%${options.title}%`,
        });
        parameter++;
    }

    if (options.type) {
        filters.push({
            statement: `type = $${parameter}`,
            value: options.type,
        });
        parameter++;
    }

    if (options.resolved !== undefined) {
        if (options.resolved) {
            filters.push({
                statement: `resolved_id IS NOT NULL`,
            });
        } else {
            filters.push({
                statement: `resolved_id IS NULL`,
            });
        }
    }

    let whereClause = "";
    if (filters.length > 0) {
        whereClause = "WHERE " + filters.map((f) => f.statement).join(" AND ");
    }
    const values = filters.map((f) => f.value).filter((v) => v !== undefined);

    const results = await pool.query<Report>(
        `SELECT * FROM reports ${whereClause} ORDER BY created_at DESC`,
        values,
    );

    return {
        count: results.rows.length,
        data: results.rows,
    };
}

export const resolveDTOSchema = z.object({
    to_resolve: z.uuid(),
    resolved_id: z.uuid(),
    username: z.string(),
});

type ResolveDTO = z.infer<typeof resolveDTOSchema>;

export async function resolve(payload: ResolveDTO) {
    if (payload.resolved_id == payload.to_resolve)
        throw new Error("Id's of resolved and resolvee must differ");
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // So we'll make sure there actually exists both sides of the resolution.
        // We'll also lock them so nothing happens to them
        const results = await client.query<Report>(
            "SELECT * FROM reports WHERE id IN ($1, $2) ORDER BY id FOR UPDATE",
            [payload.to_resolve, payload.resolved_id],
        );

        // Some sanity checks
        if (results.rows.length !== 2) throw new Error("Rows not found");
        if (results.rows[0].type === results.rows[1].type)
            throw new Error("Need one lost, one found report pair");
        if (results.rows[0].resolved_id || results.rows[1].resolved_id)
            throw new Error("Already resolved");
        if (
            results.rows.find((r) => r.id === payload.to_resolve)!.username !==
            payload.username
        )
            throw new Error("Forbidden Operation");

        // Love Atomic instruction bs
        const update = await client.query<Report>(
            `UPDATE reports
             SET resolved_id = CASE id WHEN $1::uuid THEN $2::uuid ELSE $1::uuid END
             WHERE id IN ($1, $2) RETURNING *
            `,
            [payload.to_resolve, payload.resolved_id],
        );

        await client.query("COMMIT");
        return update.rows;
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

export const getItemSchema = reportSchema.pick({
    id: true,
});

type GetItemDTO = z.infer<typeof getItemSchema>;

export async function getItem(payload: GetItemDTO) {
    const { rows } = await pool.query<Report>(
        "SELECT * FROM reports WHERE id = $1",
        [payload.id],
    );

    return rows[0];
}

export const editItemDTOSchema = reportSchema
    .partial()
    .pick({
        title: true,
        description: true,
    })
    .extend({
        id: z.uuid(),
        username: z.string(),
    });

type EditDTO = z.infer<typeof editItemDTOSchema>;

export async function editItem(payload: EditDTO) {
    const { rows } = await pool.query<Report>(
        `UPDATE reports
       SET title = COALESCE($3, title), description = COALESCE($4, description)
       WHERE id = $1 AND username = $2
       RETURNING *
      `,
        [payload.id, payload.username, payload.title, payload.description],
    );

    return rows[0] ?? null;
}
