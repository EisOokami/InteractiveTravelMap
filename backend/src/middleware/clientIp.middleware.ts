import { createHash, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";
import type { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { logger } from "../utils/logger.js";

dotenv.config({ quiet: true });

const configuredSecret = process.env.BFF_SHARED_SECRET ?? "";

if (configuredSecret && configuredSecret.length < 32) {
    logger.warn(
        { event: "config.bff_secret_too_short" },
        `BFF_SHARED_SECRET must be at least ${32} characters; forwarded client addresses are ignored`,
    );
}

const secretDigest =
    configuredSecret.length >= 32
        ? createHash("sha256").update(configuredSecret).digest()
        : null;

export function normalizeIp(value: string): string | null {
    const ip = value.trim();

    if (!isIP(ip)) {
        return null;
    }

    const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(ip);

    return mapped ? mapped[1] : ip.toLowerCase();
}

function hasValidSecret(presented: string | undefined): boolean {
    return (
        secretDigest !== null &&
        typeof presented === "string" &&
        timingSafeEqual(
            createHash("sha256").update(presented).digest(),
            secretDigest,
        )
    );
}

export function bffClientIp(
    req: Request,
    _res: Response,
    next: NextFunction,
): void {
    const forwardedIp = req.get("x-client-ip");
    const presentedSecret = req.get("x-bff-secret");

    if (forwardedIp !== undefined || presentedSecret !== undefined) {
        const clientIp =
            forwardedIp !== undefined ? normalizeIp(forwardedIp) : null;

        if (clientIp && hasValidSecret(presentedSecret)) {
            Object.defineProperty(req, "ip", {
                value: clientIp,
                configurable: true,
                enumerable: true,
            });
        } else {
            req.log.warn(
                {
                    audit: true,
                    event: "security.client_ip_rejected",
                    reasons: [
                        clientIp ? "invalid_bff_secret" : "invalid_client_ip",
                    ],
                    ip: req.ip,
                },
                "Forwarded client address ignored",
            );
        }
    }

    delete req.headers["x-bff-secret"];
    delete req.headers["x-client-ip"];

    next();
}
