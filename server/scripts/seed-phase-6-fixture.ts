/**
 * Phase 6 smoke fixture — seeds enough voice / OCR / lecture / push
 * data on the demo user so the visual smoke pages (/tutor, /me/ocr,
 * /me/lectures, /search/multimodal, /me/reviews settings) have
 * something to render. Builds on top of the Phase 5 fixture (which
 * handles DNA / confidence / grades / reviews) without clobbering it.
 *
 * Idempotent-ish: deletes phase6fixture-prefixed rows before re-
 * creating them, and routes through reset-demo-user for the
 * currency-bearing tables before seeding.
 *
 * Usage:
 *   cd server && DATABASE_URL=... npx tsx scripts/seed-phase-6-fixture.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { execSync } from "node:child_process";

const DEMO_EMAIL = process.env.DEMO_USER_EMAIL ?? "erdemacar1@stu.aydin.edu.tr";

const prisma = new PrismaClient();

async function resetDemoUser(): Promise<void> {
  try {
    execSync("npm run reset:demo", { stdio: "inherit" });
  } catch (err) {
    console.error(
      "[phase-6-fixture] reset-demo script failed; continuing anyway:",
      err instanceof Error ? err.message : err
    );
  }
}

async function wipe(userId: string): Promise<void> {
  // Phase 6 tables the demo user owns — safe to blow away, the fixture
  // re-seeds them below.
  await prisma.voiceSession.deleteMany({
    where: { userId, transcript: { contains: "[phase6fixture]" } },
  });
  await prisma.voiceUsage.deleteMany({ where: { userId } });
  await prisma.oCRResult.deleteMany({
    where: { userId, fileUrl: { startsWith: "/uploads/phase6fixture-" } },
  });
  await prisma.pushDevice.deleteMany({
    where: { userId, userAgent: { contains: "phase6fixture" } },
  });
}

async function seedVoiceSessions(userId: string, professorId: string | null) {
  const now = Date.now();
  const samples = [
    {
      durationSec: 14 * 60,
      transcript: "[phase6fixture] Tutor: Scrum rollerine giriş yapıyorum...",
      topics: [{ topic: "Scrum Roles", startSec: 0, endSec: 300 }],
    },
    {
      durationSec: 8 * 60,
      transcript: "[phase6fixture] Tutor: Sprint planning basamakları...",
      topics: [{ topic: "Sprint Planning", startSec: 0, endSec: 240 }],
    },
    {
      durationSec: 22 * 60,
      transcript: "[phase6fixture] Tutor: Waterfall ve agile karşılaştırması...",
      topics: [{ topic: "Waterfall", startSec: 0, endSec: 540 }],
    },
  ];

  for (let i = 0; i < samples.length; i += 1) {
    const sample = samples[i];
    await prisma.voiceSession.create({
      data: {
        userId,
        professorId,
        sourceType: "live",
        durationSec: sample.durationSec,
        transcript: sample.transcript,
        topics: sample.topics,
        provider: "gemini-live",
        interruptCount: i,
        fallbackUsed: i === 2,
        createdAt: new Date(now - i * 24 * 60 * 60 * 1000),
      },
    });
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  await prisma.voiceUsage.upsert({
    where: { userId_date: { userId, date: today } },
    update: { totalSec: 14 * 60, sessionCount: 1 },
    create: { userId, date: today, totalSec: 14 * 60, sessionCount: 1 },
  });
}

async function seedOCR(userId: string) {
  const samples = [
    {
      fileUrl: "/uploads/phase6fixture-notes-1.png",
      mimeType: "image/png",
      extractedText:
        "Scrum artifacts: Product Backlog, Sprint Backlog, Increment.",
      latexFormulas: [],
      confidence: 0.92,
      provider: "gemini-multimodal",
    },
    {
      fileUrl: "/uploads/phase6fixture-notes-2.png",
      mimeType: "image/png",
      extractedText:
        "Kanban WIP limiti: N = throughput * ortalama döngü süresi.",
      latexFormulas: [{ latex: "N = \\theta \\times \\tau", confidence: 0.81 }],
      confidence: 0.77,
      provider: "gemini-multimodal",
    },
    {
      fileUrl: "/uploads/phase6fixture-notes-3.png",
      mimeType: "image/png",
      extractedText: "Risk matrisi: olasılık x etki = öncelik.",
      latexFormulas: [{ latex: "R = P \\times I", confidence: 0.88 }],
      confidence: 0.89,
      provider: "gemini-multimodal",
    },
    {
      fileUrl: "/uploads/phase6fixture-notes-4.png",
      mimeType: "image/png",
      extractedText: "Burndown chart: ideal vs actual line karşılaştırması.",
      latexFormulas: [],
      confidence: 0.4, // triggers low-confidence banner
      provider: "fallback",
    },
    {
      fileUrl: "/uploads/phase6fixture-notes-5.png",
      mimeType: "image/png",
      extractedText: "Agile manifesto 4 values — individuals over processes.",
      latexFormulas: [],
      confidence: 0.95,
      provider: "gemini-multimodal",
    },
  ];

  for (const s of samples) {
    await prisma.oCRResult.create({
      data: {
        userId,
        ...s,
        processingMs: 500 + Math.floor(Math.random() * 2000),
      },
    });
  }
}

async function seedLectures(userId: string, professorId: string | null) {
  await prisma.voiceSession.create({
    data: {
      userId,
      professorId,
      sourceType: "lecture",
      durationSec: 52 * 60,
      transcript:
        "[phase6fixture] Hocanın ders kaydı — scrum rolleri, backlog refinement süreci ve sprint retrospective üzerine...",
      topics: {
        fileHash: "phase6fixture-lecture-hash",
        keyTopics: [
          {
            topic: "Scrum Roles",
            startSec: 120,
            endSec: 600,
            quote: "Product Owner'ın önceliği sıralama",
          },
          {
            topic: "Sprint Retrospective",
            startSec: 1800,
            endSec: 2400,
            quote: "Takım dinamiği öğrenmek için şart",
          },
        ],
        examHints: [
          "Product Owner sorumlulukları vizede çıkar.",
          "Waterfall'ün dezavantajları klasik soru.",
        ],
      },
      provider: "gemini",
      interruptCount: 0,
      fallbackUsed: false,
    },
  });
}

async function seedPushDevice(userId: string) {
  await prisma.pushDevice.create({
    data: {
      userId,
      endpoint: `https://push.example.com/phase6fixture/${userId}`,
      p256dhKey: "phase6fixture-p256dh",
      authKey: "phase6fixture-auth",
      userAgent: "phase6fixture/chrome-122",
    },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { pushOptIn: true, subscriptionTier: "premium" },
  });
}

async function main() {
  console.log(`[phase-6-fixture] target demo user: ${DEMO_EMAIL}`);

  await resetDemoUser();

  const user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!user) {
    throw new Error(
      `Demo user ${DEMO_EMAIL} not found. Run npm run seed first.`
    );
  }

  // Try to hang voice sessions off a professor the user has interacted
  // with; fall back to null if none exists.
  const firstRating = await prisma.professorRating.findFirst({
    where: { userId: user.id },
    select: { professorId: true },
  });
  const professorId = firstRating?.professorId ?? null;

  await wipe(user.id);
  await seedVoiceSessions(user.id, professorId);
  await seedOCR(user.id);
  await seedLectures(user.id, professorId);
  await seedPushDevice(user.id);

  console.log("[phase-6-fixture] done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
