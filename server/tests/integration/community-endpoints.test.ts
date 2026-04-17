import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const d = hasDatabase ? describe : describe.skip;

d("/api community endpoints", () => {
  let app: import("express").Express;
  let prisma: typeof import("../../src/lib/prisma").default;
  let alice: { id: string; token: string };
  let bob: { id: string; token: string };
  let professorId: string;
  let examId: string;

  beforeAll(async () => {
    app = (await import("../../src/app")).default;
    prisma = (await import("../../src/lib/prisma")).default;

    const password = await bcrypt.hash("testpass", 4);
    const secret = process.env.JWT_SECRET || "default-secret-change-me";

    const mkUser = async (handle: string) => {
      const u = await prisma.user.create({
        data: {
          email: `${handle}-community-${Date.now()}-${Math.random()}@test.profai`,
          password,
          name: handle,
        },
      });
      return {
        id: u.id,
        token: jwt.sign({ id: u.id, email: u.email, name: u.name }, secret),
      };
    };

    alice = await mkUser("alice");
    bob = await mkUser("bob");

    const prof = await prisma.professor.create({
      data: {
        name: `Prof Community ${Date.now()}`,
        department: "CS",
        university: "Test U",
      },
    });
    professorId = prof.id;

    const course = await prisma.course.create({
      data: {
        name: "Community Test",
        code: "COM101",
        professorId: prof.id,
      },
    });

    // Bob uploads an exam so Alice can approve it.
    const exam = await prisma.exam.create({
      data: {
        courseId: course.id,
        examType: "MIDTERM",
        year: 2024,
        semester: "Spring",
        fileUrl: "/dev/null",
        uploadedById: bob.id,
      },
    });
    examId = exam.id;
  });

  it("GET /credits/balance defaults to zero", async () => {
    const res = await request(app)
      .get("/api/credits/balance")
      .set("Authorization", `Bearer ${alice.token}`);
    expect(res.status).toBe(200);
    expect(res.body.balance).toBe(0);
  });

  it("POST /exams/:id/approve rejects invalid payloads", async () => {
    const res = await request(app)
      .post(`/api/exams/${examId}/approve`)
      .set("Authorization", `Bearer ${alice.token}`)
      .send({ approved: "yes" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_FAILED");
  });

  it("POST /exams/:id/approve blocks the uploader from self-voting", async () => {
    const res = await request(app)
      .post(`/api/exams/${examId}/approve`)
      .set("Authorization", `Bearer ${bob.token}`)
      .send({ approved: true });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("OWN_UPLOAD");
  });

  it("POST /exams/:id/approve records Alice's vote", async () => {
    const res = await request(app)
      .post(`/api/exams/${examId}/approve`)
      .set("Authorization", `Bearer ${alice.token}`)
      .send({ approved: true });
    expect(res.status).toBe(201);
    expect(res.body.approvalCount).toBe(1);
    expect(res.body.exam.verified).toBe(false);
  });

  it("POST /questions/:id/vote accepts up/down direction", async () => {
    const res = await request(app)
      .post(`/api/questions/mockExam:alice-int:q1/vote`)
      .set("Authorization", `Bearer ${alice.token}`)
      .send({ direction: 1 });
    expect(res.status).toBe(201);
    expect(res.body.upvotes).toBe(1);
  });

  it("POST /post-exam-reports creates a report and awards credit", async () => {
    const res = await request(app)
      .post("/api/post-exam-reports")
      .set("Authorization", `Bearer ${bob.token}`)
      .send({
        professorId,
        examDate: "2026-01-10",
        reportedTopics: [
          { topic: "Scrum", frequency: "many", difficulty: 3 },
        ],
      });
    expect(res.status).toBe(201);
    expect(res.body.isNew).toBe(true);
    expect(res.body.balance).toBe(5);
  });

  it("GET /post-exam-reports/professor/:id returns insufficient below K", async () => {
    const res = await request(app).get(
      `/api/post-exam-reports/professor/${professorId}`
    );
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("insufficient");
  });

  it("POST /study-groups/matchmake creates a group and lists it", async () => {
    const join = await request(app)
      .post("/api/study-groups/matchmake")
      .set("Authorization", `Bearer ${alice.token}`)
      .send({ professorId });
    expect(join.status).toBe(201);
    expect(join.body.action).toBe("created");

    const mine = await request(app)
      .get("/api/study-groups/mine")
      .set("Authorization", `Bearer ${alice.token}`);
    expect(mine.status).toBe(200);
    expect(mine.body.groups.length).toBeGreaterThan(0);
  });

  it("POST /study-groups/:id/link rejects non-whitelisted URLs", async () => {
    const join = await request(app)
      .post("/api/study-groups/matchmake")
      .set("Authorization", `Bearer ${bob.token}`)
      .send({ professorId });
    const res = await request(app)
      .post(`/api/study-groups/${join.body.group.id}/link`)
      .set("Authorization", `Bearer ${bob.token}`)
      .send({ url: "https://evil.com/x" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("LINK_NOT_ALLOWED");
  });

  it("GET /professors/:id/high-performer-strategy returns insufficient", async () => {
    const res = await request(app).get(
      `/api/professors/${professorId}/high-performer-strategy`
    );
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("insufficient");
  });

  it("auth is required on POST routes", async () => {
    const res = await request(app)
      .post(`/api/exams/${examId}/approve`)
      .send({ approved: true });
    expect(res.status).toBe(401);
  });
});
