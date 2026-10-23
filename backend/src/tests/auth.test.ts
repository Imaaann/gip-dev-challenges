import { describe, it, expect, beforeAll } from "vitest";
import { call_auth, newEmail } from "./helper";

const email = newEmail();
const password = "GIP-dev-challenge-123";

describe("signup", () => {
    it("creates a user w/o leaking the hash", async () => {
        const result = await call_auth("POST", "/signup", { email, password });
        expect(result.status).toBe(201);
        expect(result.body.email).toBe(email);
        expect(JSON.stringify(result.body)).not.toContain("password");
    });

    it("409 On duplicate email", async () => {
        expect(
            (await call_auth("POST", "/signup", { email, password })).status,
        ).toBe(409);
    });
    it("409 On duplicate email case", async () => {
        expect(
            (
                await call_auth("POST", "/signup", {
                    email: email.toUpperCase(),
                    password,
                })
            ).status,
        ).toBe(409);
    });
    it("400 on invalid email", async () => {
        expect(
            (await call_auth("POST", "/signup", { email: "x", password }))
                .status,
        ).toBe(400);
    });
    it("400 on missing password", async () => {
        expect(
            (await call_auth("POST", "/signup", { email: newEmail() })).status,
        ).toBe(400);
    });
    it("400 on short password", async () => {
        expect(
            (
                await call_auth("POST", "/signup", {
                    email: newEmail(),
                    password: "x",
                })
            ).status,
        ).toBe(400);
    });
});

describe("login", () => {
    it("logs in and returns access token", async () => {
        const result = await call_auth("POST", "/login", { email, password });
        expect(result.status).toBe(200);
        expect(result.body.accessToken).toBeTruthy();
        expect(result.body.user.email).toBe(email);
        expect(JSON.stringify(result.body)).not.toContain("password");
    });

    it("sets a HttpOnly Refresh Cookie scoped to /api/auth", async () => {
        const result = await call_auth("POST", "/login", { email, password });
        const cookie = result.cookies!.find((c) =>
            c.startsWith("refresh_token"),
        );
        expect(cookie).toMatch(/HttpOnly/i);
        expect(cookie).toMatch(/Path=\/api\/auth/i);
    });

    it("access token carries sub and a 15 minute expiry", async () => {
        const result = await call_auth("POST", "/login", { email, password });
        const parsed = JSON.parse(
            Buffer.from(
                result.body.accessToken.split(".")[1],
                "base64",
            ).toString(),
        );
        expect(parsed.sub).toBe(String(result.body.user.user_id));
        expect(parsed.exp - parsed.iat).toBe(15 * 60);
    });
});

describe("failed logins", () => {
    it("401 on wrong password", async () => {
        expect(
            (await call_auth("POST", "/login", { email, password: "wrong123465" }))
                .status,
        ).toBe(401);
    });
    it("401 on unknown email", async () => {
        expect(
            (await call_auth("POST", "/login", { email: newEmail(), password }))
                .status,
        ).toBe(401);
    });
    it("wrong password and unknown email are identical", async () => {
        const wrong_pass = await call_auth("POST", "/login", {
            email,
            password: "wrong123465",
        });
        const wrong_email = await call_auth("POST", "/login", {
            email: newEmail(),
            password,
        });
        expect(wrong_pass.status).toBe(wrong_email.status);
        expect(wrong_pass.body).toStrictEqual(wrong_email.body);
    });
    it("sets no cookies on failure", async () => {
        expect(
            (await call_auth("POST", "/login", { email, password: "x" }))
                .cookies,
        ).toHaveLength(0);
    });
});
