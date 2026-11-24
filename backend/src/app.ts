import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { xss } from "express-xss-sanitizer";
import hostValidation from "host-validation";
import cookieParser from "cookie-parser";
import hpp from "hpp";
import placesRoutes from "./routes/places.routes.js";
import favoritesRoutes from "./routes/favorites.routes.js";
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import mfaRoutes from "./routes/mfa.routes.js";
import { issueCsrfCookie } from "./middleware/csrf.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { pinoHttp } from "pino-http";
import { logger, requestRoute, httpLoggingOptions } from "./utils/logger.js";
import { securityAudit } from "./middleware/securityAudit.middleware.js";
import { bffClientIp } from "./middleware/clientIp.middleware.js";
import { userOrIpKey } from "./utils/rateLimitKeys.js";
import { startRetentionJob } from "./utils/retention.js";

dotenv.config({ quiet: true });

const app = express();
const port = process.env.PORT || 3001;

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: userOrIpKey,
    handler: (req, res) => {
        req.log.warn(
            {
                audit: true,
                event: "security.rate_limit_exceeded",
                reasons: ["rate_limit_exceeded"],
                ip: req.ip,
                route: requestRoute(req),
            },
            "Rate limit exceeded",
        );

        res.status(429).json({
            status: "error",
            message: "Too many requests. Please try again in 15 minutes.",
        });
    },
});

const hosts = process.env.HOSTS?.split(",");
const corsUrls = process.env.CORS_URLS?.split(",");

const trustedProxies = process.env.TRUST_PROXY?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

if (trustedProxies && trustedProxies.length) {
    app.set("trust proxy", trustedProxies);
}

app.disable("x-powered-by");
app.use(pinoHttp(httpLoggingOptions));
app.use(bffClientIp);
app.use(hostValidation({ hosts: hosts }));
app.use(
    cors({
        origin: corsUrls,
        credentials: true,
    }),
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(securityAudit());
app.use(hpp());
app.use(helmet());
app.use(helmet.hidePoweredBy());
app.use(limiter);
app.use(xss());
app.use(cookieParser());
app.use(issueCsrfCookie);

app.use("/places", placesRoutes);
app.use("/favorites", favoritesRoutes);
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/ai", aiRoutes);
app.use("/auth/mfa", mfaRoutes);

app.use((req: Request, res: Response) => {
    res.status(404).json({ status: "error", message: "Not found" });
});

app.use(errorMiddleware);

app.listen(port, () => {
    logger.info({ event: "app.started", port }, "Server listening");

    startRetentionJob();
});
