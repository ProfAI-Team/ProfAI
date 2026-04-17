import { describe, it, expect, beforeEach } from "vitest";

import prisma from "../../src/lib/prisma";
import {
  applySM2,
  completeReview,
  countDueByUser,
  getDueReviews,
  INITIAL_EASINESS,
  INTERVAL_TIERS,
  MIN_EASINESS,
  MAX_EASINESS,
  nextIntervalCorrect,
  scheduleReview,
} from "../../src/services/spacedRepetitionService";

const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

describe("spacedRepetitionService SM-2 (pure)", () => {
  const now = new Date("2026-04-17T12:00:00Z");

  it("clamps easiness to MIN/MAX bounds", () => {
    const floor = applySM2({
      interval: 1,
      easiness: MIN_EASINESS,
      correctStreak: 0,
      lapseCount: 0,
      correct: false,
      now,
    });
    expect(floor.easiness).toBe(MIN_EASINESS);

    let ceiling = INITIAL_EASINESS;
    for (let i = 0; i < 20; i++) {
      const step = applySM2({
        interval: 1,
        easiness: ceiling,
        correctStreak: 0,
        lapseCount: 0,
        correct: true,
        now,
      });
      ceiling = step.easiness;
    }
    expect(ceiling).toBeLessThanOrEqual(MAX_EASINESS);
  });

  it("increments correctStreak on correct, resets on wrong", () => {
    const after1 = applySM2({
      interval: 1,
      easiness: INITIAL_EASINESS,
      correctStreak: 0,
      lapseCount: 0,
      correct: true,
      now,
    });
    expect(after1.correctStreak).toBe(1);

    const lapsed = applySM2({
      interval: after1.interval,
      easiness: after1.easiness,
      correctStreak: after1.correctStreak,
      lapseCount: 0,
      correct: false,
      now,
    });
    expect(lapsed.correctStreak).toBe(0);
    expect(lapsed.interval).toBe(1);
    expect(lapsed.lapseCount).toBe(1);
  });

  it("snaps intervals to the tier ladder", () => {
    expect(INTERVAL_TIERS).toContain(1);
    expect(INTERVAL_TIERS).toContain(90);

    // Easiness 2.5, previous interval 1 → raw 2.5 → snap to 3.
    expect(nextIntervalCorrect(1, 2.5)).toBe(3);
    // Easiness 2.5, previous 3 → raw 7.5 → snap to 14.
    expect(nextIntervalCorrect(3, 2.5)).toBe(14);
    // Raw > 90 → capped at 90.
    expect(nextIntervalCorrect(50, 2.5)).toBe(90);
  });

  it("schedules nextReview `interval` days forward", () => {
    const result = applySM2({
      interval: 1,
      easiness: INITIAL_EASINESS,
      correctStreak: 0,
      lapseCount: 0,
      correct: true,
      now,
    });
    const diffDays = Math.round(
      (result.nextReview.getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    expect(diffDays).toBe(result.interval);
  });
});

describeIfDb("spacedRepetitionService (DB-backed)", () => {
  async function makeUser(suffix: string) {
    return prisma.user.create({
      data: {
        email: `sr-${suffix}-${Date.now()}-${Math.random()}@test.local`,
        password: "x",
        name: "SR Tester",
      },
    });
  }

  beforeEach(async () => {
    await prisma.spacedRepetition.deleteMany({
      where: { user: { email: { contains: "sr-" } } },
    });
  });

  it("scheduleReview creates a row due tomorrow with defaults", async () => {
    const user = await makeUser("schedule");
    const { nextReview } = await scheduleReview({
      userId: user.id,
      questionId: "mockExam:abc:q1",
      questionText: "What is scrum?",
    });
    const diff = nextReview.getTime() - Date.now();
    expect(diff).toBeGreaterThan(0);
    expect(diff).toBeLessThan(2 * 24 * 60 * 60 * 1000);
  });

  it("scheduleReview upserts — reschedules without duplicating the row", async () => {
    const user = await makeUser("upsert");
    await scheduleReview({
      userId: user.id,
      questionId: "mockExam:abc:q1",
      questionText: "First schedule",
    });
    await scheduleReview({
      userId: user.id,
      questionId: "mockExam:abc:q1",
      questionText: "Second schedule",
    });
    const rows = await prisma.spacedRepetition.findMany({
      where: { userId: user.id },
    });
    expect(rows.length).toBe(1);
    expect(rows[0].questionText).toBe("Second schedule");
  });

  it("completeReview updates interval + easiness after a correct answer", async () => {
    const user = await makeUser("complete-ok");
    await scheduleReview({ userId: user.id, questionId: "q1" });
    const result = await completeReview({
      userId: user.id,
      questionId: "q1",
      correct: true,
    });
    expect(result).not.toBeNull();
    expect(result!.correctStreak).toBe(1);
    expect(result!.interval).toBeGreaterThan(1);
    expect(result!.easiness).toBeGreaterThan(INITIAL_EASINESS);
  });

  it("completeReview lapses after a wrong answer", async () => {
    const user = await makeUser("complete-fail");
    await scheduleReview({ userId: user.id, questionId: "q2" });
    // Step forward to build a streak.
    await completeReview({ userId: user.id, questionId: "q2", correct: true });
    const wrong = await completeReview({
      userId: user.id,
      questionId: "q2",
      correct: false,
    });
    expect(wrong!.correctStreak).toBe(0);
    expect(wrong!.interval).toBe(1);
    expect(wrong!.lapseCount).toBe(1);
  });

  it("getDueReviews only returns items past their nextReview", async () => {
    const user = await makeUser("due");
    // Manually insert one already-due, one far in the future.
    await prisma.spacedRepetition.create({
      data: {
        userId: user.id,
        questionId: "due",
        nextReview: new Date(Date.now() - 60_000),
        interval: 1,
        easiness: INITIAL_EASINESS,
      },
    });
    await prisma.spacedRepetition.create({
      data: {
        userId: user.id,
        questionId: "future",
        nextReview: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        interval: 30,
        easiness: INITIAL_EASINESS,
      },
    });

    const due = await getDueReviews({ userId: user.id });
    expect(due.map((d) => d.questionId)).toEqual(["due"]);
  });

  it("countDueByUser rolls up per user", async () => {
    const alice = await makeUser("count-a");
    const bob = await makeUser("count-b");
    await prisma.spacedRepetition.create({
      data: {
        userId: alice.id,
        questionId: "q1",
        nextReview: new Date(Date.now() - 60_000),
        interval: 1,
        easiness: INITIAL_EASINESS,
      },
    });
    await prisma.spacedRepetition.create({
      data: {
        userId: alice.id,
        questionId: "q2",
        nextReview: new Date(Date.now() - 60_000),
        interval: 1,
        easiness: INITIAL_EASINESS,
      },
    });
    await prisma.spacedRepetition.create({
      data: {
        userId: bob.id,
        questionId: "q3",
        nextReview: new Date(Date.now() - 60_000),
        interval: 1,
        easiness: INITIAL_EASINESS,
      },
    });

    const counts = await countDueByUser();
    const alicePair = counts.find((c) => c.userId === alice.id);
    const bobPair = counts.find((c) => c.userId === bob.id);
    expect(alicePair?.dueCount).toBe(2);
    expect(bobPair?.dueCount).toBe(1);
  });
});
