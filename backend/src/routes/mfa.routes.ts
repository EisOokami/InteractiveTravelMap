import { rateLimitHandler } from "../middleware/securityAudit.middleware.js";
import { userOrIpKey } from "../utils/rateLimitKeys.js";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticateToken } from "../middleware/auth.middleware.js";
import {
    disableMfa,
    enableMfa,
    regenerateBackupCodes,
    setupMfa,
    verifyMfa,
} from "../controllers/mfa.controller.js";
import { verifyCsrf } from "../middleware/csrf.middleware.js";

const setupMfaLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 1 hour.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: userOrIpKey,
    handler: rateLimitHandler,
});

const enableMfaLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 1 hour.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: userOrIpKey,
    handler: rateLimitHandler,
});

const verifyMfaLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 1 hour.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
});

const disableMfaLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 1 hour.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: userOrIpKey,
    handler: rateLimitHandler,
});

const regenerateBackupCodesLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 1 hour.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: userOrIpKey,
    handler: rateLimitHandler,
});

const router = Router();

router.post("/setup", setupMfaLimiter, authenticateToken, verifyCsrf, setupMfa);
router.post(
    "/enable",
    enableMfaLimiter,
    authenticateToken,
    verifyCsrf,
    enableMfa,
);
router.post("/verify", verifyMfaLimiter, verifyMfa);
router.post(
    "/disable",
    disableMfaLimiter,
    authenticateToken,
    verifyCsrf,
    disableMfa,
);
router.post(
    "/regenerate-backup-codes",
    regenerateBackupCodesLimiter,
    authenticateToken,
    verifyCsrf,
    regenerateBackupCodes,
);

export default router;
