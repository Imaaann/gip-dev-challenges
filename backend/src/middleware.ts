import { ErrorRequestHandler, RequestHandler } from "express";
import z, { ZodObject } from "zod";
import jwt from "jsonwebtoken";
import { AuthError, HttpError } from "./errors";
import { JWT_SECRET } from "./problems/auth/controller";
import { exit } from "process";

export const ADMIN_KEY = process.env.ADMIN_KEY;

if (!ADMIN_KEY) {
    console.error("Environment var ADMIN_KEY not set!");
    exit(1);
}

export function validateBody<T extends ZodObject>(
    schema: T,
): RequestHandler<{}, {}, z.infer<T>> {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (result.success) {
            req.body = result.data;
            next();
        } else {
            res.status(400).json({
                error: "malformed body",
                message: result.error.issues,
            });
        }
    };
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof HttpError) {
        res.status(err.status).json({ error: err.message });
        return;
    }

    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
};

export const authenticate: RequestHandler = (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        res.status(401).json({ error: "Missing Authorization Header" });
        return;
    }

    const token = authHeader.split(" ")[1];
    try {
        const verifyResult = jwt.verify(token, JWT_SECRET!, {
            algorithms: ["HS256"],
        });

        if (typeof verifyResult === "string") {
            throw new AuthError();
        }

        if (!verifyResult.sub) {
            throw new AuthError();
        }

        const user_id = Number(verifyResult.sub);

        if (isNaN(user_id)) {
            throw new AuthError();
        }

        res.locals.userId = user_id;
    } catch (err) {
        throw new AuthError("Invalid or expired token");
    }

    next();
};

export const adminOnly: RequestHandler = (req, res, next) => {
    const auth = req.header("Authorization")

    if (!auth) {
        res.status(401).json({
            error: "Missing admin Authorization"
        })
        return;
    }

    if (auth === ADMIN_KEY!) {
        next()
    } else {
        res.status(401).json({
            error: "Missing admin Authorization"
        })
    }
};
