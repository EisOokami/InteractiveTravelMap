import { Router } from "express";
import {
    forgotPassword,
    login,
    logout,
    refresh,
    register,
    resetPassword,
} from "../controllers/auth.controller";
import { validateData } from "../middleware/validation.middleware";
import {
    forgotPasswordSchema,
    loginSchema,
    registerSchema,
    resetPasswordSchema,
} from "../validation/validation";

const router = Router();

router.post("/register", validateData(registerSchema), register);
router.post("/login", validateData(loginSchema), login);
router.post(
    "/forgot-password",
    validateData(forgotPasswordSchema),
    forgotPassword,
);
router.post(
    "/reset-password",
    validateData(resetPasswordSchema),
    resetPassword,
);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
