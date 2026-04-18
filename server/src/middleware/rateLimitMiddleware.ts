import rateLimit, { Options } from "express-rate-limit";
import type { Request } from "express";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const userKey = (req: Request): string => {
  if (req.user?.id) return `user:${req.user.id}`;
  return `ip:${req.ip ?? "unknown"}`;
};

type QuotaOptions = {
  name: string;
  windowMs: number;
  max: number;
  message: string;
};

const rateLimited = (opts: QuotaOptions): Partial<Options> => ({
  windowMs: opts.windowMs,
  max: opts.max,
  keyGenerator: userKey,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retryAfterSec = Math.ceil(opts.windowMs / 1000);
    res.status(429).json({
      error: {
        code: "RATE_LIMITED",
        message: opts.message,
        retryAfterSec,
        scope: opts.name,
      },
    });
  },
});

export const mockExamHourlyLimiter = rateLimit(
  rateLimited({
    name: "mock-exam:hourly",
    windowMs: HOUR_MS,
    max: 3,
    message: "Hourly mock exam limit reached.",
  })
);

export const mockExamDailyLimiter = rateLimit(
  rateLimited({
    name: "mock-exam:daily",
    windowMs: DAY_MS,
    max: 10,
    message: "Daily mock exam limit reached.",
  })
);

export const studyPackHourlyLimiter = rateLimit(
  rateLimited({
    name: "study-pack:hourly",
    windowMs: HOUR_MS,
    max: 5,
    message: "Hourly study pack limit reached.",
  })
);

export const panicPlanDailyLimiter = rateLimit(
  rateLimited({
    name: "panic-plan:daily",
    windowMs: DAY_MS,
    max: 5,
    message: "Daily panic plan limit reached.",
  })
);

// Phase 4 — community endpoints. Quotas are tuned to discourage
// brigading (votes) and spam (reports, group joins) without punishing
// active contributors. Values are deliberate conservatives; the Phase 4
// retro may loosen them.
export const approvalDailyLimiter = rateLimit(
  rateLimited({
    name: "approval:daily",
    windowMs: DAY_MS,
    max: 30,
    message: "Daily approval limit reached.",
  })
);

export const voteDailyLimiter = rateLimit(
  rateLimited({
    name: "vote:daily",
    windowMs: DAY_MS,
    max: 50,
    message: "Daily vote limit reached.",
  })
);

export const reportDailyLimiter = rateLimit(
  rateLimited({
    name: "post-exam-report:daily",
    windowMs: DAY_MS,
    max: 3,
    message: "Daily report limit reached.",
  })
);

export const groupJoinDailyLimiter = rateLimit(
  rateLimited({
    name: "study-group:daily",
    windowMs: DAY_MS,
    max: 5,
    message: "Daily study group action limit reached.",
  })
);

// Phase 5 — DNA / grades / advisor endpoints. Recompute + advisor
// calls are relatively expensive (join-heavy reads + potential Gemini
// hit behind premium); grade writes are cheap but the user should
// be nudged if they're trying to add 50 grades at once (almost
// always a bot or a typo).
export const dnaRecomputeDailyLimiter = rateLimit(
  rateLimited({
    name: "dna-recompute:daily",
    windowMs: DAY_MS,
    max: 10,
    message: "Daily DNA recompute limit reached.",
  })
);

export const gradeWriteDailyLimiter = rateLimit(
  rateLimited({
    name: "grade-write:daily",
    windowMs: DAY_MS,
    max: 30,
    message: "Daily grade write limit reached.",
  })
);

export const advisorDailyLimiter = rateLimit(
  rateLimited({
    name: "course-advisor:daily",
    windowMs: DAY_MS,
    max: 20,
    message: "Daily course advisor limit reached.",
  })
);

// Phase 6 — multimodal + voice (task 6.15).
export const voiceSessionDailyLimiter = rateLimit(
  rateLimited({
    name: "voice-session:daily",
    windowMs: DAY_MS,
    max: 20,
    message: "Günlük canlı tutor başlatma limiti doldu.",
  })
);

export const ocrUploadDailyLimiter = rateLimit(
  rateLimited({
    name: "ocr-upload:daily",
    windowMs: DAY_MS,
    max: 20,
    message: "Günlük OCR yükleme limiti doldu.",
  })
);

export const lectureUploadDailyLimiter = rateLimit(
  rateLimited({
    name: "lecture-upload:daily",
    windowMs: DAY_MS,
    max: 2,
    message: "Günlük ders kaydı yükleme limiti doldu.",
  })
);

export const multimodalSearchDailyLimiter = rateLimit(
  rateLimited({
    name: "multimodal-search:daily",
    windowMs: DAY_MS,
    max: 10,
    message: "Günlük görselle arama limiti doldu.",
  })
);
