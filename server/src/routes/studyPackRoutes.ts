import { Router } from "express";

import {
  generate,
  getById,
  listMine,
} from "../controllers/studyPackController";
import { authenticate } from "../middleware/authMiddleware";
import { studyPackHourlyLimiter } from "../middleware/rateLimitMiddleware";

const router = Router();

router.post("/generate", authenticate, studyPackHourlyLimiter, generate);
router.get("/mine", authenticate, listMine);
router.get("/:id", authenticate, getById);

export default router;
