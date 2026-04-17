import type { MockExam, Prisma } from "@prisma/client";

import prisma from "../lib/prisma";
import {
  MOCK_EXAM_VERSION,
  DEFAULT_MOCK_EXAM_QUESTIONS,
  DEFAULT_MOCK_EXAM_DURATION_MIN,
  MIN_MOCK_EXAM_QUESTIONS,
  MAX_MOCK_EXAM_QUESTIONS,
  MIN_MOCK_EXAM_DURATION_MIN,
  MAX_MOCK_EXAM_DURATION_MIN,
  buildSectionBreakdown,
} from "../prompts/mock-exam";
import {
  generateMockExam as callGeminiMockExam,
  type MockExamQuestion,
} from "./llm/geminiProvider";
import {
  getOrBuildStyleProfile,
  type AggregatedData,
  type TopTopic,
} from "./professorStyleService";
import { computeNoteHash, sortedIds } from "./studyPackService";

// 24h cache, matching Phase 2 study pack TTL.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
// Sentinel hash used when a mock exam is generated without any student
// notes — keeps the unique constraint happy and lets cache-by-study-material
// still work (same "empty" input → same cached exam).
const NO_NOTES_HASH = "no-study-pack";

export interface GenerateArgs {
  userId: string;
  professorId: string;
  studyPackId?: string | null;
  noteIds?: string[];
  questionCount?: number;
  durationMin?: number;
}

export type MockExamGenerateResult =
  | { status: "ready"; exam: MockExam; cacheHit: boolean }
  | {
      status: "insufficient_data";
      reason:
        | "professor_not_found"
        | "style_profile_missing"
        | "notes_not_found"
        | "study_pack_not_found";
      message: string;
    };

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export async function generateMockExam(
  args: GenerateArgs
): Promise<MockExamGenerateResult> {
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

  // Note resolution order: studyPackId → hydrate its noteIds → fall through
  // to args.noteIds → fall through to "no notes" sentinel.
  let resolvedNoteIds: string[] = [];
  if (args.studyPackId) {
    const pack = await prisma.studyPack.findFirst({
      where: { id: args.studyPackId, userId: args.userId },
      select: { noteIds: true },
    });
    if (!pack) {
      return {
        status: "insufficient_data",
        reason: "study_pack_not_found",
        message: "Seçilen çalışma paketi bulunamadı.",
      };
    }
    resolvedNoteIds = pack.noteIds;
  } else if (args.noteIds && args.noteIds.length > 0) {
    resolvedNoteIds = args.noteIds;
  }

  const noteIds = sortedIds(resolvedNoteIds);
  let noteText = "";
  let noteHash = NO_NOTES_HASH;

  if (noteIds.length > 0) {
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
    noteText = notes.map((n) => n.extractedText).join("\n\n---\n\n");
    noteHash = computeNoteHash(notes);
  }

  const questionCount = clamp(
    args.questionCount ?? DEFAULT_MOCK_EXAM_QUESTIONS,
    MIN_MOCK_EXAM_QUESTIONS,
    MAX_MOCK_EXAM_QUESTIONS
  );
  const durationMin = clamp(
    args.durationMin ?? DEFAULT_MOCK_EXAM_DURATION_MIN,
    MIN_MOCK_EXAM_DURATION_MIN,
    MAX_MOCK_EXAM_DURATION_MIN
  );

  // Fold the requested shape into the cache key — same material with a
  // different question count should produce a different cached exam.
  const cacheKeyHash = `${noteHash}:q${questionCount}:d${durationMin}`;

  const cached = await prisma.mockExam.findUnique({
    where: {
      userId_professorId_noteHash_promptVersion: {
        userId: args.userId,
        professorId: args.professorId,
        noteHash: cacheKeyHash,
        promptVersion: MOCK_EXAM_VERSION,
      },
    },
  });
  if (cached && cached.expiresAt > new Date()) {
    return { status: "ready", exam: cached, cacheHit: true };
  }

  const style = await getOrBuildStyleProfile(args.professorId);
  if (style.status === "insufficient_data") {
    return {
      status: "insufficient_data",
      reason: "style_profile_missing",
      message:
        "Bu hoca için sınav stili henüz çıkarılamadı. Önce sınav ekleyip sonra deneme sınavı üretebilirsin.",
    };
  }

  const aggregated = style.profile.aggregatedData as unknown as AggregatedData;
  const topTopics = style.profile.topTopics as unknown as TopTopic[];

  const generated = await callGeminiMockExam(
    {
      noteText,
      aggregated,
      topTopics,
      styleSummary: style.profile.geminiSummary,
      professorDepartment: professor.department,
      questionCount,
      durationMin,
    },
    { userId: args.userId }
  );

  // Gemini usually returns well-formed sections, but occasionally drops
  // one or returns gaps. Backfill with a rule-based breakdown if the model
  // output doesn't cover every question — post-gen safety net, not the
  // primary path.
  const sections =
    Array.isArray(generated.content.sections) &&
    generated.content.sections.length > 0 &&
    generated.content.sections[generated.content.sections.length - 1]?.endIdx ===
      generated.content.questions.length
      ? generated.content.sections
      : buildSectionBreakdown(generated.content.questions.length);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + CACHE_TTL_MS);

  const exam = await prisma.mockExam.upsert({
    where: {
      userId_professorId_noteHash_promptVersion: {
        userId: args.userId,
        professorId: args.professorId,
        noteHash: cacheKeyHash,
        promptVersion: MOCK_EXAM_VERSION,
      },
    },
    create: {
      userId: args.userId,
      professorId: args.professorId,
      studyPackId: args.studyPackId ?? null,
      noteIds,
      noteHash: cacheKeyHash,
      title: generated.content.title,
      questions: generated.content.questions as unknown as Prisma.InputJsonValue,
      durationMin: generated.durationMin,
      sectionBreakdown: sections as unknown as Prisma.InputJsonValue,
      geminiVersion: generated.model,
      promptVersion: MOCK_EXAM_VERSION,
      generatedAt: now,
      expiresAt,
    },
    update: {
      studyPackId: args.studyPackId ?? null,
      noteIds,
      title: generated.content.title,
      questions: generated.content.questions as unknown as Prisma.InputJsonValue,
      durationMin: generated.durationMin,
      sectionBreakdown: sections as unknown as Prisma.InputJsonValue,
      geminiVersion: generated.model,
      generatedAt: now,
      expiresAt,
    },
  });

  return { status: "ready", exam, cacheHit: false };
}

export async function getMockExam(
  id: string,
  userId: string
): Promise<MockExam | null> {
  return prisma.mockExam.findFirst({ where: { id, userId } });
}

// Client-facing shape strips correctAnswer + rubric — they live in the
// persisted JSON but must not leak while a session is still open.
export interface ClientMockExamQuestion {
  q: string;
  type: MockExamQuestion["type"];
  options?: string[];
  topic: string;
  difficulty: number;
}

export function sanitizeQuestionsForClient(
  questions: MockExamQuestion[]
): ClientMockExamQuestion[] {
  return questions.map((q) => ({
    q: q.q,
    type: q.type,
    options: q.options && q.options.length > 0 ? q.options : undefined,
    topic: q.topic,
    difficulty: q.difficulty,
  }));
}

// Phase 1/2 pattern — examController invalidation hook calls this when a
// new exam is uploaded for a professor. Soft-invalidate by pushing
// expiresAt into the past so the next generate() recomputes.
export async function invalidateMockExamsForProfessor(
  professorId: string
): Promise<void> {
  await prisma.mockExam.updateMany({
    where: { professorId },
    data: { expiresAt: new Date(0) },
  });
}
