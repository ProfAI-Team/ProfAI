import { describe, it, expect, afterEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import app from "../../src/app";
import prisma from "../../src/lib/prisma";

const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;
const SECRET = process.env.JWT_SECRET ?? "default-secret-change-me";

async function userWithToken(
  role: "STUDENT" | "HOCA" | "UNIVERSITY_ADMIN" | "SUPER_ADMIN" = "STUDENT",
  email?: string
) {
  const finalEmail = email ?? `b2b-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@b2b-endpoints.test`;
  const user = await prisma.user.create({
    data: {
      email: finalEmail,
      password: await bcrypt.hash("x", 10),
      name: "Test",
      role,
    },
  });
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role },
    SECRET
  );
  return { user, token };
}

describeIfDb("B2B endpoints (smoke)", () => {
  afterEach(async () => {
    await prisma.tutoringSession.deleteMany({});
    await prisma.tutor.deleteMany({});
    await prisma.marketplaceItem.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: { contains: "@b2b-endpoints.test" } },
    });
  });

  it("RBAC — HOCA endpoint rejects a STUDENT token with FORBIDDEN_ROLE", async () => {
    const { token } = await userWithToken("STUDENT");
    const res = await request(app)
      .get("/api/hoca/dashboard")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN_ROLE");
  });

  it("RBAC — university dashboard rejects a STUDENT token", async () => {
    const { token } = await userWithToken("STUDENT");
    const res = await request(app)
      .get("/api/university/dashboard")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("RBAC — refund requires SUPER_ADMIN", async () => {
    const { token } = await userWithToken("STUDENT");
    const res = await request(app)
      .post("/api/payments/abc/refund")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("POST /api/tutors creates a pending tutor profile", async () => {
    const { user, token } = await userWithToken("STUDENT");
    const res = await request(app)
      .post("/api/tutors")
      .set("Authorization", `Bearer ${token}`)
      .send({
        bio: "Matematik öğretmeni, 5 yıl üniversite deneyimi.",
        hourlyRate: 300,
        specializations: [
          { subject: "Calculus", level: "intermediate", tags: ["limits"] },
        ],
        availability: [{ dayOfWeek: 1, startHour: 18, endHour: 21 }],
      });
    expect(res.status).toBe(201);
    expect(res.body.data.userId).toBe(user.id);
    expect(res.body.data.status).toBe("pending");
  });

  it("POST /api/tutors fails Zod validation on short bio", async () => {
    const { token } = await userWithToken();
    const res = await request(app)
      .post("/api/tutors")
      .set("Authorization", `Bearer ${token}`)
      .send({
        bio: "too short",
        hourlyRate: 300,
        specializations: [{ subject: "x", level: "beginner" }],
        availability: [],
      });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_FAILED");
  });

  it("GET /api/marketplace/items returns empty array when nothing approved", async () => {
    const res = await request(app).get("/api/marketplace/items");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("POST /api/tutors/match is accessible without auth (public preview)", async () => {
    const res = await request(app)
      .post("/api/tutors/match")
      .send({ subject: "Calculus" });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.results)).toBe(true);
  });

  it("POST /api/tutors/match ignores an invalid token instead of 401ing", async () => {
    const res = await request(app)
      .post("/api/tutors/match")
      .set("Authorization", "Bearer not-a-real-token")
      .send({});
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.results)).toBe(true);
  });
});
