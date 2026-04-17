import prisma from "../lib/prisma";

/**
 * Learning style inference.
 *
 * We fold the user's mock-exam performance into a crude style bucket by
 * mapping question format → style proxy and picking the bucket with the
 * strongest accuracy signal. Honest limitations:
 * - No visual signal yet (Phase 6 voice/image content fills that).
 * - Mapping is coarse; MC/TF/SA is all we have until content types
 *   diversify. Treated as "tahmin / user can override".
 *
 * Mapping:
 *   - MC (multiple choice) / TF (true-false) → "reading"
 *   - SA (short answer)                       → "kinesthetic"
 *
 * Insufficient when totalAnswered < MIN_QUESTIONS, or no bucket leads
 * another by at least DOMINANCE_GAP percentage points. Service returns
 * `null` in both cases and UI surfaces the "DNA oluşuyor" banner.
 *
 * User override (via PATCH /api/dna/me/learning-style) writes directly
 * to AcademicDNA.learningStyle and takes precedence over inference —
 * the endpoint layer handles that, this service only infers.
 */

export const MIN_QUESTIONS_FOR_STYLE = 20;
export const DOMINANCE_GAP = 0.15; // 15 percentage points

const TYPE_TO_STYLE: Record<string, "reading" | "kinesthetic"> = {
  MC: "reading",
  TF: "reading",
  SA: "kinesthetic",
};

type StyleBucket = "reading" | "kinesthetic" | "visual" | "auditory";

interface BucketStats {
  correct: number;
  total: number;
}

export interface StyleInferenceOutput {
  style: StyleBucket | "mixed" | null;
  totalAnswered: number;
  breakdown: Record<StyleBucket, BucketStats>;
}

/**
 * Pure math: given the user's per-question (type, correct) pairs,
 * return the inferred style bucket. Pulled out so unit tests can
 * exercise the logic without a DB.
 */
export function inferStyle(
  responses: Array<{ type: string; correct: boolean }>
): StyleInferenceOutput {
  const breakdown: Record<StyleBucket, BucketStats> = {
    reading: { correct: 0, total: 0 },
    kinesthetic: { correct: 0, total: 0 },
    visual: { correct: 0, total: 0 },
    auditory: { correct: 0, total: 0 },
  };

  for (const r of responses) {
    const bucket = TYPE_TO_STYLE[r.type];
    if (!bucket) continue;
    breakdown[bucket].total += 1;
    if (r.correct) breakdown[bucket].correct += 1;
  }

  const totalAnswered = Object.values(breakdown).reduce(
    (sum, b) => sum + b.total,
    0
  );

  if (totalAnswered < MIN_QUESTIONS_FOR_STYLE) {
    return { style: null, totalAnswered, breakdown };
  }

  // Accuracy per bucket; skip buckets with no samples.
  const ranked = (Object.entries(breakdown) as Array<[
    StyleBucket,
    BucketStats
  ]>)
    .filter(([, stats]) => stats.total >= 3)
    .map(([bucket, stats]) => ({
      bucket,
      accuracy: stats.correct / stats.total,
    }))
    .sort((a, b) => b.accuracy - a.accuracy);

  if (ranked.length === 0) {
    return { style: null, totalAnswered, breakdown };
  }
  if (ranked.length === 1) {
    // Only one bucket had enough samples — not "dominant", just
    // "only thing we can measure".
    return { style: ranked[0].bucket, totalAnswered, breakdown };
  }

  const [top, runnerUp] = ranked;
  if (top.accuracy - runnerUp.accuracy >= DOMINANCE_GAP) {
    return { style: top.bucket, totalAnswered, breakdown };
  }
  return { style: "mixed", totalAnswered, breakdown };
}

/**
 * Walk the user's completed mock exam sessions, join each answer to the
 * corresponding question's `type`, and run the inference.
 */
export async function inferLearningStyle(
  userId: string
): Promise<StyleInferenceOutput> {
  const sessions = await prisma.mockExamSession.findMany({
    where: { userId, completedAt: { not: null } },
    include: {
      mockExam: { select: { questions: true } },
    },
    take: 50,
    orderBy: { completedAt: "desc" },
  });

  const responses: Array<{ type: string; correct: boolean }> = [];

  for (const s of sessions) {
    const feedback = s.feedback as Array<{
      qIdx: number;
      correct: boolean;
    }> | null;
    const questions = s.mockExam.questions as Array<{
      type: string;
    }> | null;
    if (!Array.isArray(feedback) || !Array.isArray(questions)) continue;

    for (const fb of feedback) {
      const q = questions[fb.qIdx];
      if (!q || typeof q.type !== "string") continue;
      responses.push({ type: q.type, correct: !!fb.correct });
    }
  }

  return inferStyle(responses);
}

/**
 * Persist the inferred style onto AcademicDNA. Call after DNA has been
 * recomputed — we don't upsert a DNA row here, we only update an
 * existing one (getDNA creates rows; this service piggybacks).
 */
export async function updateLearningStyleFromInference(
  userId: string
): Promise<StyleBucket | "mixed" | null> {
  const { style } = await inferLearningStyle(userId);
  await prisma.academicDNA.updateMany({
    where: { userId },
    data: { learningStyle: style },
  });
  return style;
}
