import { beforeAll, describe, expect, it } from "vitest";
import { call, make_report, TAG } from "./helper";

const content = {
    lost: "",
    lost2: "",
    lost3: "",
    found1: "",
    none: "00000000-0000-4000-8000-000000000000",
};

beforeAll(async () => {
    // These are characters from my DnD campaign, don't be alarmed I was bored
    content.lost = await make_report("azael", "valeon sword", "lost");
    content.found1 = await make_report("edion", "valeon epee", "found");
    content.lost2 = await make_report("azael", "arrows", "lost");
    content.lost3 = await make_report("blemishine", "haze", "lost");
});

describe("create / read", () => {
    it("rejects missing field", async () => {
        expect(
            (await call("POST", "", { username: "x", title: "x" })).status,
        ).toBe(400);
    });

    it("rejects bad type", async () => {
        expect(
            (
                await call("POST", "", {
                    username: "x",
                    title: "x",
                    description: "x",
                    type: "stolen",
                })
            ).status,
        ).toBe(400);
    });

    it("gets item by id", async () => {
        expect((await call("GET", `/${content.lost}`)).status).toBe(200);
    });

    it("bad UUID", async () =>
        expect((await call("GET", `/not-uuid`)).status).toBe(400));

    it("404 on Unknown id", async () =>
        expect((await call("GET", `/${content.none}`)).status).toBe(404));
});

describe("Searching", () => {
    const query = (s: string) => call("GET", `/search?${s}`);

    it("filters by tag", async () =>
        expect((await query(`title=${TAG}`)).body.count).toBe(4));

    it("filters by type", async () =>
        expect((await query(`title=${TAG}&type=lost`)).body.count).toBe(3));

    it("400 on bad resolved value", async () =>
        expect((await query("resolved=mayhaps")).status).toBe(400));
});

describe("editing", () => {
    it("owner can edit", async () => {
        const result = await call("PATCH", "", {
            id: content.lost,
            username: "azael",
            description: "edited",
        });
        expect(result.status).toBe(200);
        expect(result.body.description).toBe("edited");
    });

    it("non owner gets 404", async () => {
        expect(
            (
                await call("PATCH", "", {
                    id: content.lost,
                    username: "unknown",
                    title: "hehe",
                })
            ).status,
        ).toBe(404);
    });
});

const resolve = (to: string, from: string, username: string) =>
    call("PATCH", "/resolve", { to_resolve: to, resolved_id: from, username });

const failed = (s: number) => expect(s).toBeGreaterThanOrEqual(400);

describe("resolving reports", () => {
    it("rejects the same id", async () => {
        failed((await resolve(content.lost, content.lost, "azael")).status);
    });
    it("rejects two lost", async () => {
        failed((await resolve(content.lost2, content.lost3, "azael")).status);
    });
    it("rejects non owner", async () => {
        failed((await resolve(content.lost, content.found1, "haze")).status);
    });
    it("resolves a pair", async () => {
        const result = await resolve(content.lost, content.found1, "azael");
        expect(result.status).toBe(200);
        expect(result.body).toHaveLength(2);
    });

    it("rejects already resolved", async () => {
        failed((await resolve(content.lost, content.found1, "azael")).status);
    });

    it("rejects taken found", async () => {
        failed((await resolve(content.lost2, content.found1, "azael")).status);
    });

    it("works found to lost", async () => {
        const lost = await make_report("batata", "Black Sand", "lost");
        const found = await make_report("bsla", "Black Dust", "found");
        expect((await resolve(found, lost, "bsla")).status).toBe(200);
    });

    it("race conditions: only 1 resolution", async () => {
        const lost = await make_report("cael", "cardinal plate", "lost");
        const found = await make_report(
            "bishop",
            "cardinal shoulder armor",
            "found",
        );
        const result = await Promise.all(
            Array.from({ length: 5 }).map(() => resolve(lost, found, "cael")),
        );

        expect(result.filter((r) => r.status === 200)).toHaveLength(1);
    });
});
