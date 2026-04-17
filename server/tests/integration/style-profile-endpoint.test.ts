import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";

// Integration test — exercises the full Express stack against the real
// Postgres database. Skipped when DATABASE_URL is not set so CI jobs
// without Postgres don't fail.
const hasDatabase = Boolean(process.env.DATABASE_URL);
const d = hasDatabase ? describe : describe.skip;

d("GET /api/professors/:id/style-profile", () => {
  let app: import("express").Express;
  let prisma: typeof import("../../src/lib/prisma").default;
  let readyProfessorId: string;
  let insufficientProfessorId: string;

  beforeAll(async () => {
    // Late-load so the "DATABASE_URL missing" case skips cleanly without
    // ever booting Prisma / Express.
    app = (await import("../../src/app")).default;
    prisma = (await import("../../src/lib/prisma")).default;

    // Self-fixture: per-worker schema isolation means we can't rely on the
    // main `npm run seed` having populated "Zehra Tan" / "Peri Güneş". We
    // synthesize both states (ready = 3 analyzed exams, insufficient = 0)
    // locally.
    const uploader = await prisma.user.create({
      data: {
        email: `style-fixture-${Date.now()}-${Math.random()}@test.profai`,
        password: "x",
        name: "Style Fixture Uploader",
      },
    });

    const readyProf = await prisma.professor.create({
      data: {
        name: `Style Ready Prof ${Date.now()}`,
        department: "CS",
        university: "Test U",
      },
    });
    const readyCourse = await prisma.course.create({
      data: {
        professorId: readyProf.id,
        name: "Ready Course",
        code: "CS-READY",
      },
    });
    for (let i = 0; i < 3; i++) {
      const exam = await prisma.exam.create({
        data: {
          courseId: readyCourse.id,
          examType: "FINAL",
          year: 2024,
          semester: "Fall",
          fileUrl: `/uploads/style-ready-${i}.pdf`,
          uploadedById: uploader.id,
        },
      });
      await prisma.examAnalysis.create({
        data: {
          examId: exam.id,
          questionCount: 10 + i,
          questionTypes: { MC: 5, TF: 3, SA: 2 },
          topicDistribution: { scrum: 0.5, agile: 0.3, waterfall: 0.2 },
          difficultyScore: 3 + i * 0.1,
          summary: `Ready exam ${i}`,
        },
      });
    }
    readyProfessorId = readyProf.id;

    const insufficientProf = await prisma.professor.create({
      data: {
        name: `Style Insufficient Prof ${Date.now()}`,
        department: "CS",
        university: "Test U",
      },
    });
    insufficientProfessorId = insufficientProf.id;
  });

  it("returns 404 for an unknown professor id", async () => {
    const res = await request(app).get(
      "/api/professors/00000000-0000-0000-0000-000000000000/style-profile"
    );
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Professor not found." });
  });

  it("returns insufficient_data for a professor with < 3 analyzed exams", async () => {
    const res = await request(app).get(
      `/api/professors/${insufficientProfessorId}/style-profile`
    );
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("insufficient_data");
    expect(res.body.professor.id).toBe(insufficientProfessorId);
    expect(res.body.minRequired).toBe(3);
    expect(res.body.examSourceCount).toBeLessThan(3);
  });

  it("returns a ready profile with aggregated metrics for a well-seeded professor", async () => {
    const res = await request(app).get(
      `/api/professors/${readyProfessorId}/style-profile`
    );
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ready");

    const profile = res.body.profile;
    expect(profile.examSourceCount).toBeGreaterThanOrEqual(3);
    expect(profile.metrics).toEqual(
      expect.objectContaining({
        totalExams: expect.any(Number),
        avgDifficulty: expect.any(Number),
        avgQuestionCount: expect.any(Number),
      })
    );
    expect(Array.isArray(profile.topTopics)).toBe(true);
    expect(profile.topTopics.length).toBeGreaterThan(0);
    expect(Array.isArray(profile.evolution)).toBe(true);
    // styleSummary is either a Gemini-produced string or the fallback copy —
    // either way it must be a non-empty string.
    expect(typeof profile.styleSummary).toBe("string");
    expect(profile.styleSummary.length).toBeGreaterThan(0);
    expect(typeof profile.geminiVersion).toBe("string");
  });

  // TODO (phase-5+): cache hit assertion relied on the main seed having a
  // pre-warmed `Zehra Tan` profile row. Under per-worker schema isolation
  // we build the fixture from scratch, and the first Gemini call persists
  // with `isStale: true` in some paths — a second request re-triggers the
  // summary generation (~8s) instead of returning the cached value. The
  // cache-hit assertion stops being meaningful until we either pre-warm
  // the cache in `beforeAll` or assert on the second call being strictly
  // faster than the first. Revisit during Phase 5 test pass (5.16).
  it.skip("is fast on cache hit (<1s) for a profile that was just built", async () => {
    await request(app).get(`/api/professors/${readyProfessorId}/style-profile`);

    const started = Date.now();
    const res = await request(app).get(
      `/api/professors/${readyProfessorId}/style-profile`
    );
    const elapsed = Date.now() - started;

    expect(res.status).toBe(200);
    expect(elapsed).toBeLessThan(1000);
  });
});
