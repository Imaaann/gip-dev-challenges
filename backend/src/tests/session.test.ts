import { beforeAll, describe, expect, it } from "vitest";
import { call_auth, login, newEmail } from "./helper";
import jwt from "jsonwebtoken";
const email = newEmail();
const password = "GIP-DEV-Challanges-session";
const cookieOf = (c: string) => ({ Cookie: c });

beforeAll(async () => {
    await call_auth("POST", "/signup", { email, password });
});

describe("logout", () => {
    it("204 and clears the cookie", async () => {
        const { cookie } = await login(email, password);
        const result = await call_auth(
            "POST",
            "/logout",
            undefined,
            cookieOf(cookie),
        );
        expect(result.status).toBe(204);
        expect(result.cookies?.join()).toMatch(/refresh_token=;/);
    });

    it("revokes the refresh token", async () => {
        const { cookie } = await login(email, password);
        await call_auth("POST", "/logout", undefined, cookieOf(cookie));
        expect(
            (await call_auth("POST", "/refresh", undefined, cookieOf(cookie)))
                .status,
        ).toBe(401);
    });

    it("204 with no cookie", async () => {
        expect((await call_auth("POST", "/logout")).status).toBe(204);
    });
    it("204 with stupid cookie", async () => {
        expect(
            (
                await call_auth(
                    "POST",
                    "/logout",
                    undefined,
                    cookieOf("refresh_token=spinning"),
                )
            ).status,
        ).toBe(204);
    });
    it("Only ends its session", async () => {
        const a = await login(email, password);
        const b = await login(email, password);
        await call_auth("POST", "/logout", undefined, cookieOf(a.cookie));
        expect(
            (await call_auth("POST", "/refresh", undefined, cookieOf(b.cookie)))
                .status,
        ).toBe(200);
    });
});

const bearer = (tok: string) => ({ Authorization: `Bearer ${tok}` });
describe("me", () => {
    it("returns the user without any hashes", async () => {
        const { accessToken } = await login(email, password);
        const res = await call_auth(
            "GET",
            "/me",
            undefined,
            bearer(accessToken),
        );

        expect(res.status).toBe(200);
        expect(res.body.email).toBe(email);
        expect(JSON.stringify(res.body)).not.toContain("password");
    });

    it("401 without a header", async () => {
        const { accessToken } = await login(email, password);
        expect((await call_auth("GET", "/me", undefined)).status).toBe(401);
    });
    it("401 on a garbage header", async () => {
        const { accessToken } = await login(email, password);
        expect(
            (await call_auth("GET", "/me", undefined, bearer("Idk"))).status,
        ).toBe(401);
    });
    it("401 on a tampered header", async () => {
        const { accessToken } = await login(email, password);
        const bad =
            accessToken.slice(0, -1) + (accessToken.endsWith("A") ? "B" : "A");
        expect(
            (await call_auth("GET", "/me", undefined, bearer(bad))).status,
        ).toBe(401);
    });
    it("401 on a wrong secret", async () => {
        const forged = jwt.sign({ sub: "1" }, "hipipi-secret", {
            algorithm: "HS256",
        });

        expect(
            (await call_auth("GET", "/me", undefined, bearer(forged))).status,
        ).toBe(401);
    });
    it("Access token survives logout (JWT shouldn't be revoked if I remember correctly?)", async () => {
        const { accessToken, cookie } = await login(email, password);
        await call_auth("POST", "/logout", undefined, cookieOf(cookie));

        expect(
            (await call_auth("GET", "/me", undefined, bearer(accessToken)))
                .status,
        ).toBe(200);
    });
});

const cookieFrom = (r: { cookies: string[] }) =>
    r.cookies.find((c) => c.startsWith("refresh_token="))!.split(";")[0];

describe("refresh", () => {
    it("401 with no cookie", async () => {
        expect((await call_auth("POST", "/refresh")).status).toBe(401);
    });

    it("401 with bad cookie", async () => {
        expect(
            (
                await call_auth(
                    "POST",
                    "/refresh",
                    undefined,
                    cookieOf("refresh_token=wiiwoo"),
                )
            ).status,
        ).toBe(401);
    });

    it("200 with a correct access token and diff cookie", async () => {
        const { cookie } = await login(email, password);
        const result = await call_auth(
            "POST",
            "/refresh",
            undefined,
            cookieOf(cookie),
        );

        expect(result.status).toBe(200);
        expect(result.body.accessToken).toBeTruthy();
        expect(cookieFrom({ cookies: result.cookies! })).not.toBe(cookie);
    });

    it("rejects old cookie", async () => {
        const { cookie } = await login(email, password);
        const first = await call_auth(
            "POST",
            "/refresh",
            undefined,
            cookieOf(cookie),
        );

        expect(
            (await call_auth("POST", "/refresh", undefined, cookieOf(cookie)))
                .status,
        ).toBe(401);
        expect(
            (
                await call_auth(
                    "POST",
                    "/refresh",
                    undefined,
                    cookieOf(cookieFrom({ cookies: first.cookies! })),
                )
            ).status,
        ).toBe(200);
    });

    it("race with many, one wins", async () => {
        const { cookie } = await login(email, password);

        const rs = await Promise.all(
            Array.from({ length: 5 }).map(() =>
                call_auth("POST", "/refresh", undefined, cookieOf(cookie)),
            ),
        );

        expect(rs.filter((r) => r.status === 200)).toHaveLength(1);
    });
});
