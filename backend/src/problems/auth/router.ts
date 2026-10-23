import express from "express";
import { authenticate, validateBody } from "../../middleware";
import {
    createUser,
    createUserDTOSchema,
    getUser,
    issueTokens,
    logout,
    refreshToken,
    verify,
} from "./controller";
import { AuthError } from "../../errors";

const router = express.Router();

router.post("/signup", validateBody(createUserDTOSchema), async (req, res) => {
    const user = await createUser(req.body.email, req.body.password);
    res.status(201).json(user);
});

router.post("/login", validateBody(createUserDTOSchema), async (req, res) => {
    const user = await verify(req.body.email, req.body.password);
    const tokens = await issueTokens(user.user_id);
    res.cookie("refresh_token", tokens.refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week basically
        path: "/api/auth",
    });

    res.status(200).json({
        accessToken: tokens.accessToken,
        user,
    });
});

router.post("/refresh", async (req, res) => {
    if (!req.cookies?.refresh_token) {
        res.status(401).json({
            error: "Invalid Credentials",
        });
        return;
    }

    try {
        const tokens = await refreshToken(req.cookies.refresh_token);

        res.cookie("refresh_token", tokens.refreshToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/api/auth",
        });

        res.status(200).json({
            accessToken: tokens.accessToken,
        });
    } catch (err) {
        if (err instanceof AuthError) {
            res.clearCookie("refresh_token", { path: "/api/auth" });
        }
        throw err;
    }
});

router.post("/logout", async (req, res) => {
    if (!req.cookies?.refresh_token) {
        res.status(204).json({
            error: "logged out",
        });
        return;
    }

    await logout(req.cookies.refresh_token);
    res.clearCookie("refresh_token", { path: "/api/auth" });
    res.status(204).json({ message: "logged out" });
});


router.get("/me", authenticate, async (_req, res) => {
    const userId = res.locals.userId as number;
    const user = await getUser(userId);

    res.status(200).json(user);
})

export { router };
