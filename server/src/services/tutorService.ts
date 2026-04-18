import type { Tutor } from "@prisma/client";

import prisma from "../lib/prisma";
import { AppError, notFound } from "../lib/AppError";
import { featureLogger } from "../lib/logger";
import { embedText, toPgVectorLiteral } from "./llm/embeddingService";
import { cacheGet, cacheInvalidate } from "../lib/cache";

const log = featureLogger("tutor");

/**
 * Tutor marketplace service (Phase 7 task 7.14).
 *
 * Lifecycle:
 *   STUDENT  → applies (status: "pending")
 *   SUPER_ADMIN approves → status: "active" + embedding generate
 *   TUTOR    → can self-edit profile; cannot edit status
 *   admin suspends → status: "suspended"
 *
 * `specializations` + `availability` are JSON blobs the caller writes;
 * the matching engine inspects them but the DB does not enforce shape.
 * The embedding vector covers the bio + concatenated subject tags so
 * pgvector cosine search can rank tutors by how well their description
 * matches the student's free-text interests.
 *
 * Commercial note (spec): ProfAI takes 15% commission on tutoring
 * bookings; the commission calc lives in marketplaceService so both
 * revenue streams use the same helper.
 */

export interface Specialization {
  subject: string;
  level: "beginner" | "intermediate" | "advanced";
  tags?: string[];
}

export interface AvailabilitySlot {
  dayOfWeek: number; // 0 = Sun, 6 = Sat
  startHour: number;
  endHour: number;
}

export interface CreateTutorInput {
  userId: string;
  bio: string;
  hourlyRate: number; // TL
  specializations: Specialization[];
  availability: AvailabilitySlot[];
}

export interface MatchFilters {
  studentId: string;
  subject?: string;
  level?: string;
  priceMinTl?: number;
  priceMaxTl?: number;
  minRating?: number;
  limit?: number;
}

export interface TutorMatchScore {
  tutor: Tutor;
  score: number;
  reasons: string[];
}

const MATCH_CACHE_TTL_SEC = 300;
const TUTOR_PROFILE_CACHE_TTL_SEC = 600;

function tutorProfileCacheKey(userId: string): string {
  return `tutor:profile:${userId}`;
}

function tutorMatchCacheKey(filters: MatchFilters): string {
  // Quick deterministic fingerprint for repeated searches — we don't
  // care about ordering inside filters because there are so few keys.
  return `tutor:match:${filters.studentId}:${filters.subject ?? "_"}:${
    filters.level ?? "_"
  }:${filters.priceMinTl ?? "_"}:${filters.priceMaxTl ?? "_"}:${
    filters.minRating ?? "_"
  }:${filters.limit ?? 20}`;
}

async function buildEmbeddingText(
  bio: string,
  specializations: Specialization[]
): Promise<string> {
  const subjectLines = specializations.map((s) => {
    const tagSuffix = s.tags?.length ? ` (${s.tags.join(", ")})` : "";
    return `${s.subject} — ${s.level}${tagSuffix}`;
  });
  return [bio, ...subjectLines].join("\n");
}

async function persistEmbedding(
  tutorId: string,
  text: string,
  userId: string
): Promise<void> {
  const vector = await embedText(text, {
    userId,
    feature: "tutor-embedding",
  });
  if (!vector) return;
  await prisma.$executeRawUnsafe(
    `UPDATE tutors SET embedding = $1::vector WHERE id = $2`,
    toPgVectorLiteral(vector),
    tutorId
  );
}

export async function createTutorProfile(
  input: CreateTutorInput
): Promise<Tutor> {
  const existing = await prisma.tutor.findUnique({
    where: { userId: input.userId },
  });
  if (existing) {
    throw new AppError(
      "CONFLICT",
      "User already has a tutor profile",
      409
    );
  }
  if (input.hourlyRate <= 0) {
    throw new AppError(
      "VALIDATION_FAILED",
      "hourlyRate must be positive",
      400
    );
  }
  if (input.specializations.length === 0) {
    throw new AppError(
      "VALIDATION_FAILED",
      "At least one specialization is required",
      400
    );
  }

  const tutor = await prisma.tutor.create({
    data: {
      userId: input.userId,
      bio: input.bio,
      hourlyRate: input.hourlyRate,
      specializations: input.specializations as unknown as object,
      availability: input.availability as unknown as object,
      status: "pending",
    },
  });

  log.info({ tutorId: tutor.id, userId: input.userId }, "tutor profile created");
  return tutor;
}

