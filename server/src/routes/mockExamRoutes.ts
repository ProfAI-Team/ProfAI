import { Router } from "express";

import {
  generate,
  getById,
  submit,
  getResult,
  panicPlan,
} from "../controllers/mockExamController";
import { authenticate } from "../middleware/authMiddleware";
import {
  mockExamHourlyLimiter,
  mockExamDailyLimiter,
  panicPlanDailyLimiter,
} from "../middleware/rateLimitMiddleware";
import { asyncHandler } from "../lib/asyncHandler";

const router = Router();

// Expensive Gemini generation — hourly + daily quota.
router.post(
  "/generate",
  authenticate,
  mockExamHourlyLimiter,
  mockExamDailyLimiter,
  asyncHandler(generate)
);

// Submit is inside an open session — no rate limit here; a student
// finishing an exam should never be throttled mid-submit.
router.post("/:id/submit", authenticate, asyncHandler(submit));

router.get("/:id", authenticate, asyncHandler(getById));
router.get("/session/:sessionId/result", authenticate, asyncHandler(getResult));

router.post("/panic-plan", authenticate, panicPlanDailyLimiter, asyncHandler(panicPlan));

export default router;
