import { Router } from "express";
import { createRating, getRatingsByProfessor } from "../controllers/ratingController";
import { authenticate } from "../middleware/authMiddleware";
import { asyncHandler } from "../lib/asyncHandler";

const router = Router();

router.post("/", authenticate, asyncHandler(createRating));
router.get("/professor/:professorId", asyncHandler(getRatingsByProfessor));

export default router;
