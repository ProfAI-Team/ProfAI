import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import prisma from "../../src/lib/prisma";
import {
  createTutorProfile,
  approveTutor,
  matchTutors,
  completeSession,
  getTutorByUserId,
} from "../../src/services/tutorService";

// Stub the embedding service so tests don't need Gemini credentials.
vi.mock("../../src/services/llm/embeddingService", async () => {
  const actual = await vi.importActual<typeof import("../../src/services/llm/embeddingService")>(
    "../../src/services/llm/embeddingService"
  );
  return {
    ...actual,
    embedText: vi.fn(async () => null),
  };
});

const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

async function makeStudent(email: string) {
  return prisma.user.create({
    data: { email, password: "x", name: "Student" },
  });
}

describeIfDb("tutorService", () => {
  beforeEach(() => {
    process.env.RUN_INLINE_QUEUE = "1";
  });
  afterEach(async () => {
    await prisma.tutoringSession.deleteMany({});
    await prisma.tutor.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: { contains: "@tutor.test" } },
    });
    delete process.env.RUN_INLINE_QUEUE;
  });

  it("createTutorProfile stores specializations + starts in pending state", async () => {
    const user = await makeStudent(`t-${Date.now()}@tutor.test`);
    const tutor = await createTutorProfile({
      userId: user.id,
      bio: "Matematik öğretmeni, 5 yıl deneyim.",
      hourlyRate: 250,
      specializations: [
        { subject: "Calculus", level: "intermediate", tags: ["limits"] },
      ],
      availability: [{ dayOfWeek: 1, startHour: 18, endHour: 21 }],
    });
    expect(tutor.status).toBe("pending");
    expect(tutor.hourlyRate).toBe(250);
  });

  it("refuses a second profile for the same user", async () => {
    const user = await makeStudent(`dup-${Date.now()}@tutor.test`);
    await createTutorProfile({
      userId: user.id,
      bio: "first",
      hourlyRate: 100,
      specializations: [{ subject: "A", level: "beginner" }],
      availability: [],
    });
    await expect(
      createTutorProfile({
        userId: user.id,
        bio: "second",
        hourlyRate: 200,
        specializations: [{ subject: "B", level: "beginner" }],
        availability: [],
      })
    ).rejects.toThrow(/already has/);
  });

  it("approveTutor flips status + sets verifiedAt", async () => {
    const user = await makeStudent(`ap-${Date.now()}@tutor.test`);
    const tutor = await createTutorProfile({
      userId: user.id,
      bio: "bio",
      hourlyRate: 300,
      specializations: [{ subject: "Physics", level: "advanced" }],
      availability: [],
    });
    const approved = await approveTutor(tutor.id);
    expect(approved.status).toBe("active");
    expect(approved.verifiedAt).toBeInstanceOf(Date);
  });

  it("matchTutors ranks subject match higher than a non-match", async () => {
    const good = await makeStudent(`good-${Date.now()}@tutor.test`);
    const noise = await makeStudent(`noise-${Date.now()}@tutor.test`);
    const goodTutor = await createTutorProfile({
      userId: good.id,
      bio: "bio",
      hourlyRate: 200,
      specializations: [{ subject: "Calculus", level: "advanced" }],
      availability: [],
    });
    const noiseTutor = await createTutorProfile({
      userId: noise.id,
      bio: "bio",
      hourlyRate: 200,
      specializations: [{ subject: "History", level: "beginner" }],
      availability: [],
    });
    await approveTutor(goodTutor.id);
    await approveTutor(noiseTutor.id);

    const student = await makeStudent(`stu-${Date.now()}@tutor.test`);
    const results = await matchTutors({
      studentId: student.id,
      subject: "Calculus",
      limit: 5,
    });
    expect(results[0]?.tutor.id).toBe(goodTutor.id);
    expect(results[0]!.score).toBeGreaterThan(results[1]!.score);
  });

  it("completeSession updates tutor.rating aggregate", async () => {
    const u = await makeStudent(`agg-${Date.now()}@tutor.test`);
    const stu = await makeStudent(`agg-s-${Date.now()}@tutor.test`);
    const t = await createTutorProfile({
      userId: u.id,
      bio: "bio",
      hourlyRate: 400,
      specializations: [{ subject: "Chemistry", level: "intermediate" }],
      availability: [],
    });
    await approveTutor(t.id);
    const session = await prisma.tutoringSession.create({
      data: {
        tutorId: t.id,
        studentId: stu.id,
        scheduledAt: new Date(),
        durationMin: 60,
        status: "scheduled",
        price: 400,
      },
    });
    await completeSession({
      sessionId: session.id,
      rating: 5,
    });
    const fresh = await prisma.tutor.findUnique({ where: { id: t.id } });
    expect(fresh?.rating).toBeCloseTo(5);
    expect(fresh?.totalSessions).toBe(1);
  });

  it("completeSession refuses a cancelled session", async () => {
    const u = await makeStudent(`cncl-${Date.now()}@tutor.test`);
    const stu = await makeStudent(`cncl-s-${Date.now()}@tutor.test`);
    const t = await createTutorProfile({
      userId: u.id,
      bio: "bio",
      hourlyRate: 100,
      specializations: [{ subject: "A", level: "beginner" }],
      availability: [],
    });
    await approveTutor(t.id);
    const session = await prisma.tutoringSession.create({
      data: {
        tutorId: t.id,
        studentId: stu.id,
        scheduledAt: new Date(),
        durationMin: 60,
        status: "cancelled",
        price: 100,
      },
    });
    await expect(
      completeSession({ sessionId: session.id, rating: 4 })
    ).rejects.toThrow(/cancelled/);
  });
});
