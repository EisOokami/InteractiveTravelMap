import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { xss } from "express-xss-sanitizer";
import hostValidation from "host-validation";
import cookieParser from "cookie-parser";
import placesRoutes from "./routes/places.routes";
import favoritesRoutes from "./routes/favorites.routes";
import authRoutes from "./routes/auth.routes";
import usersRoutes from "./routes/users.routes";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1000,
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

app.use(hostValidation({ hosts: hosts }));
app.use(
    cors({
        origin: corsUrls,
        credentials: true,
    }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(limiter);
app.use(xss());
app.use(cookieParser());

app.use("/places", placesRoutes);
app.use("/favorites", favoritesRoutes);
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
