import { Router } from "express";
import {
    addItemToFavorite,
    getFavorites,
    removeItemFromFavorite,
} from "../controllers/favorites.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { validateData } from "../middleware/validation.middleware.js";
import { validateIdSchema } from "../validation/validation.js";

const router = Router();

router.get("/", authenticateToken, getFavorites);
router.post(
    "/",
    authenticateToken,
    validateData(validateIdSchema),
    addItemToFavorite,
);
router.delete("/:id", authenticateToken, removeItemFromFavorite);

export default router;
