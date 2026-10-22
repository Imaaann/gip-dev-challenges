import { RequestHandler } from "express";
import z, { ZodObject } from "zod";

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
