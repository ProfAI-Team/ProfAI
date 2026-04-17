import prisma from "../lib/prisma";

/**
 * Academic DNA — per-user aggregation of topic strengths/weaknesses,
 * answering correctness, and preferred difficulty. Cache-first (6h TTL)
 * with explicit invalidation via `invalidateDNA()` — called by the
 * Exam-verified hook (examApprovalService) and after every mock exam
 * submit (mockExamService). Learning-style inference lives in the
 * companion `learningStyleService.ts` but is folded in here on read.
 *
 * Rule-based + no Gemini calls. Premium narrative generation is an
 * opt-in future enhancement; the prompt shape is pre-defined but not
 * wired yet (see 5.14 premium tier gating).
 *
 * `DNA_ALGORITHM_VERSION` bumps invalidate every stored row on next
 * read — saves us from hunting down user IDs when the math changes.
 */

export const DNA_ALGORITHM_VERSION = 1;
export const DNA_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
export const MIN_QUESTIONS_FOR_DNA = 20;

export interface DNAScoredTopic {
  topic: string;
  score: number; // 0-100
  confidence: number; // 0-1, based on sampleSize
  sampleSize: number;
}

export interface DNAResult {
  userId: string;
  learningStyle: string | null;
  strengths: DNAScoredTopic[];
  weaknesses: DNAScoredTopic[];
  totalQuestionsAnswered: number;
  correctRate: number | null;
  preferredDifficulty: string | null;
  version: number;
  lastComputedAt: Date;
}

export type DNAResponse =
  | { status: "insufficient"; count: number; minRequired: number }
  | { status: "ready"; dna: DNAResult };

interface TopicAccumulator {
  correctCount: number;
  totalCount: number;
}

function isFresh(lastComputedAt: Date, version: number): boolean {
  if (version !== DNA_ALGORITHM_VERSION) return false;
  return Date.now() - lastComputedAt.getTime() < DNA_CACHE_TTL_MS;
}

function confidenceFor(sampleSize: number): number {
  // Asymptotic — 10 samples ≈ 0.67, 30 ≈ 0.9, 100+ ≈ 0.98.
  return Math.min(1, sampleSize / (sampleSize + 5));
}

function classifyDifficulty(avg: number | null): string | null {
  if (avg === null) return null;
  if (avg <= 2.5) return "easy";
  if (avg <= 3.5) return "medium";
  return "hard";
}

function buildScoredTopics(
  topicAccum: Map<string, TopicAccumulator>
): DNAScoredTopic[] {
  return [...topicAccum.entries()]
    .filter(([, acc]) => acc.totalCount >= 3)
    .map(([topic, acc]) => ({
      topic,
      score: Math.round((acc.correctCount / acc.totalCount) * 100),
      confidence: confidenceFor(acc.totalCount),
      sampleSize: acc.totalCount,
    }));
}

/**
 * Aggregate a user's mock exam sessions into raw topic-level counters.
 * Pulled out of `recomputeDNA` so unit tests can exercise the math
 * without faking the DB round-trip for `findMany`.
 */
export function aggregateTopicGaps(
  topicGapsPerSession: Array<Array<{
    topic: string;
    correctCount: number;
    totalCount: number;
  }>>
): {
  topicAccum: Map<string, TopicAccumulator>;
  totalCorrect: number;
  totalQuestions: number;
} {
  const topicAccum = new Map<string, TopicAccumulator>();
  let totalCorrect = 0;
  let totalQuestions = 0;

  for (const sessionGaps of topicGapsPerSession) {
    for (const gap of sessionGaps) {
      const current = topicAccum.get(gap.topic) ?? {
        correctCount: 0,
        totalCount: 0,
      };
      current.correctCount += gap.correctCount;
      current.totalCount += gap.totalCount;
      topicAccum.set(gap.topic, current);
      totalCorrect += gap.correctCount;
      totalQuestions += gap.totalCount;
    }
  }

  return { topicAccum, totalCorrect, totalQuestions };
}

/**
 * Recompute and persist the user's DNA. Caller should usually go through
 * `getDNA()` which cache-checks first.
 */
