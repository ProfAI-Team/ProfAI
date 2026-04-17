import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const d = hasDatabase ? describe : describe.skip;

d("/api/mock-exam endpoints (no Gemini)", () => {
  let app: import("express").Express;
  let prisma: typeof import("../../src/lib/prisma").default;
  let aliceId: string;
  let bobId: string;
  let aliceToken: string;
  let bobToken: string;
  let otherUsersExamId: string;
  let otherUsersSessionId: string;

  beforeAll(async () => {
    app = (await import("../../src/app")).default;
    prisma = (await import("../../src/lib/prisma")).default;

    const password = await bcrypt.hash("testpass", 4);
    const alice = await prisma.user.create({
      data: {
        email: `alice-mockexam-${Date.now()}@test.profai`,
        password,
        name: "Alice",
      },
    });
    const bob = await prisma.user.create({
      data: {
        email: `bob-mockexam-${Date.now()}@test.profai`,
        password,
        name: "Bob",
      },
    });
    aliceId = alice.id;
    bobId = bob.id;
    const secret = process.env.JWT_SECRET || "default-secret-change-me";
    aliceToken = jwt.sign(
      { id: alice.id, email: alice.email, name: alice.name },
      secret
    );
    bobToken = jwt.sign(
      { id: bob.id, email: bob.email, name: bob.name },
      secret
    );

    const anyProfessor = await prisma.professor.create({
      data: {
        name: `Prof MockExam ${Date.now()}`,
        department: "CS",
        university: "Test U",
      },
    });

    // Seed Bob a completed exam + session so Alice can fail to read them.
    const bobExam = await prisma.mockExam.create({
      data: {
        userId: bob.id,
        professorId: anyProfessor.id,
        noteIds: [],
        noteHash: "bob-stub-hash",
        title: "Bob's Stub Mock Exam",
        questions: [
          {
            q: "Test soru?",
            type: "MC",
            options: ["A) Evet", "B) Hayır", "C) Belki", "D) Hiçbiri"],
            correctAnswer: "A) Evet",
            topic: "Temel",
            difficulty: 5,
            rationale: "Test.",
            rubric: [],
          },
        ],
        durationMin: 30,
        sectionBreakdown: [{ title: "Bölüm 1", startIdx: 0, endIdx: 1 }],
        geminiVersion: "test",
        promptVersion: "test-v0",
        expiresAt: new Date(Date.now() + 3600_000),
      },
    });
    otherUsersExamId = bobExam.id;

    const bobSession = await prisma.mockExamSession.create({
      data: {
        mockExamId: bobExam.id,
        userId: bob.id,
        answers: [],
        score: 0,
        feedback: [],
        prediction: null as unknown as object,
        topicGaps: [],
      },
    });
    otherUsersSessionId = bobSession.id;
  });

  afterAll(async () => {
    await prisma.mockExamSession.deleteMany({
      where: { userId: { in: [aliceId, bobId] } },
    });
    await prisma.mockExam.deleteMany({
      where: { userId: { in: [aliceId, bobId] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [aliceId, bobId] } },
    });
  });

  it("POST /generate requires authentication", async () => {
    const res = await request(app)
      .post("/api/mock-exam/generate")
      .send({ professorId: "x" });
    expect(res.status).toBe(401);
  });

  it("POST /generate rejects missing professorId", async () => {
    const res = await request(app)
      .post("/api/mock-exam/generate")
      .set("Authorization", `Bearer ${aliceToken}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_FAILED");
  });

  it("GET /:id returns 404 for another user's exam", async () => {
    const res = await request(app)
      .get(`/api/mock-exam/${otherUsersExamId}`)
      .set("Authorization", `Bearer ${aliceToken}`);
    expect(res.status).toBe(404);
  });

  it("GET /:id returns the exam for its owner with sanitised questions", async () => {
    const res = await request(app)
      .get(`/api/mock-exam/${otherUsersExamId}`)
      .set("Authorization", `Bearer ${bobToken}`);
    expect(res.status).toBe(200);
    expect(res.body.exam.id).toBe(otherUsersExamId);
    // Must not leak the answer key.
    const q = res.body.exam.questions[0];
    expect(q).not.toHaveProperty("correctAnswer");
    expect(q).not.toHaveProperty("rationale");
    expect(q).not.toHaveProperty("rubric");
    // But the shape they need for the session UI is present.
    expect(q.q).toBeTruthy();
    expect(Array.isArray(q.options)).toBe(true);
  });

  it("POST /:id/submit rejects a non-array answers payload", async () => {
    const res = await request(app)
      .post(`/api/mock-exam/${otherUsersExamId}/submit`)
      .set("Authorization", `Bearer ${bobToken}`)
      .send({ answers: "not-an-array" });
    expect(res.status).toBe(400);
  });

  it("POST /:id/submit grades rule-based MC answers end to end", async () => {
    const res = await request(app)
      .post(`/api/mock-exam/${otherUsersExamId}/submit`)
      .set("Authorization", `Bearer ${bobToken}`)
      .send({
        answers: [{ qIdx: 0, answer: "A) Evet", timeSpentSec: 30 }],
        autoSubmitted: false,
      });
    expect(res.status).toBe(201);
    expect(res.body.sessionId).toBeTruthy();
    expect(res.body.score).toBe(100);
    expect(Array.isArray(res.body.feedback)).toBe(true);
    expect(res.body.feedback[0].correct).toBe(true);
    expect(res.body.prediction.disclaimer).toContain("kesin bir not");
  });

  it("GET /session/:sessionId/result returns 404 for other users", async () => {
    const res = await request(app)
      .get(`/api/mock-exam/session/${otherUsersSessionId}/result`)
      .set("Authorization", `Bearer ${aliceToken}`);
    expect(res.status).toBe(404);
  });

  it("POST /panic-plan validates hoursUntilExam and professorId", async () => {
    const missingProf = await request(app)
      .post("/api/mock-exam/panic-plan")
      .set("Authorization", `Bearer ${aliceToken}`)
      .send({ hoursUntilExam: 4 });
    expect(missingProf.status).toBe(400);

    const badHours = await request(app)
      .post("/api/mock-exam/panic-plan")
      .set("Authorization", `Bearer ${aliceToken}`)
      .send({ hoursUntilExam: -1, professorId: "x" });
    expect(badHours.status).toBe(400);
  });

  it("POST /panic-plan returns a plan seeded from top topics when no mock session given", async () => {
    const anyProfessor = await prisma.professor.findFirst();
    const res = await request(app)
      .post("/api/mock-exam/panic-plan")
      .set("Authorization", `Bearer ${aliceToken}`)
      .send({
        hoursUntilExam: 6,
        professorId: anyProfessor!.id,
      });
    // Some seeded professors won't have a style profile yet — tolerate
    // both the ready and seeded-empty path. We only care that the
    // endpoint returns 200 with a well-formed plan.
    expect(res.status).toBe(200);
    expect(res.body.totalMinutes).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(res.body.steps)).toBe(true);
    expect(Array.isArray(res.body.advice)).toBe(true);
  });
});
