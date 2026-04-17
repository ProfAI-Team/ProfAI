import { Router } from "express";

import { authenticate } from "../middleware/authMiddleware";
import { requirePremium } from "../middleware/premiumMiddleware";
import {
  advisorDailyLimiter,
  dnaRecomputeDailyLimiter,
  gradeWriteDailyLimiter,
} from "../middleware/rateLimitMiddleware";
import prisma from "../lib/prisma";
import { badRequest, notFound } from "../lib/AppError";
import {
  getDNA,
  recomputeDNA,
} from "../services/dnaService";
import {
  updateLearningStyleFromInference,
} from "../services/learningStyleService";
import {
  getConfidenceMap,
  getWeakestTopics,
} from "../services/confidenceService";
import {
  addGrade,
  calculateGPA,
  deleteGrade,
  listGrades,
  simulateGPA,
  whatIfTargetGPA,
} from "../services/gradeService";
import { getCompatibility } from "../services/courseAdvisorService";
import {
  completeReview,
  getDueReviews,
} from "../services/spacedRepetitionService";
import { reconstructExamSummary } from "../services/postExamReportService";
import {
  addGradeSchema,
  completeReviewSchema,
  learningStyleSchema,
  reviewFrequencySchema,
  simulateGradeSchema,
  whatIfTargetSchema,
} from "../schemas/dna";

const router = Router();

// All DNA endpoints require auth. Paywall gating is handled per-route.
router.use(authenticate);

function requireUserId(req: { user?: { id: string } }): string {
  if (!req.user?.id) throw badRequest("Missing authenticated user.");
  return req.user.id;
}

// ---------------- DNA ----------------

router.get("/dna/me", async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const result = await getDNA(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/dna/me/recompute",
  dnaRecomputeDailyLimiter,
  async (req, res, next) => {
    try {
      const userId = requireUserId(req);
      const dna = await recomputeDNA(userId);
      await updateLearningStyleFromInference(userId);
      res.json(dna);
    } catch (err) {
      next(err);
    }
  }
);

router.patch("/dna/me/learning-style", async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const parsed = learningStyleSchema.safeParse(req.body);
    if (!parsed.success) return next(parsed.error);
    const { learningStyle } = parsed.data;

    const existing = await prisma.academicDNA.findUnique({ where: { userId } });
    if (!existing) {
      throw notFound("DNA record not found — complete a mock exam first.");
    }
    const updated = await prisma.academicDNA.update({
      where: { userId },
      data: { learningStyle },
    });
    res.json({ learningStyle: updated.learningStyle });
  } catch (err) {
    next(err);
  }
});

// ---------------- Confidence ----------------

router.get("/confidence/me", async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const map = await getConfidenceMap(userId);
    res.json({ topics: map });
  } catch (err) {
    next(err);
  }
});

router.get("/confidence/me/weakest", async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const n = Number(req.query.n ?? 3);
    const weakest = await getWeakestTopics(userId, Number.isFinite(n) ? n : 3);
    res.json({ topics: weakest });
  } catch (err) {
    next(err);
  }
});

// ---------------- Grades ----------------

router.post("/grades", gradeWriteDailyLimiter, async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const parsed = addGradeSchema.safeParse(req.body);
    if (!parsed.success) return next(parsed.error);
    const result = await addGrade(userId, parsed.data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/grades/me", async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const semester =
      typeof req.query.semester === "string" ? req.query.semester : undefined;
    const rows = await listGrades(userId, { semester });
    res.json({ grades: rows });
  } catch (err) {
    next(err);
  }
});

router.delete("/grades/:id", async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const ok = await deleteGrade(userId, req.params.id);
    if (!ok) throw notFound("Grade not found or not yours.");
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.get("/grades/me/gpa", async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const semester =
      typeof req.query.semester === "string" ? req.query.semester : undefined;
    const university =
      typeof req.query.university === "string"
        ? (req.query.university as "aydin" | "bogazici" | "odtu")
        : undefined;
    const result = await calculateGPA(userId, { semester, university });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/grades/me/simulate", async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const parsed = simulateGradeSchema.safeParse(req.body);
    if (!parsed.success) return next(parsed.error);
    const result = await simulateGPA(userId, parsed.data);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/grades/me/target", async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const parsed = whatIfTargetSchema.safeParse(req.body);
    if (!parsed.success) return next(parsed.error);
    const result = await whatIfTargetGPA(userId, parsed.data);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ---------------- Course Advisor (premium) ----------------

router.get(
  "/course-advisor/:professorId",
  requirePremium("COURSE_ADVISOR"),
  advisorDailyLimiter,
  async (req, res, next) => {
    try {
      const userId = requireUserId(req);
      const professorId = String(req.params.professorId);
      const result = await getCompatibility({ userId, professorId });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

// ---------------- Exam reconstruct (premium) ----------------

router.get(
  "/exam-reconstruct/:professorId",
  requirePremium("EXAM_RECONSTRUCT"),
  advisorDailyLimiter,
  async (req, res, next) => {
    try {
      const professorId = String(req.params.professorId);
      const result = await reconstructExamSummary(professorId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

// ---------------- Spaced Repetition ----------------

router.get("/spaced-repetition/me/due", async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const untilParam = req.query.until;
    const untilString = typeof untilParam === "string" ? untilParam : null;
    const until = untilString ? new Date(untilString) : new Date();
    if (Number.isNaN(until.getTime())) {
      throw badRequest("Invalid `until` date.");
    }
    const reviews = await getDueReviews({ userId, until });
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/spaced-repetition/me/:questionId/complete",
  async (req, res, next) => {
    try {
      const userId = requireUserId(req);
      const parsed = completeReviewSchema.safeParse(req.body);
      if (!parsed.success) return next(parsed.error);
      const result = await completeReview({
        userId,
        questionId: req.params.questionId,
        correct: parsed.data.correct,
      });
      if (!result) throw notFound("Review row not found.");
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.patch("/users/me/review-frequency", async (req, res, next) => {
  try {
    const userId = requireUserId(req);
    const parsed = reviewFrequencySchema.safeParse(req.body);
    if (!parsed.success) return next(parsed.error);
    await prisma.user.update({
      where: { id: userId },
      data: { reviewFrequency: parsed.data.reviewFrequency },
    });
    res.json({ reviewFrequency: parsed.data.reviewFrequency });
  } catch (err) {
    next(err);
  }
});

export default router;
