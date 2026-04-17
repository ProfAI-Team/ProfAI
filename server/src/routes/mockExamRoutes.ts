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

const router = Router();

// Expensive Gemini generation — hourly + daily quota.
router.post(
  "/generate",
  authenticate,
  mockExamHourlyLimiter,
  mockExamDailyLimiter,
  generate
);

// Submit is inside an open session — no rate limit here; a student
// finishing an exam should never be throttled mid-submit.
router.post("/:id/submit", authenticate, submit);

router.get("/:id", authenticate, getById);
router.get("/session/:sessionId/result", authenticate, getResult);

router.post("/panic-plan", authenticate, panicPlanDailyLimiter, panicPlan);

export default router;
