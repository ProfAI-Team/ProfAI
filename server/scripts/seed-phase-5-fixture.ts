/**
 * Phase 5 smoke fixture — seeds enough DNA / confidence / grade /
 * spaced-repetition data on the demo user so the visual smoke pages
 * (/me/profile, /me/confidence, /me/grades, /me/course-advisor,
 * /me/reviews) have something to render.
 *
 * Idempotent-ish: deletes phase5fixture-prefixed rows before creating
 * new ones. Leaves the demo user intact (use `npm run reset:demo` for
 * a full wipe before running this).
 *
 * Usage:
 *   cd server && DATABASE_URL=... npx tsx scripts/seed-phase-5-fixture.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const DEMO_EMAIL = process.env.DEMO_USER_EMAIL ?? "erdemacar1@stu.aydin.edu.tr";

const prisma = new PrismaClient();

const TOPIC_GAPS_1 = [
  { topic: "Scrum Roles", correctCount: 9, totalCount: 10 },
  { topic: "Sprint Planning", correctCount: 7, totalCount: 10 },
  { topic: "Waterfall", correctCount: 2, totalCount: 8 },
];
const TOPIC_GAPS_2 = [
  { topic: "Scrum Roles", correctCount: 8, totalCount: 10 },
  { topic: "Kanban", correctCount: 6, totalCount: 8 },
  { topic: "Waterfall", correctCount: 3, totalCount: 7 },
];
const TOPIC_GAPS_3 = [
  { topic: "Agile Manifesto", correctCount: 5, totalCount: 6 },
  { topic: "Sprint Planning", correctCount: 6, totalCount: 9 },
  { topic: "Risk Management", correctCount: 1, totalCount: 5 },
];

async function wipe(userId: string) {
  await prisma.academicDNA.deleteMany({ where: { userId } });
  await prisma.confidenceScore.deleteMany({ where: { userId } });
  await prisma.gradeRecord.deleteMany({ where: { userId } });
  await prisma.spacedRepetition.deleteMany({ where: { userId } });

  // Mock exams created by this fixture only.
  const oldMockExams = await prisma.mockExam.findMany({
    where: { userId, noteHash: { startsWith: "phase5fixture-" } },
    select: { id: true },
  });
  if (oldMockExams.length > 0) {
    const ids = oldMockExams.map((m) => m.id);
    await prisma.mockExamSession.deleteMany({
      where: { mockExamId: { in: ids } },
    });
    await prisma.mockExam.deleteMany({ where: { id: { in: ids } } });
  }
}

async function seedSession(
  userId: string,
  professorId: string,
  topicGaps: typeof TOPIC_GAPS_1,
  minutesAgo: number
) {
  const questionCount = topicGaps.reduce((s, g) => s + g.totalCount, 0);
  const questions = Array.from({ length: questionCount }, (_, i) => {
    const topic = topicGaps[i % topicGaps.length].topic;
    return {
      q: `Fixture question ${i + 1} on ${topic}?`,
      type: i % 2 === 0 ? "MC" : "SA",
      options: i % 2 === 0 ? ["A", "B", "C", "D"] : undefined,
      correctAnswer: "A",
      topic,
      difficulty: 3,
      rationale: "fixture",
    };
  });
  const mockExam = await prisma.mockExam.create({
    data: {
      userId,
      professorId,
      noteIds: [],
      noteHash: `phase5fixture-${Math.random()}`,
      title: "Phase 5 Fixture Mock",
      questions: questions as unknown as object,
      durationMin: 60,
      geminiVersion: "fixture",
      promptVersion: "fixture-v0",
      expiresAt: new Date(Date.now() + 24 * 3600_000),
    },
  });
  return prisma.mockExamSession.create({
    data: {
      mockExamId: mockExam.id,
      userId,
      answers: [],
      feedback: [],
      topicGaps: topicGaps as unknown as object,
      completedAt: new Date(Date.now() - minutesAgo * 60 * 1000),
    },
  });
}

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
  });
  if (!user) {
    console.log(`[fixture] no demo user at ${DEMO_EMAIL} — aborting.`);
    return;
  }

  // Make the demo user premium for this run so /me/course-advisor
  // passes the gate end-to-end in the smoke.
  await prisma.user.update({
    where: { id: user.id },
    data: { subscriptionTier: "premium" },
  });

  await wipe(user.id);

  // Any existing professor works for the mock exams — we only need
  // an FK target.
  const prof = await prisma.professor.findFirst();
  if (!prof) {
    console.log("[fixture] no professors in DB — run `npm run seed` first.");
    return;
  }

  // Three sessions → 75 topic entries → well over MIN_QUESTIONS_FOR_DNA (20).
  await seedSession(user.id, prof.id, TOPIC_GAPS_1, 60 * 24);
  await seedSession(user.id, prof.id, TOPIC_GAPS_2, 60 * 24 * 2);
  await seedSession(user.id, prof.id, TOPIC_GAPS_3, 60 * 24 * 3);

  // Seed a handful of confidence scores + grade records + due reviews.
  await prisma.confidenceScore.createMany({
    data: [
      { userId: user.id, topic: "Scrum Roles", score: 85, lastQuestionCount: 20, source: "mock_exam" },
      { userId: user.id, topic: "Sprint Planning", score: 70, lastQuestionCount: 19, source: "mock_exam" },
      { userId: user.id, topic: "Kanban", score: 55, lastQuestionCount: 8, source: "mock_exam" },
      { userId: user.id, topic: "Waterfall", score: 30, lastQuestionCount: 15, source: "mock_exam" },
      { userId: user.id, topic: "Risk Management", score: 20, lastQuestionCount: 5, source: "mock_exam" },
    ],
  });

  await prisma.gradeRecord.createMany({
    data: [
      {
        userId: user.id,
        courseName: "Software Project Management",
        grade: 88,
        credit: 3,
        semester: "2026-Spring",
        letterGrade: "AA",
        university: "aydin",
      },
      {
        userId: user.id,
        courseName: "Algorithms",
        grade: 72,
        credit: 4,
        semester: "2026-Spring",
        letterGrade: "CB",
        university: "aydin",
      },
      {
        userId: user.id,
        courseName: "Database Systems",
        grade: 81,
        credit: 3,
        semester: "2025-Fall",
        letterGrade: "BA",
        university: "aydin",
      },
    ],
  });

  await prisma.spacedRepetition.createMany({
    data: [
      {
        userId: user.id,
        questionId: "mockExam:phase5-fixture:q1",
        questionText: "What does a Scrum Master do when the team misses a sprint goal?",
        nextReview: new Date(Date.now() - 60_000),
        interval: 1,
        easiness: 2.5,
      },
      {
        userId: user.id,
        questionId: "mockExam:phase5-fixture:q2",
        questionText: "Which artifact captures the committed work for a sprint?",
        nextReview: new Date(Date.now() - 60_000),
        interval: 1,
        easiness: 2.5,
      },
      {
        userId: user.id,
        questionId: "mockExam:phase5-fixture:q3",
        questionText: "In Kanban, what is a WIP limit meant to prevent?",
        nextReview: new Date(Date.now() - 60_000),
        interval: 1,
        easiness: 2.5,
      },
    ],
  });

  console.log(`[fixture] seeded Phase 5 state for ${user.email}`);
  console.log("   3 mock exam sessions (~75 topic entries)");
  console.log("   5 confidence scores");
  console.log("   3 grade records");
  console.log("   3 due spaced-repetition reviews");
  console.log("   subscriptionTier flipped to premium");
}

main()
  .catch((err) => {
    console.error("[fixture] failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
