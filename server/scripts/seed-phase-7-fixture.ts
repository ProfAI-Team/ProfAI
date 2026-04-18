/**
 * Phase 7 smoke fixture — seeds tutor, marketplace, payment, and
 * university-account rows so the Playwright visual smoke has working
 * data for /tutors, /marketplace, /hoca/dashboard, /admin/university,
 * and /checkout.
 *
 * Idempotent: prefixes are `phase7fixture-*`; the wipe step removes
 * any prior run before reseeding. Builds on top of the Phase 6
 * fixture — runs it first so the demo user already has premium +
 * voice/ocr state.
 *
 * Usage:
 *   cd server && DATABASE_URL=... npx tsx scripts/seed-phase-7-fixture.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { execSync } from "node:child_process";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const DEMO_EMAIL =
  process.env.DEMO_USER_EMAIL ?? "erdemacar1@stu.aydin.edu.tr";

const FIXTURE_USERS = [
  {
    email: "tutor@profai.local",
    name: "Tutor Fixture",
    role: "TUTOR" as const,
  },
  {
    email: "hoca@aydin.edu.tr",
    name: "Peri Güneş (fixture)",
    role: "HOCA" as const,
  },
  {
    email: "admin@aydin.edu.tr",
    name: "Aydın Admin (fixture)",
    role: "UNIVERSITY_ADMIN" as const,
  },
];

async function runPhase6Fixture(): Promise<void> {
  try {
    execSync("npx tsx scripts/seed-phase-6-fixture.ts", { stdio: "inherit" });
  } catch (err) {
    console.error(
      "[phase-7-fixture] phase 6 fixture failed; continuing:",
      err instanceof Error ? err.message : err
    );
  }
}

async function wipe(): Promise<void> {
  await prisma.tutoringSession.deleteMany({
    where: { feedback: { contains: "[phase7fixture]" } },
  });
  await prisma.tutor.deleteMany({
    where: { bio: { contains: "[phase7fixture]" } },
  });
  await prisma.marketplaceItem.deleteMany({
    where: { title: { contains: "[phase7fixture]" } },
  });
  await prisma.payment.deleteMany({
    where: {
      metadata: { path: ["phase7fixture"], equals: true },
    },
  });
  await prisma.universityAccount.deleteMany({
    where: { universityId: { startsWith: "phase7fixture-" } },
  });
  await prisma.user.deleteMany({
    where: { email: { in: FIXTURE_USERS.map((u) => u.email) } },
  });
}

async function ensureFixtureUsers(): Promise<
  Record<string, { id: string; email: string; role: string }>
> {
  const hashed = await bcrypt.hash("password123", 10);
  const out: Record<string, { id: string; email: string; role: string }> = {};
  for (const u of FIXTURE_USERS) {
    const user = await prisma.user.create({
      data: {
        email: u.email,
        password: hashed,
        name: u.name,
        role: u.role,
      },
    });
    out[u.role] = { id: user.id, email: user.email, role: user.role };
  }
  return out;
}

async function seedUniversityAccount(
  adminId: string
): Promise<{ tenantId: string }> {
  const tenant = await prisma.universityAccount.create({
    data: {
      universityId: `phase7fixture-aydin`,
      contactEmail: "admin@aydin.edu.tr",
      tier: "pro",
      seats: 100,
      renewalDate: new Date(Date.now() + 365 * 86_400_000),
    },
  });
  await prisma.user.update({
    where: { id: adminId },
    data: { universityAccountId: tenant.id },
  });
  return { tenantId: tenant.id };
}

async function seedTutors(tutorUserId: string): Promise<string[]> {
  const seedData = [
    {
      userId: tutorUserId,
      bio: "[phase7fixture] 5 yıl kalkülüs asistanlığı; grad student.",
      hourlyRate: 250,
      rating: 4.7,
      totalSessions: 23,
      specializations: [
        { subject: "Calculus", level: "intermediate", tags: ["limits", "integrals"] },
        { subject: "Linear Algebra", level: "advanced" },
      ],
      availability: [{ dayOfWeek: 2, startHour: 19, endHour: 22 }],
      status: "active",
    },
  ];
  const ids: string[] = [];
  for (const data of seedData) {
    const t = await prisma.tutor.create({
      data: {
        ...data,
        specializations: data.specializations as unknown as object,
        availability: data.availability as unknown as object,
        verifiedAt: new Date(),
      },
    });
    ids.push(t.id);
  }
  return ids;
}

async function seedMarketplaceItems(sellerId: string): Promise<string[]> {
  const items = [
    {
      sellerId,
      type: "notes",
      title: "[phase7fixture] Diferansiyel Geometri — Full Semester",
      description:
        "Aydın Üniversitesi MAT 324 notları. Tüm bölümler + çözümlü örnekler.",
      price: 45,
      fileUrl: "marketplace/phase7fixture-diffgeo.pdf",
      tags: ["math", "geometry"] as unknown as object,
      approved: true,
      rating: 4.6,
      totalSales: 18,
    },
    {
      sellerId,
      type: "study_guide",
      title: "[phase7fixture] Organik Kimya Sınav Kitabı",
      description:
        "UYG 212 için organik kimya sınavlarının pattern analizi + 120 soruluk deneme seti.",
      price: 60,
      fileUrl: "marketplace/phase7fixture-organic.pdf",
      tags: ["chemistry"] as unknown as object,
      approved: true,
      rating: 4.8,
      totalSales: 31,
    },
    {
      sellerId,
      type: "notes",
      title: "[phase7fixture] Moderasyonda — Yeni Not",
      description: "Henüz onay beklemede.",
      price: 30,
      fileUrl: "marketplace/phase7fixture-pending.pdf",
      tags: [] as unknown as object,
      approved: false,
    },
  ];
  const ids: string[] = [];
  for (const item of items) {
    const row = await prisma.marketplaceItem.create({
      data: item as unknown as Parameters<
        typeof prisma.marketplaceItem.create
      >[0]["data"],
    });
    ids.push(row.id);
  }
  return ids;
}

async function seedPayments(userId: string, marketplaceItemId: string): Promise<void> {
  await prisma.payment.create({
    data: {
      userId,
      type: "marketplace",
      amount: 4500,
      currency: "TRY",
      status: "succeeded",
      provider: "iyzico",
      externalId: `iyz_phase7fixture_${Date.now()}_1`,
      metadata: {
        marketplaceItemId,
        phase7fixture: true,
      } as unknown as object,
      completedAt: new Date(),
    },
  });
  await prisma.payment.create({
    data: {
      userId,
      type: "subscription",
      amount: 4900,
      currency: "TRY",
      status: "pending",
      provider: "iyzico",
      externalId: `iyz_phase7fixture_${Date.now()}_2`,
      metadata: {
        subscriptionPlan: "premium",
        phase7fixture: true,
      } as unknown as object,
    },
  });
}

async function seedTutoringSessions(
  tutorId: string,
  studentId: string
): Promise<void> {
  const now = Date.now();
  await prisma.tutoringSession.create({
    data: {
      tutorId,
      studentId,
      scheduledAt: new Date(now + 2 * 86_400_000),
      durationMin: 60,
      status: "scheduled",
      price: 250,
      feedback: "[phase7fixture] upcoming",
    },
  });
  await prisma.tutoringSession.create({
    data: {
      tutorId,
      studentId,
      scheduledAt: new Date(now - 5 * 86_400_000),
      durationMin: 90,
      status: "completed",
      price: 375,
      rating: 5,
      feedback: "[phase7fixture] Harika bir ders — integral konusu netleşti.",
      completedAt: new Date(now - 5 * 86_400_000 + 90 * 60_000),
    },
  });
}

async function main(): Promise<void> {
  console.log("[phase-7-fixture] running phase 6 fixture first…");
  await runPhase6Fixture();

  console.log("[phase-7-fixture] wiping prior phase 7 rows…");
  await wipe();

  console.log("[phase-7-fixture] ensuring fixture users…");
  const users = await ensureFixtureUsers();

  console.log("[phase-7-fixture] seeding university account…");
  const { tenantId } = await seedUniversityAccount(users.UNIVERSITY_ADMIN!.id);
  console.log(`  tenant: ${tenantId}`);

  console.log("[phase-7-fixture] seeding tutors…");
  const tutorIds = await seedTutors(users.TUTOR!.id);
  console.log(`  tutors: ${tutorIds.length}`);

  console.log("[phase-7-fixture] seeding marketplace items…");
  const itemIds = await seedMarketplaceItems(users.TUTOR!.id);
  console.log(`  items: ${itemIds.length}`);

  console.log("[phase-7-fixture] seeding payments…");
  const demoUser = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
  });
  if (demoUser) {
    await seedPayments(demoUser.id, itemIds[0]!);
  }

  console.log("[phase-7-fixture] seeding tutoring sessions…");
  if (demoUser) {
    await seedTutoringSessions(tutorIds[0]!, demoUser.id);
  }

  console.log("[phase-7-fixture] done");
}

main()
  .catch((err) => {
    console.error("[phase-7-fixture] failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