export async function recomputeDNA(userId: string): Promise<DNAResponse> {
  const sessions = await prisma.mockExamSession.findMany({
    where: { userId, completedAt: { not: null } },
    include: {
      mockExam: { select: { questions: true } },
    },
    take: 100,
    orderBy: { completedAt: "desc" },
  });

  const topicGapsPerSession = sessions
    .map(
      (s) =>
        s.topicGaps as Array<{
          topic: string;
          correctCount: number;
          totalCount: number;
        }> | null
    )
    .filter(
      (gaps): gaps is Array<{ topic: string; correctCount: number; totalCount: number }> =>
        Array.isArray(gaps)
    );

  const { topicAccum, totalCorrect, totalQuestions } =
    aggregateTopicGaps(topicGapsPerSession);

  if (totalQuestions < MIN_QUESTIONS_FOR_DNA) {
    // Persist the insufficient state so callers can still hit the cache
    // path. The UI reads `totalQuestionsAnswered` to render the
    // "DNA oluşuyor" banner.
    await prisma.academicDNA.upsert({
      where: { userId },
      update: {
        learningStyle: null,
        strengths: [],
        weaknesses: [],
        totalQuestionsAnswered: totalQuestions,
        correctRate: null,
        preferredDifficulty: null,
        version: DNA_ALGORITHM_VERSION,
        lastComputedAt: new Date(),
      },
      create: {
        userId,
        learningStyle: null,
        strengths: [],
        weaknesses: [],
        totalQuestionsAnswered: totalQuestions,
        correctRate: null,
        preferredDifficulty: null,
        version: DNA_ALGORITHM_VERSION,
        lastComputedAt: new Date(),
      },
    });
    return {
      status: "insufficient",
      count: totalQuestions,
      minRequired: MIN_QUESTIONS_FOR_DNA,
    };
  }

  const scored = buildScoredTopics(topicAccum);
  const sortedDesc = [...scored].sort((a, b) => b.score - a.score);
  const strengths = sortedDesc.filter((t) => t.score >= 70).slice(0, 5);
  const weaknesses = [...sortedDesc]
    .reverse()
    .filter((t) => t.score < 50)
    .slice(0, 5);

  const correctRate = totalCorrect / totalQuestions;

  // Average difficulty across the questions actually answered. We fold
  // in the mock exam's question list where possible — the session's own
  // topicGaps don't carry difficulty.
  let difficultySum = 0;
  let difficultyCount = 0;
  for (const s of sessions) {
    const qs = s.mockExam.questions as Array<{ difficulty?: number }> | null;
    if (!Array.isArray(qs)) continue;
    for (const q of qs) {
      if (typeof q.difficulty === "number") {
        difficultySum += q.difficulty;
        difficultyCount += 1;
      }
    }
  }
  const avgDifficulty = difficultyCount > 0 ? difficultySum / difficultyCount : null;
  const preferredDifficulty = classifyDifficulty(avgDifficulty);

  const now = new Date();
  await prisma.academicDNA.upsert({
    where: { userId },
    update: {
      learningStyle: null, // populated by learningStyleService in 5.9
      strengths: strengths as unknown as object,
      weaknesses: weaknesses as unknown as object,
      totalQuestionsAnswered: totalQuestions,
      correctRate,
      preferredDifficulty,
      version: DNA_ALGORITHM_VERSION,
      lastComputedAt: now,
    },
    create: {
      userId,
      learningStyle: null,
      strengths: strengths as unknown as object,
      weaknesses: weaknesses as unknown as object,
      totalQuestionsAnswered: totalQuestions,
      correctRate,
      preferredDifficulty,
      version: DNA_ALGORITHM_VERSION,
      lastComputedAt: now,
    },
  });

  return {
    status: "ready",
    dna: {
      userId,
      learningStyle: null,
      strengths,
      weaknesses,
      totalQuestionsAnswered: totalQuestions,
      correctRate,
      preferredDifficulty,
      version: DNA_ALGORITHM_VERSION,
      lastComputedAt: now,
    },
  };
}

/**
 * Read the user's DNA — cache hit if stored row is same algorithm
 * version + younger than DNA_CACHE_TTL_MS. Otherwise recomputes.
 */
export async function getDNA(userId: string): Promise<DNAResponse> {
  const cached = await prisma.academicDNA.findUnique({ where: { userId } });
  if (cached && isFresh(cached.lastComputedAt, cached.version)) {
    if (cached.totalQuestionsAnswered < MIN_QUESTIONS_FOR_DNA) {
      return {
        status: "insufficient",
        count: cached.totalQuestionsAnswered,
        minRequired: MIN_QUESTIONS_FOR_DNA,
      };
    }
    return {
      status: "ready",
      dna: {
        userId,
        learningStyle: cached.learningStyle,
        strengths: cached.strengths as unknown as DNAScoredTopic[],
        weaknesses: cached.weaknesses as unknown as DNAScoredTopic[],
        totalQuestionsAnswered: cached.totalQuestionsAnswered,
        correctRate: cached.correctRate,
        preferredDifficulty: cached.preferredDifficulty,
        version: cached.version,
        lastComputedAt: cached.lastComputedAt,
      },
    };
  }
  return recomputeDNA(userId);
}

/**
 * Invalidate + immediately recompute one or more users' DNAs. Called by
 * the Exam.verified hook (approval threshold → uploader + approvers
 * all have new source data that could shift their profiles).
 */
export async function invalidateDNA(userIds: string[]): Promise<void> {
  if (userIds.length === 0) return;
  await prisma.academicDNA.updateMany({
    where: { userId: { in: userIds } },
    // Setting lastComputedAt backwards forces `isFresh` to return false
    // without actually deleting the row (keeps `totalQuestionsAnswered`
    // readable for banner copy in the meantime).
    data: { lastComputedAt: new Date(0) },
  });
}
