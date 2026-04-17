import type { Prisma, StudyPack } from "@prisma/client";

import prisma from "../lib/prisma";
import { hashText } from "../lib/textExtract";
import {
  STUDY_PACK_VERSION,
  computeTargetTypeDistribution,
  isDistributionWithinTolerance,
  type TargetDistribution,
} from "../prompts/study-pack";
import {
  generateStudyPack as callGeminiStudyPack,
  type StudyPackContent,
} from "./llm/geminiProvider";
import {
  getOrBuildStyleProfile,
  type AggregatedData,
  type TopTopic,
} from "./professorStyleService";

// 24 hour cache TTL per Phase 2 spec (`expiresAt = generatedAt + 24h`).
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export type StudyPackGenerationStatus = "ready" | "insufficient_data" | "not_found";

export interface StudyPackReady {
  status: "ready";
  pack: StudyPack;
  cacheHit: boolean;
  distributionWithinTolerance: boolean;
}

export interface StudyPackInsufficient {
  status: "insufficient_data";
  reason:
    | "no_notes"
    | "notes_not_found"
    | "professor_not_found"
    | "style_profile_missing";
  message: string;
}

export type StudyPackResult = StudyPackReady | StudyPackInsufficient;

export interface GenerateArgs {
  userId: string;
  professorId: string;
  noteIds: string[];
}

function sortedIds(ids: string[]): string[] {
  return [...new Set(ids)].sort();
}

function computeNoteHash(orderedNotes: { id: string; extractedText: string }[]): string {
  // `orderedNotes` must already be sorted by id. We prefix each block with
  // the id so two notes with identical content but different ids still
  // yield a different hash (prevents accidental collisions).
  const payload = orderedNotes
    .map((n) => `${n.id}\n${n.extractedText}`)
    .join("\n---\n");
  return hashText(payload);
}

function buildDistributionFromContent(
  content: StudyPackContent
): TargetDistribution {
  if (content.practiceQuestions.length === 0) {
    return { MC: 0, CLASSIC: 0, TF: 0 };
  }
  const counts = { MC: 0, CLASSIC: 0, TF: 0 };
  for (const q of content.practiceQuestions) {
    if (q.type in counts) {
      counts[q.type as keyof typeof counts] += 1;
    }
  }
  const total = content.practiceQuestions.length;
  return {
    MC: Math.round((counts.MC / total) * 100),
    CLASSIC: Math.round((counts.CLASSIC / total) * 100),
    TF: Math.round((counts.TF / total) * 100),
  };
}

