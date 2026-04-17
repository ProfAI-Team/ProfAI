import { describe, it, expect, beforeEach } from "vitest";

import prisma from "../../src/lib/prisma";
import {
  aggregateTopicGaps,
  DNA_ALGORITHM_VERSION,
  MIN_QUESTIONS_FOR_DNA,
  getDNA,
  invalidateDNA,
  recomputeDNA,
} from "../../src/services/dnaService";

const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

describe("aggregateTopicGaps (pure)", () => {
  it("sums correct/total counts across sessions + topics", () => {
    const { topicAccum, totalCorrect, totalQuestions } = aggregateTopicGaps([
      [
        { topic: "scrum", correctCount: 3, totalCount: 5 },
        { topic: "agile", correctCount: 4, totalCount: 4 },
      ],
      [{ topic: "scrum", correctCount: 2, totalCount: 3 }],
    ]);

    expect(topicAccum.get("scrum")).toEqual({ correctCount: 5, totalCount: 8 });
    expect(topicAccum.get("agile")).toEqual({ correctCount: 4, totalCount: 4 });
    expect(totalCorrect).toBe(9);
    expect(totalQuestions).toBe(12);
  });

  it("returns empty accumulators for no sessions", () => {
    const { topicAccum, totalCorrect, totalQuestions } = aggregateTopicGaps([]);
    expect(topicAccum.size).toBe(0);
    expect(totalCorrect).toBe(0);
    expect(totalQuestions).toBe(0);
  });
});

describeIfDb("dnaService (DB-backed)", () => {
  async function makeUser(suffix: string) {
    return prisma.user.create({
      data: {
        email: `dna-${suffix}-${Date.now()}-${Math.random()}@test.local`,
        password: "x",
        name: "DNA Tester",
      },
    });
  }

  async function makeProfessor() {
    return prisma.professor.create({
      data: {
        name: `DNA Test Prof ${Date.now()}-${Math.random()}`,
        department: "CS",
        university: "Test U",
      },
    });
  }

  async function seedMockExamSession(opts: {
    userId: string;
    professorId: string;
    topicGaps: Array<{ topic: string; correctCount: number; totalCount: number }>;
    questions: Array<{ topic: string; difficulty: number }>;
  }) {
    const mockExam = await prisma.mockExam.create({
      data: {
        userId: opts.userId,
        professorId: opts.professorId,
        noteIds: [],
        noteHash: `dna-hash-${Math.random()}`,
        title: "DNA Fixture Mock",
        questions: opts.questions as unknown as object,
        durationMin: 30,
        geminiVersion: "test",
        promptVersion: "test-v0",
        expiresAt: new Date(Date.now() + 3600_000),
      },
    });
    return prisma.mockExamSession.create({
      data: {
        mockExamId: mockExam.id,
        userId: opts.userId,
        answers: [],
        feedback: [],
        topicGaps: opts.topicGaps as unknown as object,
        completedAt: new Date(),
        score: 0,
      },
    });
  }

  beforeEach(async () => {
    await prisma.academicDNA.deleteMany({
      where: { user: { email: { contains: "dna-" } } },
    });
  });

  it("returns insufficient for a user under MIN_QUESTIONS_FOR_DNA", async () => {
    const user = await makeUser("insufficient");
    const prof = await makeProfessor();
    await seedMockExamSession({
      userId: user.id,
      professorId: prof.id,
      topicGaps: [{ topic: "scrum", correctCount: 5, totalCount: 10 }],
      questions: Array(10).fill({ topic: "scrum", difficulty: 3 }),
    });

    const result = await recomputeDNA(user.id);
    expect(result.status).toBe("insufficient");
    if (result.status === "insufficient") {
      expect(result.count).toBe(10);
      expect(result.minRequired).toBe(MIN_QUESTIONS_FOR_DNA);
    }
  });

  it("classifies strengths/weaknesses correctly when there are enough answers", async () => {
    const user = await makeUser("ready");
    const prof = await makeProfessor();
    await seedMockExamSession({
      userId: user.id,
      professorId: prof.id,
      topicGaps: [
        // Strong topic: 9/10 correct → 90 score
        { topic: "scrum", correctCount: 9, totalCount: 10 },
        // Weak topic: 1/8 correct → 12 score
        { topic: "waterfall", correctCount: 1, totalCount: 8 },
        // Middle: 5/8 correct → 62 score — neither strength nor weakness
        { topic: "kanban", correctCount: 5, totalCount: 8 },
      ],
      questions: Array(26).fill({ topic: "scrum", difficulty: 3 }),
    });

    const result = await recomputeDNA(user.id);
    expect(result.status).toBe("ready");
    if (result.status === "ready") {
      expect(result.dna.totalQuestionsAnswered).toBe(26);
      expect(result.dna.strengths.map((t) => t.topic)).toContain("scrum");
      expect(result.dna.weaknesses.map((t) => t.topic)).toContain("waterfall");
      expect(result.dna.strengths.find((t) => t.topic === "scrum")?.score).toBe(90);
      expect(result.dna.correctRate).toBeCloseTo(15 / 26, 2);
      expect(result.dna.preferredDifficulty).toBe("medium");
      expect(result.dna.version).toBe(DNA_ALGORITHM_VERSION);
    }
  });

  it("persists + returns from cache on a second read within TTL", async () => {
    const user = await makeUser("cache");
    const prof = await makeProfessor();
    await seedMockExamSession({
      userId: user.id,
      professorId: prof.id,
      topicGaps: [{ topic: "scrum", correctCount: 20, totalCount: 25 }],
      questions: Array(25).fill({ topic: "scrum", difficulty: 4 }),
    });

    const first = await getDNA(user.id);
    expect(first.status).toBe("ready");

    // Mutate source data — a second getDNA without invalidate should
    // return the cached row (unchanged totalQuestionsAnswered).
    await seedMockExamSession({
      userId: user.id,
      professorId: prof.id,
      topicGaps: [{ topic: "agile", correctCount: 10, totalCount: 10 }],
      questions: Array(10).fill({ topic: "agile", difficulty: 2 }),
    });

    const second = await getDNA(user.id);
    expect(second.status).toBe("ready");
    if (first.status === "ready" && second.status === "ready") {
      expect(second.dna.totalQuestionsAnswered).toBe(
        first.dna.totalQuestionsAnswered
      );
    }
  });

  it("invalidateDNA forces next getDNA to recompute", async () => {
    const user = await makeUser("invalidate");
    const prof = await makeProfessor();
    await seedMockExamSession({
      userId: user.id,
      professorId: prof.id,
      topicGaps: [{ topic: "scrum", correctCount: 15, totalCount: 20 }],
      questions: Array(20).fill({ topic: "scrum", difficulty: 3 }),
    });
    await getDNA(user.id); // prime cache

    // Add more source data + invalidate.
    await seedMockExamSession({
      userId: user.id,
      professorId: prof.id,
      topicGaps: [{ topic: "agile", correctCount: 5, totalCount: 5 }],
      questions: Array(5).fill({ topic: "agile", difficulty: 2 }),
    });
    await invalidateDNA([user.id]);

    const result = await getDNA(user.id);
    expect(result.status).toBe("ready");
    if (result.status === "ready") {
      expect(result.dna.totalQuestionsAnswered).toBe(25);
    }
  });
});