export async function approveTutor(tutorId: string): Promise<Tutor> {
  const tutor = await prisma.tutor.findUnique({ where: { id: tutorId } });
  if (!tutor) throw notFound("Tutor not found");
  if (tutor.status === "active") return tutor;

  const updated = await prisma.tutor.update({
    where: { id: tutorId },
    data: {
      status: "active",
      verifiedAt: new Date(),
    },
  });

  // Fire embedding generation in the background — but inline because our
  // queue layer runs inline in tests anyway. Failures are logged but
  // don't block the approve flow.
  const spec = updated.specializations as unknown as Specialization[];
  const textForEmbedding = await buildEmbeddingText(updated.bio, spec);
  try {
    await persistEmbedding(updated.id, textForEmbedding, updated.userId);
  } catch (err) {
    log.warn(
      { tutorId: updated.id, err: (err as Error).message },
      "tutor embedding failed"
    );
  }

  // Invalidate any prior matching results — a new tutor changed the
  // search-space, so keep it simple and blast the whole namespace.
  await cacheInvalidate("tutor:match:*");
  await cacheInvalidate(tutorProfileCacheKey(updated.userId));

  log.info({ tutorId: updated.id }, "tutor approved");
  return updated;
}

export async function getTutorByUserId(userId: string): Promise<Tutor | null> {
  return cacheGet(
    tutorProfileCacheKey(userId),
    () => prisma.tutor.findUnique({ where: { userId } }),
    { ttlSec: TUTOR_PROFILE_CACHE_TTL_SEC }
  );
}

export async function getTutorById(id: string): Promise<Tutor | null> {
  return prisma.tutor.findUnique({ where: { id } });
}

function subjectMatchScore(
  wanted: string | undefined,
  specs: Specialization[]
): { score: number; reason?: string } {
  if (!wanted) return { score: 0 };
  const lower = wanted.toLowerCase();
  const match = specs.find(
    (s) =>
      s.subject.toLowerCase().includes(lower) ||
      (s.tags ?? []).some((t) => t.toLowerCase().includes(lower))
  );
  if (!match) return { score: 0 };
  return { score: 50, reason: `Konu eşleşmesi: ${match.subject}` };
}

function levelMatchScore(
  wanted: string | undefined,
  specs: Specialization[]
): { score: number; reason?: string } {
  if (!wanted) return { score: 0 };
  const hit = specs.find((s) => s.level === wanted);
  if (!hit) return { score: 0 };
  return { score: 10, reason: `Seviye uyumu: ${wanted}` };
}

function ratingScore(
  rating: number | null
): { score: number; reason?: string } {
  if (rating === null) return { score: 0 };
  if (rating >= 4.5) return { score: 30, reason: `Puan ${rating.toFixed(1)}` };
  if (rating >= 4.0) return { score: 20, reason: `Puan ${rating.toFixed(1)}` };
  if (rating >= 3.0) return { score: 10, reason: `Puan ${rating.toFixed(1)}` };
  return { score: 0 };
}

/**
 * Phase 7 rubric (spec "Açık Karar Noktaları"):
 *   subject match: 50%
 *   rating:        30%
 *   DNA embedding: 20% — added when the student has an AcademicDNA row
 *                      and the tutor has an embedding column populated.
 *
 * The pgvector distance lookup happens in `fetchCandidates` so the rubric
 * can read the similarity alongside the DB fields.
 */
export async function matchTutors(
  filters: MatchFilters
): Promise<TutorMatchScore[]> {
  return cacheGet(
    tutorMatchCacheKey(filters),
    async () => {
      const candidates = await fetchCandidates(filters);
      const results = candidates.map((row) => scoreCandidate(row, filters));
      results.sort((a, b) => b.score - a.score);
      return results.slice(0, filters.limit ?? 20);
    },
    { ttlSec: MATCH_CACHE_TTL_SEC }
  );
}

interface RawCandidate {
  tutor: Tutor;
  distance: number | null;
}

