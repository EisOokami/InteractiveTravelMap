import { NextFunction, Request, Response } from "express";
import { IGetUserRequest } from "../types/interfaces.js";
import { verifyAccessToken } from "../utils/jwt.js";

export async function authenticateToken(
    req: IGetUserRequest,
    res: Response,
    next: NextFunction,
) {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res
                .status(401)
                .json({ status: "error", message: "Token missing" });
        }

        req.user = await verifyAccessToken(token);

        next();
    } catch {
        res.status(401).json({
            status: "error",
            message: "Invalid or expired token",
        });
    }
}
