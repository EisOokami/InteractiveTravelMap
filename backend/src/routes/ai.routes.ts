import { rateLimitHandler } from "../middleware/securityAudit.middleware.js";
import { userOrIpKey } from "../utils/rateLimitKeys.js";
import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { analyzeTripDay } from "../controllers/ai.controller.js";
import { validateData } from "../middleware/validation.middleware.js";
import { tripAnalysisRequestSchema } from "../validation/validation.js";
import { verifyCsrf } from "../middleware/csrf.middleware.js";

const analyzeTripLimiter = rateLimit({
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

router.post(
    "/trip-analyze",
    analyzeTripLimiter,
    authenticateToken,
    verifyCsrf,
    validateData(tripAnalysisRequestSchema),
    analyzeTripDay,
);

export default router;