export async function generateStudyPack(
  args: GenerateArgs
): Promise<StudyPackResult> {
  const noteIds = sortedIds(args.noteIds);
  if (noteIds.length === 0) {
    return {
      status: "insufficient_data",
      reason: "no_notes",
      message: "En az bir not seçmelisin.",
    };
  }

  // Fetch the selected notes scoped to the user — prevents using another
  // student's notes even with a guessed id.
  const notes = await prisma.studentNote.findMany({
    where: { id: { in: noteIds }, userId: args.userId },
    select: { id: true, extractedText: true },
    orderBy: { id: "asc" },
  });

  if (notes.length === 0) {
    return {
      status: "insufficient_data",
      reason: "notes_not_found",
      message: "Seçilen notlar bulunamadı.",
    };
  }

  const professor = await prisma.professor.findUnique({
    where: { id: args.professorId },
    select: { id: true, department: true },
  });
  if (!professor) {
    return {
      status: "insufficient_data",
      reason: "professor_not_found",
      message: "Seçilen hoca bulunamadı.",
    };
  }

  const noteHash = computeNoteHash(notes);

  // Cache look-up: `(userId, professorId, noteHash, promptVersion)` is the
  // unique constraint from migration `phase_2_study_packs`.
  const cached = await prisma.studyPack.findUnique({
    where: {
      userId_professorId_noteHash_promptVersion: {
        userId: args.userId,
        professorId: args.professorId,
        noteHash,
        promptVersion: STUDY_PACK_VERSION,
      },
    },
  });
  if (cached && cached.expiresAt > new Date()) {
    return {
      status: "ready",
      pack: cached,
      cacheHit: true,
      distributionWithinTolerance: true,
    };
  }

  // Phase 1 style profile is both an input *and* a dependency: the prompt
  // anchors on `aggregated.questionTypes` for the target MC/Classic/TF
  // split. Without enough exams, we refuse to generate — the frontend
  // shows "bu hocadan yeterli sınav yok" and the student can still choose
  // a different professor.
  const style = await getOrBuildStyleProfile(args.professorId);
  if (style.status === "insufficient_data") {
    return {
      status: "insufficient_data",
      reason: "style_profile_missing",
      message:
        "Bu hoca için sınav stili henüz çıkarılamadı. Önce sınav ekleyip sonra çalışma paketi üretebilirsin.",
    };
  }

  const aggregated = style.profile.aggregatedData as unknown as AggregatedData;
  const topTopics = style.profile.topTopics as unknown as TopTopic[];
  const target = computeTargetTypeDistribution(aggregated);

  const noteText = notes.map((n) => n.extractedText).join("\n\n---\n\n");

  const generated = await callGeminiStudyPack(
    {
      noteText,
      aggregated,
      topTopics,
      styleSummary: style.profile.geminiSummary,
      professorDepartment: professor.department,
    },
    { userId: args.userId }
  );

  const actualDistribution = buildDistributionFromContent(generated.content);
  const withinTolerance = isDistributionWithinTolerance(
    actualDistribution,
    target
  );
  if (!withinTolerance) {
    console.warn(
      `[studyPackService] Distribution drift: target=${JSON.stringify(target)} actual=${JSON.stringify(actualDistribution)} — persisting anyway (soft miss)`
    );
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + CACHE_TTL_MS);

  // `upsert` keyed on the unique constraint — handles the race where two
  // requests both miss the cache: the loser gets the winner's row.
  const pack = await prisma.studyPack.upsert({
    where: {
      userId_professorId_noteHash_promptVersion: {
        userId: args.userId,
        professorId: args.professorId,
        noteHash,
        promptVersion: STUDY_PACK_VERSION,
      },
    },
    create: {
      userId: args.userId,
      professorId: args.professorId,
      noteIds,
      noteHash,
      topicSummaries: generated.content.topicSummaries as unknown as Prisma.InputJsonValue,
      practiceQuestions:
        generated.content.practiceQuestions as unknown as Prisma.InputJsonValue,
      profStylePatterns:
        generated.content.profStylePatterns as unknown as Prisma.InputJsonValue,
      geminiVersion: generated.model,
      promptVersion: STUDY_PACK_VERSION,
      generatedAt: now,
      expiresAt,
    },
    update: {
      noteIds,
      topicSummaries: generated.content.topicSummaries as unknown as Prisma.InputJsonValue,
      practiceQuestions:
        generated.content.practiceQuestions as unknown as Prisma.InputJsonValue,
      profStylePatterns:
        generated.content.profStylePatterns as unknown as Prisma.InputJsonValue,
      geminiVersion: generated.model,
      generatedAt: now,
      expiresAt,
    },
  });

  return {
    status: "ready",
    pack,
    cacheHit: false,
    distributionWithinTolerance: withinTolerance,
  };
}

export async function getStudyPack(
  id: string,
  userId: string
): Promise<StudyPack | null> {
  return prisma.studyPack.findFirst({ where: { id, userId } });
}

export async function listMyStudyPacks(
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ packs: StudyPack[]; total: number; page: number; limit: number }> {
  const take = Math.min(Math.max(limit, 1), 50);
  const skip = (Math.max(page, 1) - 1) * take;
  const [packs, total] = await Promise.all([
    prisma.studyPack.findMany({
      where: { userId },
      orderBy: { generatedAt: "desc" },
      skip,
      take,
    }),
    prisma.studyPack.count({ where: { userId } }),
  ]);
  return { packs, total, page: Math.max(page, 1), limit: take };
}

// Phase 1 pattern — same kind of soft invalidation we already use for
// ProfessorStyleProfile. Called whenever a new exam lands for this
// professor so the next generate() recomputes against the new corpus.
export async function invalidateStudyPacksForProfessor(
  professorId: string
): Promise<void> {
  await prisma.studyPack.updateMany({
    where: { professorId },
    data: { expiresAt: new Date(0) },
  });
}
