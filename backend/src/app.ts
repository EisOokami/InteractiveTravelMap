import express from "express";
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

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const hosts = process.env.HOSTS?.split(",");
const corsUrls = process.env.CORS_URLS?.split(",");

app.disable("x-powered-by");
app.use(hostValidation({ hosts: hosts }));
app.use(
    cors({
        origin: corsUrls,
        credentials: true,
    }),
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(hpp());
app.use(helmet());
app.use(limiter);
app.use(xss());
app.use(cookieParser());

app.use("/places", placesRoutes);
app.use("/favorites", favoritesRoutes);
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/ai", aiRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
