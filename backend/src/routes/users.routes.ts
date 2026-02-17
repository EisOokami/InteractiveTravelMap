import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import {
    deleteAccount,
    me,
    changePassword,
    updateProfile,
} from "../controllers/users.controller";
import { validateData } from "../middleware/validation.middleware";
import {
    changePasswordSchema,
    updateProfileSchema,
} from "../validation/validation";

const router = Router();

router.get("/me", authenticateToken, me);
router.post(
    "/update-profile",
    authenticateToken,
    validateData(updateProfileSchema),
    updateProfile,
);
router.post(
    "/change-password",
    authenticateToken,
    validateData(changePasswordSchema),
    changePassword,
);
router.delete("/:id", authenticateToken, deleteAccount);

export default router;
