import { Router } from "express";
import { getPlaceById, getPlaces } from "../controllers/places.controller";

const router = Router();

router.get("/", getPlaces);
router.get("/:id", getPlaceById);

export default router;
