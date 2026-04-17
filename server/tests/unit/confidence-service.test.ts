import { describe, it, expect, beforeEach } from "vitest";

import prisma from "../../src/lib/prisma";
import {
  computeConfidence,
  getConfidenceMap,
  getWeakestTopics,
  recomputeConfidence,
  RECENT_DAYS,
} from "../../src/services/confidenceService";

const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

const DAY = 1000 * 60 * 60 * 24;

describe("computeConfidence (pure)", () => {
  const now = new Date("2026-04-17T12:00:00Z");

  it("returns 0 score for no responses", () => {
    const result = computeConfidence([], now);
    expect(result.score).toBe(0);
    expect(result.sampleSize).toBe(0);
  });

  it("scores recent perfect streak near 100", () => {
    const responses = Array.from({ length: 5 }, (_, i) => ({
      correct: true,
      answeredAt: new Date(now.getTime() - i * DAY),
    }));
    const result = computeConfidence(responses, now);
    // correctRate=1 → 70, streak=5 → 20 full, recency within 7d → 10
    expect(result.score).toBe(100);
  });

  it("drops recency factor linearly after RECENT_DAYS", () => {
    const mostRecent = new Date(now.getTime() - (RECENT_DAYS + 5) * DAY);
    const responses = Array.from({ length: 5 }, () => ({
      correct: true,
      answeredAt: mostRecent,
    }));
    const result = computeConfidence(responses, now);
    // recencyFactor < 1 because mostRecent is older than RECENT_DAYS
    expect(result.recencyFactor).toBeLessThan(1);
    expect(result.recencyFactor).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(100);
  });

  it("breaks the streak at the first wrong answer", () => {
    const responses = [
      { correct: true, answeredAt: now },
      { correct: false, answeredAt: new Date(now.getTime() - DAY) },
      { correct: true, answeredAt: new Date(now.getTime() - 2 * DAY) },
      { correct: true, answeredAt: new Date(now.getTime() - 3 * DAY) },
    ];
    const result = computeConfidence(responses, now);
    // Streak = 1 (only the leading correct), factor = 1/5 = 0.2
    expect(result.streakFactor).toBeCloseTo(0.2);
  });

  it("ignores responses beyond RECENT_WINDOW", () => {
    const responses = Array.from({ length: 15 }, (_, i) => ({
      correct: i < 10, // first 10 correct, last 5 wrong
      answeredAt: new Date(now.getTime() - i * DAY),
    }));
    const result = computeConfidence(responses, now);
    // Only the first 10 count; all correct.
    expect(result.correctRate).toBe(1);
    expect(result.sampleSize).toBe(10);
  });
});

describeIfDb("confidenceService (DB-backed)", () => {
  async function makeUser(suffix: string) {
    return prisma.user.create({
      data: {
        email: `conf-${suffix}-${Date.now()}-${Math.random()}@test.local`,
        password: "x",
        name: "Conf Tester",
      },
    });
  }

  async function makeProfessor() {
    return prisma.professor.create({
      data: {
        name: `Conf Prof ${Date.now()}-${Math.random()}`,
        department: "CS",
        university: "Test U",
      },
    });
  }

  async function seedSession(
    userId: string,
    professorId: string,
    topicGaps: Array<{ topic: string; correctCount: number; totalCount: number }>,
    completedAt: Date = new Date()
  ) {
    const mockExam = await prisma.mockExam.create({
      data: {
        userId,
        professorId,
        noteIds: [],
        noteHash: `conf-hash-${Math.random()}`,
        title: "Conf Fixture",
        questions: [] as unknown as object,
        durationMin: 30,
        geminiVersion: "test",
        promptVersion: "test-v0",
        expiresAt: new Date(Date.now() + 3600_000),
      },
    });
    return prisma.mockExamSession.create({
      data: {
        mockExamId: mockExam.id,
        userId,
        answers: [],
        feedback: [],
        topicGaps: topicGaps as unknown as object,
        completedAt,
      },
    });
  }

  beforeEach(async () => {
    await prisma.confidenceScore.deleteMany({
      where: { user: { email: { contains: "conf-" } } },
    });
  });

  it("persists a score when recompute sees topic data", async () => {
    const user = await makeUser("persist");
    const prof = await makeProfessor();
    await seedSession(user.id, prof.id, [
      { topic: "scrum", correctCount: 8, totalCount: 10 },
    ]);

    const entry = await recomputeConfidence({ userId: user.id, topic: "scrum" });
    expect(entry.topic).toBe("scrum");
    expect(entry.score).toBeGreaterThan(0);
    expect(entry.lastQuestionCount).toBeLessThanOrEqual(10);
  });

  it("getWeakestTopics returns the lowest-scoring topics first", async () => {
    const user = await makeUser("weakest");
    const prof = await makeProfessor();
    await seedSession(user.id, prof.id, [
      { topic: "strong", correctCount: 9, totalCount: 10 },
      { topic: "weak", correctCount: 2, totalCount: 10 },
      { topic: "medium", correctCount: 5, totalCount: 10 },
    ]);

    await recomputeConfidence({ userId: user.id, topic: "strong" });
    await recomputeConfidence({ userId: user.id, topic: "weak" });
    await recomputeConfidence({ userId: user.id, topic: "medium" });

    const weakest = await getWeakestTopics(user.id, 2);
    expect(weakest.map((e) => e.topic)).toEqual(["weak", "medium"]);

    const map = await getConfidenceMap(user.id);
    expect(map.length).toBe(3);
    // Ascending by score — lowest first.
    expect(map[0].score).toBeLessThanOrEqual(map[1].score);
  });
});