async function fetchCandidates(
  filters: MatchFilters
): Promise<RawCandidate[]> {
  const limit = (filters.limit ?? 20) * 3; // overfetch; rubric re-ranks
  const priceMinKurus = (filters.priceMinTl ?? 0) * 100;
  const priceMaxKurus = (filters.priceMaxTl ?? 1_000_000) * 100;

  // Without embedding access through Prisma we use a raw query to fetch
  // both the row fields + the cosine distance against the student's DNA
  // vector if one exists. For Phase 7 MVP the student-side embedding is
  // pulled from the student's free-text query; when that's absent we
  // fall back to DB filtering only (distance stays null).
  const query = filters.subject ?? filters.level ?? null;
  const studentVector = query
    ? await embedText(query, {
        userId: filters.studentId,
        feature: "tutor-match-query",
      })
    : null;

  if (studentVector) {
    const vectorLiteral = toPgVectorLiteral(studentVector);
    const rows = await prisma.$queryRawUnsafe<
      Array<Tutor & { distance: number | null }>
    >(
      `SELECT t.*, CASE WHEN t.embedding IS NULL THEN NULL ELSE (t.embedding <=> $1::vector) END AS distance
       FROM tutors t
       WHERE t.status = 'active'
         AND t."hourlyRate" * 100 BETWEEN $2 AND $3
         AND ($4::float IS NULL OR t.rating >= $4)
       ORDER BY distance NULLS LAST
       LIMIT $5`,
      vectorLiteral,
      priceMinKurus,
      priceMaxKurus,
      filters.minRating ?? null,
      limit
    );
    return rows.map(({ distance, ...tutor }) => ({
      tutor: tutor as Tutor,
      distance,
    }));
  }

  const rows = await prisma.tutor.findMany({
    where: {
      status: "active",
      hourlyRate: {
        gte: Math.ceil(priceMinKurus / 100),
        lte: Math.floor(priceMaxKurus / 100),
      },
      rating: filters.minRating ? { gte: filters.minRating } : undefined,
    },
    take: limit,
  });
  return rows.map((tutor) => ({ tutor, distance: null }));
}

function scoreCandidate(
  row: RawCandidate,
  filters: MatchFilters
): TutorMatchScore {
  const specs = (row.tutor.specializations as unknown as Specialization[]) ??
    [];
  const reasons: string[] = [];
  let total = 0;

  const subj = subjectMatchScore(filters.subject, specs);
  total += subj.score;
  if (subj.reason) reasons.push(subj.reason);

  const level = levelMatchScore(filters.level, specs);
  total += level.score;
  if (level.reason) reasons.push(level.reason);

  const rate = ratingScore(row.tutor.rating);
  total += rate.score;
  if (rate.reason) reasons.push(rate.reason);

  if (row.distance !== null) {
    // pgvector cosine_distance is in [0, 2]; invert + scale to a 0..20
    // band so the DNA layer stays a 20% contributor per the rubric.
    const sim = Math.max(0, 1 - row.distance); // 0..1
    const dnaPoints = Math.round(sim * 20);
    total += dnaPoints;
    if (dnaPoints > 0) {
      reasons.push(
        `Profil benzerliği: ${Math.round(sim * 100)}%`
      );
    }
  }

  return {
    tutor: row.tutor,
    score: Math.min(100, total),
    reasons,
  };
}

export async function completeSession(input: {
  sessionId: string;
  rating: number;
  feedback?: string;
}): Promise<void> {
  if (input.rating < 1 || input.rating > 5) {
    throw new AppError(
      "VALIDATION_FAILED",
      "rating must be 1..5",
      400
    );
  }
  const session = await prisma.tutoringSession.findUnique({
    where: { id: input.sessionId },
  });
  if (!session) throw notFound("Tutoring session not found");
  if (session.status === "completed") return;
  if (session.status === "cancelled" || session.status === "disputed") {
    throw new AppError(
      "INVALID_STATE",
      `Session is ${session.status}; cannot complete.`,
      409
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.tutoringSession.update({
      where: { id: input.sessionId },
      data: {
        status: "completed",
        rating: input.rating,
        feedback: input.feedback ?? null,
        completedAt: new Date(),
      },
    });
    // Re-aggregate the tutor's rating + session count.
    const sessions = await tx.tutoringSession.findMany({
      where: { tutorId: session.tutorId, rating: { not: null } },
      select: { rating: true },
    });
    const ratings = sessions
      .map((s) => s.rating ?? 0)
      .filter((r) => r > 0);
    const avg = ratings.length
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : null;
    await tx.tutor.update({
      where: { id: session.tutorId },
      data: {
        rating: avg,
        totalSessions: { increment: 1 },
      },
    });
  });

  await cacheInvalidate("tutor:match:*");
  log.info(
    { sessionId: input.sessionId, rating: input.rating },
    "tutoring session completed"
  );
}
