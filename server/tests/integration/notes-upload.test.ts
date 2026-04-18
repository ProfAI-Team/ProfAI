import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const d = hasDatabase ? describe : describe.skip;

d("POST /api/notes/upload", () => {
  let app: import("express").Express;
  let prisma: typeof import("../../src/lib/prisma").default;
  let userId: string;
  let token: string;

  beforeAll(async () => {
    app = (await import("../../src/app")).default;
    prisma = (await import("../../src/lib/prisma")).default;

    const email = `notes-test-${Date.now()}@test.profai`;
    const user = await prisma.user.create({
      data: {
        email,
        password: await bcrypt.hash("testpass", 4),
        name: "Notes Test",
      },
    });
    userId = user.id;
    token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || "default-secret-change-me",
      { expiresIn: "1h" }
    );
  });

  afterAll(async () => {
    await prisma.studentNote.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  });

  it("rejects unauthenticated requests", async () => {
    const res = await request(app)
      .post("/api/notes/upload")
      .attach("files", Buffer.from("hello world"), {
        filename: "demo.txt",
        contentType: "text/plain",
      });
    expect(res.status).toBe(401);
  });

  it("stores a plain-text note with wordCount and no warning when ≥500 words", async () => {
    const longText = Array.from({ length: 600 })
      .map((_, i) => `word${i}`)
      .join(" ");
    const res = await request(app)
      .post("/api/notes/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("files", Buffer.from(longText), {
        filename: "long-note.txt",
        contentType: "text/plain",
      });
    expect(res.status).toBe(201);
    expect(res.body.notes).toHaveLength(1);
    expect(res.body.notes[0].wordCount).toBe(600);
    expect(res.body.notes[0].warning).toBeUndefined();
    expect(res.body.errors).toEqual([]);
  });

  it("flags <500-word notes as insufficient_content", async () => {
    const res = await request(app)
      .post("/api/notes/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("files", Buffer.from("tek iki üç"), {
        filename: "short.txt",
        contentType: "text/plain",
      });
    expect(res.status).toBe(201);
    expect(res.body.notes[0].warning).toBe("insufficient_content");
  });

  it("rejects unsupported mime types with a surfaced error", async () => {
    const res = await request(app)
      .post("/api/notes/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("files", Buffer.from([0x89, 0x50, 0x4e, 0x47]), {
        filename: "fake.png",
        contentType: "image/png",
      });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_FAILED");
    expect(res.body.error.message).toContain("PDF, DOCX, and TXT");
  });

  it("returns 400 when no file is sent", async () => {
    const res = await request(app)
      .post("/api/notes/upload")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it("handles multi-file upload preserving per-file results", async () => {
    const res = await request(app)
      .post("/api/notes/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("files", Buffer.from("first note content here"), {
        filename: "a.txt",
        contentType: "text/plain",
      })
      .attach("files", Buffer.from("second note content here"), {
        filename: "b.txt",
        contentType: "text/plain",
      });
    expect(res.status).toBe(201);
    expect(res.body.notes).toHaveLength(2);
    expect(res.body.notes.map((n: { title: string }) => n.title)).toEqual([
      "a",
      "b",
    ]);
  });
});
