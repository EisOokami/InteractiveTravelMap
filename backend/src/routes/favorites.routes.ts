import { Router } from "express";
import {
    addItemToFavorite,
    getFavorites,
    removeItemFromFavorite,
} from "../controllers/favorites.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { validateData } from "../middleware/validation.middleware";
import { validateIdSchema } from "../validation/validation";

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
