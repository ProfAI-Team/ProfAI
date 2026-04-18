import prisma from "../lib/prisma";
import { AppError, forbidden, notFound } from "../lib/AppError";
import { featureLogger } from "../lib/logger";
import { cacheGet, cacheInvalidate } from "../lib/cache";

const log = featureLogger("universityAdmin");

/**
 * University admin service (Phase 7 task 7.16). Operators of a
 * UniversityAccount manage their seat roster + read aggregate insights
 * (pass rate, top struggling topics, hoca effectiveness). All aggregates
 * are k-anonymised at n≥5 to stay on the right side of the KVKK
 * review tour 2.
 *
 * SSO is stubbed in this phase — the `provisionSso` endpoint stores the
 * uploaded SAML metadata blob for later wiring; actual SP↔IdP flow is
 * Phase 8.
 */

const K_ANON_THRESHOLD = 5;
const DASHBOARD_TTL_SEC = 300;

export interface UniversityDashboard {
  status: "ready" | "insufficient";
  tenant: {
    id: string;
    universityId: string;
    tier: string;
    seats: number;
    seatsUsed: number;
    renewalDate: Date;
  };
  activeStudents: number;
  mockExamSessions: {
    completed: number;
    avgScore: number | null;
  };
  topStruggling: Array<{ topic: string; avgScore: number; sampleSize: number }>;
  hocaRatingTopN: Array<{
    professorId: string;
    name: string;
    avgFairness: number;
    avgDifficulty: number;
    sampleSize: number;
  }>;
}

export async function getDashboard(
  tenantId: string
): Promise<UniversityDashboard> {
  return cacheGet(
    `university:dashboard:${tenantId}`,
    () => buildDashboard(tenantId),
    { ttlSec: DASHBOARD_TTL_SEC }
  );
}

async function buildDashboard(
  tenantId: string
): Promise<UniversityDashboard> {
  const tenant = await prisma.universityAccount.findUnique({
    where: { id: tenantId },
  });
  if (!tenant) throw notFound("University account not found");

  const members = await prisma.user.findMany({
    where: { universityAccountId: tenantId },
    select: { id: true },
  });
  const memberIds = members.map((m) => m.id);
  const activeStudents = memberIds.length;

  const baseTenantInfo = {
    id: tenant.id,
    universityId: tenant.universityId,
    tier: tenant.tier,
    seats: tenant.seats,
    seatsUsed: activeStudents,
    renewalDate: tenant.renewalDate,
  };

  if (activeStudents < K_ANON_THRESHOLD) {
    return {
      status: "insufficient",
      tenant: baseTenantInfo,
      activeStudents,
      mockExamSessions: { completed: 0, avgScore: null },
      topStruggling: [],
      hocaRatingTopN: [],
    };
  }

  const sessions = await prisma.mockExamSession.findMany({
    where: {
      userId: { in: memberIds },
      completedAt: { not: null },
    },
    select: { score: true, topicGaps: true },
    take: 1000,
  });

  const scores = sessions
    .map((s) => s.score)
    .filter((s): s is number => typeof s === "number");
  const avgScore =
    scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) /
        10
      : null;

  // Aggregate topic-level accuracy.
  const topicAccum = new Map<
    string,
    { correct: number; total: number; sample: number }
  >();
  for (const s of sessions) {
    const gaps = Array.isArray(s.topicGaps)
      ? (s.topicGaps as Array<{
          topic: string;
          correctCount: number;
          totalCount: number;
        }>)
      : [];
    for (const g of gaps) {
      const acc = topicAccum.get(g.topic) ?? {
        correct: 0,
        total: 0,
        sample: 0,
      };
      acc.correct += g.correctCount;
      acc.total += g.totalCount;
      acc.sample += 1;
      topicAccum.set(g.topic, acc);
    }
  }

  const topStruggling = Array.from(topicAccum.entries())
    .filter(([, v]) => v.sample >= K_ANON_THRESHOLD && v.total > 0)
    .map(([topic, v]) => ({
      topic,
      avgScore: Math.round((v.correct / v.total) * 100),
      sampleSize: v.sample,
    }))
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 5);

  const ratings = await prisma.professorRating.findMany({
    where: { userId: { in: memberIds } },
    select: {
      professorId: true,
      difficultyScore: true,
      fairnessScore: true,
      userId: true,
      professor: { select: { name: true } },
    },
  });
  const byProf = new Map<
    string,
    {
      name: string;
      difficulty: number[];
      fairness: number[];
      raters: Set<string>;
    }
  >();
  for (const r of ratings) {
    const entry = byProf.get(r.professorId) ?? {
      name: r.professor.name,
      difficulty: [],
      fairness: [],
      raters: new Set<string>(),
    };
    entry.difficulty.push(r.difficultyScore);
    entry.fairness.push(r.fairnessScore);
    entry.raters.add(r.userId);
    byProf.set(r.professorId, entry);
  }
  const hocaRatingTopN = Array.from(byProf.entries())
    .filter(([, v]) => v.raters.size >= K_ANON_THRESHOLD)
    .map(([professorId, v]) => ({
      professorId,
      name: v.name,
      avgDifficulty: round1(
        v.difficulty.reduce((a, b) => a + b, 0) / v.difficulty.length
      ),
      avgFairness: round1(
        v.fairness.reduce((a, b) => a + b, 0) / v.fairness.length
      ),
      sampleSize: v.raters.size,
    }))
    .sort((a, b) => b.avgFairness - a.avgFairness)
    .slice(0, 5);

  return {
    status: "ready",
    tenant: baseTenantInfo,
    activeStudents,
    mockExamSessions: {
      completed: sessions.length,
      avgScore,
    },
    topStruggling,
    hocaRatingTopN,
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export async function addSeat(
  tenantId: string,
  userEmail: string
): Promise<void> {
  const tenant = await prisma.universityAccount.findUnique({
    where: { id: tenantId },
  });
  if (!tenant) throw notFound("University account not found");

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });
  if (!user) throw notFound(`User ${userEmail} not registered on ProfAI`);

  if (user.universityAccountId === tenantId) return;

  const seatsUsed = await prisma.user.count({
    where: { universityAccountId: tenantId },
  });
  if (seatsUsed >= tenant.seats) {
    throw new AppError(
      "SEATS_FULL",
      `Tenant has reached its seat cap (${tenant.seats}).`,
      409
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { universityAccountId: tenantId },
  });
  await cacheInvalidate(`university:dashboard:${tenantId}`);
  log.info({ tenantId, userId: user.id }, "seat added");
}

export async function removeSeat(
  tenantId: string,
  userId: string
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw notFound("User not found");
  if (user.universityAccountId !== tenantId) {
    throw forbidden("User does not belong to this tenant.");
  }
  await prisma.user.update({
    where: { id: userId },
    data: { universityAccountId: null },
  });
  await cacheInvalidate(`university:dashboard:${tenantId}`);
}

export async function provisionSso(input: {
  tenantId: string;
  samlMetadata: string;
}): Promise<void> {
  const tenant = await prisma.universityAccount.findUnique({
    where: { id: input.tenantId },
  });
  if (!tenant) throw notFound("University account not found");
  if (!input.samlMetadata.includes("<md:EntityDescriptor")) {
    throw new AppError(
      "VALIDATION_FAILED",
      "samlMetadata must be a SAML EntityDescriptor XML blob",
      400
    );
  }
  await prisma.universityAccount.update({
    where: { id: input.tenantId },
    data: { ssoMetadata: input.samlMetadata },
  });
  log.info({ tenantId: input.tenantId }, "SSO metadata provisioned (stub)");
}
