import prisma from "../lib/prisma";
import { AppError, forbidden } from "../lib/AppError";
import { featureLogger } from "../lib/logger";
import { cacheGet } from "../lib/cache";

const log = featureLogger("hocaPortal");

/**
 * Hoca portal service (Phase 7 task 7.16). Once a hoca has been verified
 * — email-domain match + manual SUPER_ADMIN approve — they get a
 * dashboard showing how the students who took their courses are doing
 * on ProfAI's aggregate metrics. Everything is k-anonymised at n≥5.
 */

const K_ANON_THRESHOLD = 5;
const DASHBOARD_TTL_SEC = 300;

export interface HocaDashboard {
  status: "ready" | "insufficient";
  professors: Array<{
    professorId: string;
    name: string;
    strugglingTopics: Array<{ topic: string; avgScore: number; sampleSize: number }>;
    studentCount: number;
  }>;
}

export interface HocaFeedback {
  status: "ready" | "insufficient";
  items: Array<{
    anonymizedHash: string;
    difficulty: number;
    fairness: number;
    commentExcerpt: string | null;
    createdAt: Date;
  }>;
}

export async function verifyHocaByEmail(input: {
  userId: string;
  email: string;
}): Promise<{ matched: Array<{ id: string; name: string; department: string }> }> {
  const at = input.email.lastIndexOf("@");
  if (at === -1) {
    throw new AppError(
      "VALIDATION_FAILED",
      "Email must contain an @",
      400
    );
  }
  const domain = input.email.slice(at + 1).toLowerCase();
  if (!domain.endsWith(".edu.tr") && !domain.endsWith(".edu")) {
    throw new AppError(
      "VALIDATION_FAILED",
      "Use your university email (must end with .edu or .edu.tr)",
      400
    );
  }

  // Professor.university is the display name (e.g. "İstanbul Aydın
  // Üniversitesi"). We match heuristically — email domain's root
  // keyword lives somewhere in the university string. A SUPER_ADMIN
  // reviews the match before role HOCA is granted.
  const root = domain.split(".").slice(-3, -2)[0] ?? domain; // "aydin" in aydin.edu.tr
  const professors = await prisma.professor.findMany({
    where: {
      university: { contains: root, mode: "insensitive" },
    },
    select: { id: true, name: true, department: true },
    take: 50,
  });

  log.info(
    { userId: input.userId, domain, matchCount: professors.length },
    "hoca verify request"
  );
  return { matched: professors };
}

export async function getHocaDashboard(
  userId: string,
  professorIds: string[]
): Promise<HocaDashboard> {
  if (professorIds.length === 0) {
    return { status: "insufficient", professors: [] };
  }
  return cacheGet(
    `hoca:dashboard:${userId}:${professorIds.slice().sort().join(",")}`,
    () => buildDashboard(professorIds),
    { ttlSec: DASHBOARD_TTL_SEC }
  );
}

async function buildDashboard(
  professorIds: string[]
): Promise<HocaDashboard> {
  const output: HocaDashboard["professors"] = [];

  for (const professorId of professorIds) {
    const professor = await prisma.professor.findUnique({
      where: { id: professorId },
      select: { id: true, name: true },
    });
    if (!professor) continue;

    // Pull every completed mock exam session for a course taught by the
    // professor. Phase 7 MVP walks through the professor's mock exams;
    // Phase 8 can switch to a materialized view.
    const mockExams = await prisma.mockExam.findMany({
      where: { professorId },
      select: { id: true },
    });
    const examIds = mockExams.map((e) => e.id);

    const sessions = examIds.length
      ? await prisma.mockExamSession.findMany({
          where: {
            mockExamId: { in: examIds },
            completedAt: { not: null },
          },
          select: { userId: true, topicGaps: true },
        })
      : [];

    const studentIds = new Set(sessions.map((s) => s.userId));
    const studentCount = studentIds.size;

    if (studentCount < K_ANON_THRESHOLD) {
      output.push({
        professorId,
        name: professor.name,
        strugglingTopics: [],
        studentCount,
      });
      continue;
    }

    // Aggregate topic-level accuracy across sessions.
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

    const scored = Array.from(topicAccum.entries())
      .filter(([, v]) => v.total >= K_ANON_THRESHOLD)
      .map(([topic, v]) => ({
        topic,
        avgScore: Math.round((v.correct / v.total) * 100),
        sampleSize: v.sample,
      }))
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 3);

    output.push({
      professorId,
      name: professor.name,
      strugglingTopics: scored,
      studentCount,
    });
  }

  const status: "ready" | "insufficient" = output.some(
    (p) => p.studentCount >= K_ANON_THRESHOLD
  )
    ? "ready"
    : "insufficient";

  return { status, professors: output };
}

export async function getHocaFeedback(
  professorIds: string[]
): Promise<HocaFeedback> {
  if (professorIds.length === 0) {
    return { status: "insufficient", items: [] };
  }
  const ratings = await prisma.professorRating.findMany({
    where: { professorId: { in: professorIds } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const uniqueRaters = new Set(ratings.map((r) => r.userId));
  if (uniqueRaters.size < K_ANON_THRESHOLD) {
    return { status: "insufficient", items: [] };
  }

  // Anonymise — replace userId with a stable-but-opaque hash so
  // the hoca can see "5 different students said X" without learning
  // which students said it.
  const items = ratings.map((r) => ({
    anonymizedHash: maskId(r.userId),
    difficulty: r.difficultyScore,
    fairness: r.fairnessScore,
    commentExcerpt: r.comment ? r.comment.slice(0, 140) : null,
    createdAt: r.createdAt,
  }));

  return { status: "ready", items };
}

function maskId(userId: string): string {
  // Simple deterministic masking — enough to obscure the actual user
  // id in the UI. The server-side PII stays in ProfessorRating; this
  // is a rendering concern.
  return `u${userId.slice(0, 4)}…${userId.slice(-2)}`;
}

export async function ensureHocaRole(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("NOT_FOUND", "User not found", 404);
  if (user.role !== "HOCA" && user.role !== "SUPER_ADMIN") {
    throw forbidden("HOCA role required");
  }
}
