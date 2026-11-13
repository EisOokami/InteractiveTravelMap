import { rateLimitHandler } from "../middleware/securityAudit.middleware.js";
import { userOrIpKey } from "../utils/rateLimitKeys.js";
import { Router } from "express";
import {
    addItemToFavorite,
    getFavorites,
    removeItemFromFavorite,
} from "../controllers/favorites.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { validateData } from "../middleware/validation.middleware.js";
import { validateIdSchema } from "../validation/validation.js";
import rateLimit from "express-rate-limit";
import { verifyCsrf } from "../middleware/csrf.middleware.js";

const addItemToFavoriteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
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

const removeItemFromFavoriteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
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

const router = Router();

router.get("/", authenticateToken, getFavorites);
router.post(
    "/",
    addItemToFavoriteLimiter,
    authenticateToken,
    verifyCsrf,
    validateData(validateIdSchema),
    addItemToFavorite,
);
router.delete(
    "/:id",
    removeItemFromFavoriteLimiter,
    authenticateToken,
    verifyCsrf,
    removeItemFromFavorite,
);

export default router;
