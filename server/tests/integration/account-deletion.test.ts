import { describe, it, expect, afterEach } from "vitest";
import request from "supertest";
import bcrypt from "bcrypt";

import app from "../../src/app";
import prisma from "../../src/lib/prisma";
import jwt from "jsonwebtoken";

const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

const SECRET = process.env.JWT_SECRET ?? "default-secret-change-me";

async function makeUserWithToken(password = "s3cret!") {
  const email = `acct-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@delete.test`;
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name: "To Delete",
    },
  });
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: "STUDENT" },
    SECRET,
    { expiresIn: "1h" }
  );
  return { user, token, password };
}

describeIfDb("account deletion endpoint", () => {
  afterEach(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: "@delete.test" } },
    });
  });

  it("requires password confirmation", async () => {
    const { token } = await makeUserWithToken();
    const res = await request(app)
      .delete("/api/users/me/data")
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_FAILED");
  });

  it("rejects a wrong password with 401", async () => {
    const { token } = await makeUserWithToken("correct");
    const res = await request(app)
      .delete("/api/users/me/data")
      .set("Authorization", `Bearer ${token}`)
      .send({ password: "wrong" });
    expect(res.status).toBe(401);
  });

  it("purges the user and cascades owned rows", async () => {
    const { user, token, password } = await makeUserWithToken();

    // Seed a couple of owned rows across tables covered by the purge.
    await prisma.voiceSession.create({
      data: {
        userId: user.id,
        durationSec: 60,
        transcript: "hello",
        topics: [],
        provider: "gemini-live",
      },
    });
    await prisma.oCRResult.create({
      data: {
        userId: user.id,
        fileUrl: "ocr/test.png",
        mimeType: "image/png",
        extractedText: "x",
        latexFormulas: [],
        confidence: 0.9,
        provider: "gemini-multimodal",
        processingMs: 100,
      },
    });
    await prisma.pushDevice.create({
      data: {
        userId: user.id,
        endpoint: `https://push/${user.id}`,
        p256dhKey: "k",
        authKey: "k",
      },
    });

    const res = await request(app)
      .delete("/api/users/me/data")
      .set("Authorization", `Bearer ${token}`)
      .send({ password });

    expect(res.status).toBe(200);
    expect(res.body.data.report.deletedCounts.voiceSessions).toBe(1);
    expect(res.body.data.report.deletedCounts.ocrResults).toBe(1);
    expect(res.body.data.report.deletedCounts.pushDevices).toBe(1);

    const gone = await prisma.user.findUnique({ where: { id: user.id } });
    expect(gone).toBeNull();
    const vs = await prisma.voiceSession.findMany({
      where: { userId: user.id },
    });
    expect(vs.length).toBe(0);
  });
});
