import prisma from "../lib/prisma";

/**
 * Spaced repetition — simplified SM-2.
 *
 * Weak-answered mock-exam questions get queued here. Each review the
 * user completes adjusts the `easiness` factor and `interval` (days):
 *
 *   Correct:
 *     easiness   += 0.10  (clamped to [MIN_EASINESS, MAX_EASINESS])
 *     interval    = nextIntervalCorrect(prev, easiness)
 *     correctStreak += 1
 *
 *   Wrong:
 *     easiness   -= 0.20  (clamped)
 *     interval    = 1
 *     correctStreak = 0
 *     lapseCount   += 1
 *
 * Raw SM-2 grows intervals continuously; we snap to INTERVAL_TIERS
 * (1, 3, 7, 14, 30, 90) so the calendar UI (5.22) has a stable grid
 * and the user's mental model is "days away, not a precise number".
 */

export const MIN_EASINESS = 1.3;
export const MAX_EASINESS = 2.8;
export const INITIAL_EASINESS = 2.5;
export const INTERVAL_TIERS = [1, 3, 7, 14, 30, 90] as const;

function clampEasiness(value: number): number {
  if (value < MIN_EASINESS) return MIN_EASINESS;
  if (value > MAX_EASINESS) return MAX_EASINESS;
  return Math.round(value * 100) / 100;
}

/**
 * Snap a continuous SM-2 interval (previous * easiness) to the nearest
 * tier at or above it — so a user never waits less than their last
 * correct response earned them.
 */
function snapToTier(continuousInterval: number): number {
  for (const tier of INTERVAL_TIERS) {
    if (continuousInterval <= tier) return tier;
  }
  return INTERVAL_TIERS[INTERVAL_TIERS.length - 1];
}

export function nextIntervalCorrect(
  previousInterval: number,
  easiness: number
): number {
  const raw = previousInterval * easiness;
  return snapToTier(raw);
}

export interface SM2Result {
  interval: number;
  easiness: number;
  correctStreak: number;
  lapseCount: number;
  nextReview: Date;
}

export function applySM2(input: {
  interval: number;
  easiness: number;
  correctStreak: number;
  lapseCount: number;
  correct: boolean;
  now: Date;
}): SM2Result {
  if (input.correct) {
    const easiness = clampEasiness(input.easiness + 0.1);
    const interval = nextIntervalCorrect(
      // Bootstrap: first correct review jumps from 1→3 because 1 × e still
      // snaps to the next tier. Using the stored interval keeps the SM-2
      // intent (past correct cadence controls future spacing).
      input.interval,
      easiness
    );
    const nextReview = new Date(input.now);
    nextReview.setDate(nextReview.getDate() + interval);
    return {
      interval,
      easiness,
      correctStreak: input.correctStreak + 1,
      lapseCount: input.lapseCount,
      nextReview,
    };
  }
  const easiness = clampEasiness(input.easiness - 0.2);
  const interval = 1;
  const nextReview = new Date(input.now);
  nextReview.setDate(nextReview.getDate() + interval);
  return {
    interval,
    easiness,
    correctStreak: 0,
    lapseCount: input.lapseCount + 1,
    nextReview,
  };
}

/**
 * Queue a question for review. Idempotent-ish: the (userId, questionId)
 * unique constraint means re-scheduling the same question resets its
 * timer rather than creating a second row. Called by mockExamService on
 * every incorrectly-answered question.
 */
export async function scheduleReview(params: {
  userId: string;
  questionId: string;
  questionText?: string;
}): Promise<{ id: string; nextReview: Date }> {
  const now = new Date();
  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + 1);

  const row = await prisma.spacedRepetition.upsert({
    where: {
      userId_questionId: {
        userId: params.userId,
        questionId: params.questionId,
      },
    },
    update: {
      // Reset the clock — a wrong answer pulls the question back to the
      // front of the queue.
      nextReview,
      interval: 1,
      easiness: INITIAL_EASINESS,
      correctStreak: 0,
      lastReviewed: null,
      ...(params.questionText !== undefined
        ? { questionText: params.questionText }
        : {}),
    },
    create: {
      userId: params.userId,
      questionId: params.questionId,
      questionText: params.questionText,
      nextReview,
      interval: 1,
      easiness: INITIAL_EASINESS,
      correctStreak: 0,
      lapseCount: 0,
    },
  });
  return { id: row.id, nextReview: row.nextReview };
}

export async function getDueReviews(params: {
  userId: string;
  until?: Date;
  limit?: number;
}): Promise<
  Array<{
    id: string;
    questionId: string;
    questionText: string | null;
    nextReview: Date;
    interval: number;
    correctStreak: number;
    lapseCount: number;
  }>
> {
  const until = params.until ?? new Date();
  const rows = await prisma.spacedRepetition.findMany({
    where: {
      userId: params.userId,
      nextReview: { lte: until },
    },
    orderBy: { nextReview: "asc" },
    take: params.limit ?? 50,
  });
  return rows.map((r) => ({
    id: r.id,
    questionId: r.questionId,
    questionText: r.questionText,
    nextReview: r.nextReview,
    interval: r.interval,
    correctStreak: r.correctStreak,
    lapseCount: r.lapseCount,
  }));
}

export async function completeReview(params: {
  userId: string;
  questionId: string;
  correct: boolean;
}): Promise<SM2Result | null> {
  const existing = await prisma.spacedRepetition.findUnique({
    where: {
      userId_questionId: {
        userId: params.userId,
        questionId: params.questionId,
      },
    },
  });
  if (!existing) return null;

  const now = new Date();
  const result = applySM2({
    interval: existing.interval,
    easiness: existing.easiness,
    correctStreak: existing.correctStreak,
    lapseCount: existing.lapseCount,
    correct: params.correct,
    now,
  });

  await prisma.spacedRepetition.update({
    where: { id: existing.id },
    data: {
      interval: result.interval,
      easiness: result.easiness,
      correctStreak: result.correctStreak,
      lapseCount: result.lapseCount,
      nextReview: result.nextReview,
      lastReviewed: now,
    },
  });

  return result;
}

/**
 * Aggregate summary for scheduler/notification jobs — how many reviews
 * are due per user, capped at a reasonable digest size.
 */
export async function countDueByUser(
  until: Date = new Date()
): Promise<Array<{ userId: string; dueCount: number }>> {
  const grouped = await prisma.spacedRepetition.groupBy({
    by: ["userId"],
    where: { nextReview: { lte: until } },
    _count: { _all: true },
  });
  return grouped.map((g) => ({ userId: g.userId, dueCount: g._count._all }));
}
