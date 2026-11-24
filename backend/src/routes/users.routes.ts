import { rateLimitHandler } from "../middleware/securityAudit.middleware.js";
import { userOrIpKey } from "../utils/rateLimitKeys.js";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticateToken } from "../middleware/auth.middleware.js";
import {
    getSessions,
    deleteSessions,
} from "../controllers/sessions.controller.js";
import {
    me,
    acceptTerms,
    changePassword,
    confirmEmailChange,
    updateProfile,
    setPassword,
    initiateAccountDeletion,
    confirmAccountDeletion,
    resendAccountDeletionCode,
} from "../controllers/users.controller.js";
import { validateData } from "../middleware/validation.middleware.js";
import {
    acceptTermsSchema,
    changePasswordSchema,
    confirmAccountDeletionSchema,
    confirmEmailChangeSchema,
    deleteAccountSchema,
    resendAccountDeletionSchema,
    setPasswordSchema,
    updateProfileSchema,
} from "../validation/validation.js";
import { verifyCsrf } from "../middleware/csrf.middleware.js";
import { validateEmailMiddleware } from "../middleware/emailValidation.middleware.js";

const acceptTermsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: userOrIpKey,
    handler: rateLimitHandler,
});

const updateProfileLimiter = rateLimit({
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

const confirmEmailChangeLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 1 hour.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
});

const changePasswordLimiter = rateLimit({
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

const setPasswordLimiter = rateLimit({
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

const initiateAccountDeletionLimiter = rateLimit({
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

const confirmAccountDeletionLimiter = rateLimit({
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

const resendAccountDeletionCodeLimiter = rateLimit({
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

const deleteSessionLimiter = rateLimit({
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

const deleteSessionsLimiter = rateLimit({
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

router.get("/me", authenticateToken, me);
router.post(
    "/me/accept-terms",
    acceptTermsLimiter,
    authenticateToken,
    verifyCsrf,
    validateData(acceptTermsSchema),
    acceptTerms,
);
router.get("/me/sessions", authenticateToken, getSessions);
router.delete(
    "/me/sessions/:sessionId",
    deleteSessionLimiter,
    authenticateToken,
    verifyCsrf,
    deleteSessions,
);
router.delete(
    "/me/sessions",
    deleteSessionsLimiter,
    authenticateToken,
    verifyCsrf,
    deleteSessions,
);
router.post(
    "/update-profile",
    updateProfileLimiter,
    authenticateToken,
    verifyCsrf,
    validateData(updateProfileSchema),
    validateEmailMiddleware,
    updateProfile,
);
router.post(
    "/confirm-email-change",
    confirmEmailChangeLimiter,
    validateData(confirmEmailChangeSchema),
    confirmEmailChange,
);
router.post(
    "/change-password",
    changePasswordLimiter,
    authenticateToken,
    verifyCsrf,
    validateData(changePasswordSchema),
    changePassword,
);
router.post(
    "/set-password",
    setPasswordLimiter,
    authenticateToken,
    verifyCsrf,
    validateData(setPasswordSchema),
    setPassword,
);
router.post(
    "/:id/delete/initiate",
    initiateAccountDeletionLimiter,
    authenticateToken,
    verifyCsrf,
    validateData(deleteAccountSchema),
    initiateAccountDeletion,
);
router.post(
    "/:id/delete/confirm",
    confirmAccountDeletionLimiter,
    authenticateToken,
    verifyCsrf,
    validateData(confirmAccountDeletionSchema),
    confirmAccountDeletion,
);
router.post(
    "/:id/delete/resend-code",
    resendAccountDeletionCodeLimiter,
    authenticateToken,
    verifyCsrf,
    validateData(resendAccountDeletionSchema),
    resendAccountDeletionCode,
);

export default router;
