const BASE_HOST =
    process.env.NODE_ENV === "production"
        ? "https://gip-dev-challenges.onrender.com/"
        : "http://localhost:8000/";
export const BASE_LOSTFOUND = BASE_HOST + "api/lostfound";
export const BASE_AUTH = BASE_HOST + "api/auth";
export const BASE_SALE = BASE_HOST + "api/sale";
export const TAG = `t${Math.random().toString(36).slice(2, 8)}`;

async function call(
    method: string,
    base: string,
    path = "",
    body?: unknown,
    cookie?: boolean,
    headers = {},
) {
    const result = await fetch(base + path, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const text = await result.text();
    let json: any;
    try {
        json = JSON.parse(text);
    } catch {
        json = text;
    }

    return {
        status: result.status,
        body: json,
        cookies: cookie ? result.headers.getSetCookie() : undefined,
    };
}

export async function call_sale(
    method: string,
    path = "",
    body?: unknown,
    headers = {},
) {
    return await call(method, BASE_SALE, path, body, false, headers);
}

export function newEmail() {
    return `u${Math.random().toString(36).slice(2, 8)}@test.com`;
}

export async function call_auth(
    method: string,
    path = "",
    body?: unknown,
    headers = {},
) {
    return await call(method, BASE_AUTH, path, body, true, headers);
}

export async function call_lostfound(
    method: string,
    path = "",
    body?: unknown,
) {
    return await call(method, BASE_LOSTFOUND, path, body);
}

export async function make_report(
    username: string,
    title: string,
    type: string,
) {
    const result = await call_lostfound("POST", "", {
        username,
        title: `${title} t${TAG}`,
        description: "desc",
        type,
    });

    return result.body.id as string;
}

export async function login(email: string, password: string) {
    const result = await call_auth("POST", "/login", { email, password });
    const cookie = result
        .cookies!.find((c) => c.startsWith("refresh_token="))!
        .split(".")[0];
    return {
        accessToken: result.body.accessToken as string,
        cookie,
    };
}

export async function make_product(quantity: number = 5) {
    const info = {
        name: `SALE-${TAG}+${Math.random().toString(36).slice(0, 4)}`,
        quantity,
    };

    const res = await call_sale("POST", "", info, {
        Authorization: process.env.ADMIN_KEY,
    });

    return res.body.data.product_id as number;
}
