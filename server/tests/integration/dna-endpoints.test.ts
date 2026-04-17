import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const d = hasDatabase ? describe : describe.skip;

d("/api DNA + confidence + grades + advisor + spaced-rep endpoints", () => {
  let app: import("express").Express;
  let prisma: typeof import("../../src/lib/prisma").default;
  let freeUser: { id: string; token: string };
  let premiumUser: { id: string; token: string };
  let professorId: string;

  beforeAll(async () => {
    app = (await import("../../src/app")).default;
    prisma = (await import("../../src/lib/prisma")).default;

    const password = await bcrypt.hash("testpass", 4);
    const secret = process.env.JWT_SECRET || "default-secret-change-me";

    const mkUser = async (
      handle: string,
      tier: "free" | "premium"
    ): Promise<{ id: string; token: string }> => {
      const u = await prisma.user.create({
        data: {
          email: `${handle}-dna-${Date.now()}-${Math.random()}@test.profai`,
          password,
          name: handle,
          subscriptionTier: tier,
        },
      });
      return {
        id: u.id,
        token: jwt.sign({ id: u.id, email: u.email, name: u.name }, secret),
      };
    };

    freeUser = await mkUser("free", "free");
    premiumUser = await mkUser("premium", "premium");

    const prof = await prisma.professor.create({
      data: {
        name: `DNA Endpoint Prof ${Date.now()}`,
        department: "CS",
        university: "Test U",
      },
    });
    professorId = prof.id;
  });

  beforeEach(async () => {
    // Clean per-test scratch rows — users persist for the run but
    // their DNA/grades/reviews get refreshed.
    await prisma.academicDNA.deleteMany({
      where: { userId: { in: [freeUser.id, premiumUser.id] } },
    });
    await prisma.gradeRecord.deleteMany({
      where: { userId: { in: [freeUser.id, premiumUser.id] } },
    });
    await prisma.spacedRepetition.deleteMany({
      where: { userId: { in: [freeUser.id, premiumUser.id] } },
    });
  });

  // ---- Auth + DNA ----

  it("401 when hitting /dna/me without a token", async () => {
    const res = await request(app).get("/api/dna/me");
    expect(res.status).toBe(401);
  });

  it("GET /dna/me returns insufficient for a fresh user", async () => {
    const res = await request(app)
      .get("/api/dna/me")
      .set("Authorization", `Bearer ${freeUser.token}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("insufficient");
  });

  // ---- Grades ----

  it("POST /grades rejects invalid bodies with VALIDATION_FAILED", async () => {
    const res = await request(app)
      .post("/api/grades")
      .set("Authorization", `Bearer ${freeUser.token}`)
      .send({ grade: 999, courseName: "" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_FAILED");
  });

  it("POST /grades + GET /grades/me round-trips a record", async () => {
    const add = await request(app)
      .post("/api/grades")
      .set("Authorization", `Bearer ${freeUser.token}`)
      .send({
        courseName: "SPM",
        grade: 88,
        credit: 3,
        semester: "2026-Spring",
        university: "aydin",
      });
    expect(add.status).toBe(201);
    expect(add.body.letterGrade).toBe("AA");

    const list = await request(app)
      .get("/api/grades/me")
      .set("Authorization", `Bearer ${freeUser.token}`);
    expect(list.status).toBe(200);
    expect(list.body.grades.length).toBe(1);
  });

  it("GET /grades/me/gpa computes the weighted average", async () => {
    await request(app)
      .post("/api/grades")
      .set("Authorization", `Bearer ${freeUser.token}`)
      .send({
        courseName: "A",
        grade: 92,
        credit: 4,
        semester: "S",
        university: "aydin",
      });
    await request(app)
      .post("/api/grades")
      .set("Authorization", `Bearer ${freeUser.token}`)
      .send({
        courseName: "B",
        grade: 72,
        credit: 2,
        semester: "S",
        university: "aydin",
      });
    const gpa = await request(app)
      .get("/api/grades/me/gpa?university=aydin")
      .set("Authorization", `Bearer ${freeUser.token}`);
    expect(gpa.status).toBe(200);
    expect(gpa.body.gpa).toBe(3.5);
  });

  // ---- Premium gate ----

  it("GET /course-advisor returns 402 for free user", async () => {
    const res = await request(app)
      .get(`/api/course-advisor/${professorId}`)
      .set("Authorization", `Bearer ${freeUser.token}`);
    expect(res.status).toBe(402);
    expect(res.body.error.code).toBe("PREMIUM_REQUIRED");
  });

  it("GET /course-advisor passes premium gate (DNA insufficient branch)", async () => {
    const res = await request(app)
      .get(`/api/course-advisor/${professorId}`)
      .set("Authorization", `Bearer ${premiumUser.token}`);
    expect(res.status).toBe(200);
    // Premium user has no DNA yet → insufficient_dna path.
    expect(res.body.status).toBe("insufficient_dna");
  });

  // ---- Spaced repetition ----

  it("GET /spaced-repetition/me/due returns an empty list when nothing is queued", async () => {
    const res = await request(app)
      .get("/api/spaced-repetition/me/due")
      .set("Authorization", `Bearer ${freeUser.token}`);
    expect(res.status).toBe(200);
    expect(res.body.reviews).toEqual([]);
  });

  it("POST /spaced-repetition/:q/complete updates a scheduled review", async () => {
    await prisma.spacedRepetition.create({
      data: {
        userId: freeUser.id,
        questionId: "endpoint-q1",
        nextReview: new Date(Date.now() - 60_000),
        interval: 1,
        easiness: 2.5,
      },
    });

    const res = await request(app)
      .post("/api/spaced-repetition/me/endpoint-q1/complete")
      .set("Authorization", `Bearer ${freeUser.token}`)
      .send({ correct: true });
    expect(res.status).toBe(200);
    expect(res.body.correctStreak).toBe(1);
  });

  it("PATCH /users/me/review-frequency validates the enum", async () => {
    const bad = await request(app)
      .patch("/api/users/me/review-frequency")
      .set("Authorization", `Bearer ${freeUser.token}`)
      .send({ reviewFrequency: "hourly" });
    expect(bad.status).toBe(400);

    const good = await request(app)
      .patch("/api/users/me/review-frequency")
      .set("Authorization", `Bearer ${freeUser.token}`)
      .send({ reviewFrequency: "weekly" });
    expect(good.status).toBe(200);
    expect(good.body.reviewFrequency).toBe("weekly");
  });
});
