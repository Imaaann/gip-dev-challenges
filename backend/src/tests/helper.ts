export const BASE = "http://localhost:8000/api/lostfound";
export const TAG = `t${Math.random().toString(36).slice(2, 8)}`;

export async function call(method: string, path = "", body?: unknown) {
    const result = await fetch(BASE + path, {
        method,
        headers: {
            "Content-Type": "application/json",
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
    };
}

export async function make_report(
    username: string,
    title: string,
    type: string,
) {
    const result = await call("POST", "", {
        username,
        title: `${title} t${TAG}`,
        description: "desc",
        type,
    });

    return result.body.id as string;
}


