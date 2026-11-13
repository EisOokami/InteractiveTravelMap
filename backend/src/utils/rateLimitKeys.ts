import type { Request } from "express";
import { ipKeyGenerator } from "express-rate-limit";
import { jwtVerify } from "jose";
import dotenv from "dotenv";
import { JOSEError } from "jose/errors";

dotenv.config({ quiet: true });

const accessSecret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);
const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);

export const ipKey = (req: Request): string => {
    return ipKeyGenerator(req.ip ?? "");
};

const readCookie = (req: Request, name: string) => {
    return req.headers.cookie
        ?.split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith(`${name}=`))
        ?.slice(name.length + 1);
};

const bearerToken = (req: Request) => {
    const authHeader = req.headers.authorization;

    return typeof authHeader === "string" && authHeader.startsWith("Bearer ")
        ? authHeader.slice("Bearer ".length)
        : undefined;
};

export const userOrIpKey = async (req: Request): Promise<string> => {
    const accessToken = bearerToken(req);

    if (accessToken) {
        try {
            const { payload } = await jwtVerify(accessToken, accessSecret, {
                algorithms: ["HS256"],
            });

            if (
                typeof payload.id === "number" &&
                Number.isSafeInteger(payload.id)
            ) {
                return `user:${payload.id}`;
            }
        } catch (error) {
            if (!(error instanceof JOSEError)) {
                throw error;
            }
        }
    }

    const refreshToken = readCookie(req, "refreshToken");

    if (refreshToken) {
        try {
            const { payload } = await jwtVerify(refreshToken, refreshSecret, {
                algorithms: ["HS256"],
            });

            if (payload.sub) {
                return `user:${payload.sub}`;
            }
        } catch (error) {
            if (!(error instanceof JOSEError)) {
                throw error;
            }
        }
    }

    return ipKey(req);
};

const bodyEmail = (req: Request): string => {
    const body: unknown = req.body;

    return body &&
        typeof body === "object" &&
        "email" in body &&
        typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";
};

export const ipAndEmailKey = (req: Request): string => {
    return `${ipKey(req)}|email:${bodyEmail(req)}`;
};

export const emailKey = (req: Request): string => {
    const email = bodyEmail(req);

    return email ? `email:${email}` : ipKey(req);
};
