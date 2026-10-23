import z from "zod";
import argon2 from "argon2";
import { pool } from "../../db";
import jwt from "jsonwebtoken";
import { exit } from "process";
import crypto from "node:crypto";
import { AuthError, ConflictError } from "../../errors";

export const JWT_SECRET = process.env.JWT_SECRET_KEY;

if (!JWT_SECRET) {
    console.error("JWT_SECRET_KEY Missing from environment variables");
    exit(1);
}

export const createUserDTOSchema = z.object({
    email: z.email().transform((s) => s.toLowerCase()),
    password: z.string().min(8),
});

type UserRow = {
    user_id: number;
    password_hash: string;
    email: string;
    created_at: Date;
};

type User = Omit<UserRow, "password_hash" | "created_at">;

export async function createUser(email: string, password: string) {
    email = email.toLowerCase();
    const password_hash = await argon2.hash(password);

    try {
        const result = await pool.query<User>(
            "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING user_id, email",
            [email, password_hash],
        );
        return result.rows[0];
    } catch (err) {
        if ((err as { code?: string }).code === "23505") {
            throw new ConflictError();
        }

        throw err;
    }
}

export async function issueTokens(user_id: number) {
    const token = jwt.sign({ sub: String(user_id) }, JWT_SECRET!, {
        expiresIn: "15m",
        algorithm: "HS256",
    });

    const refresh_token = crypto.randomBytes(36).toString("hex");
    const refresh_hash = crypto
        .createHash("sha256")
        .update(refresh_token)
        .digest("hex");

    await pool.query(
        "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, now() + interval '1 week')",
        [user_id, refresh_hash],
    );

    return {
        accessToken: token,
        refreshToken: refresh_token,
    };
}

export async function verify(email: string, password: string) {
    const { rows } = await pool.query(
        "SELECT user_id, email, password_hash FROM users WHERE email = $1",
        [email],
    );

    if (rows.length !== 1) {
        throw new AuthError();
    }

    if (!(await argon2.verify(rows[0].password_hash, password))) {
        throw new AuthError();
    }

    return {
        user_id: rows[0].user_id,
        email: rows[0].email,
    };
}

export async function refreshToken(refresh: string) {
    const refresh_hash = crypto
        .createHash("sha256")
        .update(refresh)
        .digest("hex");
    const result = await pool.query(
        "DELETE FROM refresh_tokens WHERE token_hash = $1 AND expires_at > now() RETURNING user_id",
        [refresh_hash],
    );

    if (result.rows.length != 1) {
        throw new AuthError();
    }

    const user_id = result.rows[0].user_id as number;
    const tokens = await issueTokens(user_id);
    return tokens;
}

export async function logout(refresh: string) {
  const refresh_hash = crypto
          .createHash("sha256")
          .update(refresh)
          .digest("hex");
   await pool.query(
          "DELETE FROM refresh_tokens WHERE token_hash = $1 AND expires_at > now()",
          [refresh_hash],
      );
}

export async function getUser(userId: number) {
    const results = await pool.query("SELECT email, created_at FROM users WHERE user_id = $1", [userId]);

    if (results.rows.length !== 1) {
        throw new AuthError();
    }

    return {
        email: results.rows[0].email,
        createdAt: results.rows[0].created_at,
        userId
    }
}
