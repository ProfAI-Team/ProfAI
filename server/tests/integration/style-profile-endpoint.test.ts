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

    const ready = await prisma.professor.findFirst({
      where: { name: "Prof. Dr. Zehra Tan" },
    });
    const insufficient = await prisma.professor.findFirst({
      where: { name: { contains: "Peri Güneş" } },
    });
    if (!ready || !insufficient) {
      throw new Error(
        "Test seed missing — run `npm run seed` before integration tests"
      );
    }
    readyProfessorId = ready.id;
    insufficientProfessorId = insufficient.id;
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

  it("is fast on cache hit (<1s) for a profile that was just built", async () => {
    // First call may rebuild; second should be warm.
    await request(app).get(`/api/professors/${readyProfessorId}/style-profile`);

    const started = Date.now();
    const res = await request(app).get(
      `/api/professors/${readyProfessorId}/style-profile`
    );
    const elapsed = Date.now() - started;

    expect(res.status).toBe(200);
    // Generous bound — CI variability + Prisma warm-up.
    expect(elapsed).toBeLessThan(1000);
  });
});
