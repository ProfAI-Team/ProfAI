import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const d = hasDatabase ? describe : describe.skip;

// These tests focus on auth, validation, and owner-isolation. They do
// NOT call Gemini — that path is covered by unit tests (prompt shape +
// distribution math) and the manual end-to-end smoke.
d("/api/study-pack endpoints (no Gemini)", () => {
  let app: import("express").Express;
  let prisma: typeof import("../../src/lib/prisma").default;
  let aliceId: string;
  let bobId: string;
  let aliceToken: string;
  let bobToken: string;
  let otherUsersPackId: string;

  beforeAll(async () => {
    app = (await import("../../src/app")).default;
    prisma = (await import("../../src/lib/prisma")).default;

    const password = await bcrypt.hash("testpass", 4);
    const alice = await prisma.user.create({
      data: {
        email: `alice-${Date.now()}@test.profai`,
        password,
        name: "Alice",
      },
    });
    const bob = await prisma.user.create({
      data: {
        email: `bob-${Date.now()}@test.profai`,
        password,
        name: "Bob",
      },
    });
    aliceId = alice.id;
    bobId = bob.id;
    const secret = process.env.JWT_SECRET || "default-secret-change-me";
    aliceToken = jwt.sign({ id: alice.id, email: alice.email, name: alice.name }, secret);
    bobToken = jwt.sign({ id: bob.id, email: bob.email, name: bob.name }, secret);

    // Seed Bob a stub study pack so Alice can try (and fail) to read it.
    const anyProfessor = await prisma.professor.findFirst();
    if (!anyProfessor) throw new Error("Seed required");
    const pack = await prisma.studyPack.create({
      data: {
        userId: bob.id,
        professorId: anyProfessor.id,
        noteIds: [],
        noteHash: "bob-stub-hash",
        topicSummaries: [],
        practiceQuestions: [],
        profStylePatterns: [],
        geminiVersion: "test",
        promptVersion: "test-v0",
        expiresAt: new Date(Date.now() + 3600_000),
      },
    });
    otherUsersPackId = pack.id;
  });

  afterAll(async () => {
    await prisma.studyPack.deleteMany({
      where: { userId: { in: [aliceId, bobId] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [aliceId, bobId] } },
    });
  });

  it("POST /generate requires authentication", async () => {
    const res = await request(app)
      .post("/api/study-pack/generate")
      .send({ professorId: "x", noteIds: ["a"] });
    expect(res.status).toBe(401);
  });

  it("POST /generate rejects missing professorId", async () => {
    const res = await request(app)
      .post("/api/study-pack/generate")
      .set("Authorization", `Bearer ${aliceToken}`)
      .send({ noteIds: ["a"] });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_FAILED");
  });

  it("POST /generate rejects empty noteIds", async () => {
    const res = await request(app)
      .post("/api/study-pack/generate")
      .set("Authorization", `Bearer ${aliceToken}`)
      .send({ professorId: "x", noteIds: [] });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_FAILED");
  });

  it("POST /generate surfaces insufficient_data when notes can't be found", async () => {
    const anyProfessor = await prisma.professor.findFirst();
    const res = await request(app)
      .post("/api/study-pack/generate")
      .set("Authorization", `Bearer ${aliceToken}`)
      .send({
        professorId: anyProfessor!.id,
        noteIds: ["00000000-0000-0000-0000-000000000000"],
      });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe("insufficient_data");
    expect(res.body.reason).toBe("notes_not_found");
  });

  it("GET /:id returns 404 when the pack belongs to another user", async () => {
    const res = await request(app)
      .get(`/api/study-pack/${otherUsersPackId}`)
      .set("Authorization", `Bearer ${aliceToken}`);
    expect(res.status).toBe(404);
  });

  it("GET /:id returns the pack for its owner", async () => {
    const res = await request(app)
      .get(`/api/study-pack/${otherUsersPackId}`)
      .set("Authorization", `Bearer ${bobToken}`);
    expect(res.status).toBe(200);
    expect(res.body.pack.id).toBe(otherUsersPackId);
  });

  it("GET /mine lists only the caller's packs", async () => {
    const aliceRes = await request(app)
      .get("/api/study-pack/mine")
      .set("Authorization", `Bearer ${aliceToken}`);
    const bobRes = await request(app)
      .get("/api/study-pack/mine")
      .set("Authorization", `Bearer ${bobToken}`);
    expect(aliceRes.status).toBe(200);
    expect(bobRes.status).toBe(200);
    expect(aliceRes.body.total).toBe(0);
    expect(bobRes.body.total).toBeGreaterThanOrEqual(1);
  });
});
