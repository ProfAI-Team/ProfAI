import prisma from "../lib/prisma";

/**
 * Per-(user, topic) confidence score on a 0-100 scale.
 *
 * Score = 70 * correctRate + 20 * streakFactor + 10 * recencyFactor
 * where:
 *   - correctRate: fraction of correct answers over the last N attempts
 *     (N = RECENT_WINDOW, default 10)
 *   - streakFactor: min(1, currentStreak / STREAK_FULL) — consecutive
 *     correct answers building toward "mastered"
 *   - recencyFactor: 1 when answered in last 7 days, decays linearly
 *     to 0 over 30 days
 *
 * Hooked off mockExamService.submit — each topic in the session's
 * topicGaps gets a recompute call (enqueued via BullMQ so the API
 * request isn't blocked).
 */

export const RECENT_WINDOW = 10;
export const STREAK_FULL = 5;
export const RECENT_DAYS = 7;
export const RECENT_DECAY_DAYS = 30;

export interface TopicResponse {
  correct: boolean;
  answeredAt: Date;
}

export interface ConfidenceComputation {
  score: number;
  correctRate: number;
  streakFactor: number;
  recencyFactor: number;
  sampleSize: number;
}

export interface ConfidenceEntry {
  topic: string;
  score: number;
  source: string;
  lastQuestionCount: number;
  updatedAt: Date;
}

/**
 * Pure math — given a bounded list of responses (newest first),
 * return the confidence score and its factors.
 */
export function computeConfidence(
  responses: TopicResponse[],
  now: Date = new Date()
): ConfidenceComputation {
  const recent = responses.slice(0, RECENT_WINDOW);
  if (recent.length === 0) {
    return {
      score: 0,
      correctRate: 0,
      streakFactor: 0,
      recencyFactor: 0,
      sampleSize: 0,
    };
  }

  const correctCount = recent.filter((r) => r.correct).length;
  const correctRate = correctCount / recent.length;

  // Streak = consecutive leading correct answers from the newest.
  let streak = 0;
  for (const r of recent) {
    if (r.correct) streak += 1;
    else break;
  }
  const streakFactor = Math.min(1, streak / STREAK_FULL);

  const mostRecent = recent[0].answeredAt;
  const ageMs = now.getTime() - mostRecent.getTime();
  const ageDays = Math.max(0, ageMs / (1000 * 60 * 60 * 24));
  let recencyFactor: number;
  if (ageDays <= RECENT_DAYS) {
    recencyFactor = 1;
  } else if (ageDays >= RECENT_DECAY_DAYS) {
    recencyFactor = 0;
  } else {
    recencyFactor =
      1 -
      (ageDays - RECENT_DAYS) / (RECENT_DECAY_DAYS - RECENT_DAYS);
  }

  const score = Math.round(
    70 * correctRate + 20 * streakFactor + 10 * recencyFactor
  );

  return {
    score,
    correctRate,
    streakFactor,
    recencyFactor,
    sampleSize: recent.length,
  };
}

/**
 * Recompute + persist a single (user, topic) confidence row.
 *
 * The source data is the user's last N mock-exam sessions that
 * touched this topic. Session `topicGaps` gives us correctCount +
 * totalCount per topic — we treat each row as the aggregate result
 * for that session (not N individual responses). This is a fair
 * approximation when session totals average 2-4 questions per topic.
 */
export async function recomputeConfidence(params: {
  userId: string;
  topic: string;
  source?: string;
}): Promise<ConfidenceEntry> {
  const { userId, topic } = params;

  const sessions = await prisma.mockExamSession.findMany({
    where: { userId, completedAt: { not: null }, topicGaps: { not: null } },
    select: { topicGaps: true, completedAt: true },
    take: 30,
    orderBy: { completedAt: "desc" },
  });

  const responses: TopicResponse[] = [];
  for (const s of sessions) {
    const gaps = s.topicGaps as Array<{
      topic: string;
      correctCount: number;
      totalCount: number;
    }> | null;
    if (!Array.isArray(gaps) || !s.completedAt) continue;
    const match = gaps.find((g) => g.topic === topic);
    if (!match) continue;
    // Expand to individual responses with uniform timestamp so recency
    // + streak logic can work over mixed sessions.
    for (let i = 0; i < match.correctCount; i++) {
      responses.push({ correct: true, answeredAt: s.completedAt });
    }
    for (let i = 0; i < match.totalCount - match.correctCount; i++) {
      responses.push({ correct: false, answeredAt: s.completedAt });
    }
  }

  const { score, sampleSize } = computeConfidence(responses);
  const source = params.source ?? "mock_exam";
  const now = new Date();

  await prisma.confidenceScore.upsert({
    where: { userId_topic: { userId, topic } },
    update: {
      score,
      lastQuestionCount: sampleSize,
      source,
    },
    create: {
      userId,
      topic,
      score,
      lastQuestionCount: sampleSize,
      source,
    },
  });

  return { topic, score, source, lastQuestionCount: sampleSize, updatedAt: now };
}

export async function getConfidenceMap(
  userId: string
): Promise<ConfidenceEntry[]> {
  const rows = await prisma.confidenceScore.findMany({
    where: { userId },
    orderBy: { score: "asc" },
  });
  return rows.map((r) => ({
    topic: r.topic,
    score: r.score,
    source: r.source,
    lastQuestionCount: r.lastQuestionCount,
    updatedAt: r.updatedAt,
  }));
}

export async function getWeakestTopics(
  userId: string,
  n = 3
): Promise<ConfidenceEntry[]> {
  const rows = await prisma.confidenceScore.findMany({
    where: { userId },
    orderBy: { score: "asc" },
    take: n,
  });
  return rows.map((r) => ({
    topic: r.topic,
    score: r.score,
    source: r.source,
    lastQuestionCount: r.lastQuestionCount,
    updatedAt: r.updatedAt,
  }));
}

/**
 * Called by mockExamService.submit once a session is scored. Fires off
 * a recompute per topic that appeared in the session. Each recompute is
 * independent, so we run them in parallel.
 */
export async function recomputeFromSession(params: {
  userId: string;
  topicGaps: Array<{ topic: string }>;
}): Promise<void> {
  const topics = [...new Set(params.topicGaps.map((t) => t.topic))];
  await Promise.all(
    topics.map((topic) =>
      recomputeConfidence({ userId: params.userId, topic })
    )
  );
}
