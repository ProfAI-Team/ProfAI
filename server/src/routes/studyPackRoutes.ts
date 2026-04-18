import { Router } from "express";

import {
  generate,
  getById,
  listMine,
} from "../controllers/studyPackController";
import { authenticate } from "../middleware/authMiddleware";
import { studyPackHourlyLimiter } from "../middleware/rateLimitMiddleware";
import { asyncHandler } from "../lib/asyncHandler";

const router = Router();

router.post("/generate", authenticate, studyPackHourlyLimiter, asyncHandler(generate));
router.get("/mine", authenticate, asyncHandler(listMine));
router.get("/:id", authenticate, asyncHandler(getById));

export default router;
