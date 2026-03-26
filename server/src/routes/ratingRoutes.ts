import { Router } from "express";
import { createRating, getRatingsByProfessor } from "../controllers/ratingController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authenticate, createRating);
router.get("/professor/:professorId", getRatingsByProfessor);

export default router;
