import { Type } from "@google/genai";

import prisma from "../lib/prisma";
import { featureLogger } from "../lib/logger";
import { getClient } from "./llm/geminiProvider";
import { recordAICall } from "./llm/aiCallTracker";

// Phase 6 task 6.13 — "photograph a formula → find similar exam
// questions". MVP strategy (per breakdown "Açık Karar Noktaları"):
//
//   1. Ask Gemini to read the image + describe it in a normalised
//      Turkish + LaTeX form — cheap on prompt tokens, works well on
//      handwritten formulas because the vision model does the heavy
//      lifting.
//   2. Search stored exam questions with Postgres `ILIKE` across the
//      generated description + any LaTeX we extract. pg_trgm / pgvector
//      are Phase 7 work (T1 cache decision); for Phase 6 a simple
//      case-insensitive match already unlocks the UX.
//
// Returns the top-N matches across verified exams + mock-exam
// questions, dedupes by a canonical key, and attaches the professor
// for the card row on /search/multimodal.

const DEFAULT_MODEL = "gemini-2.5-flash";
const log = featureLogger("multimodalSearch");

interface DescribeResponse {
  description: string;
  keywords: string[];
  latex: string | null;
  language: string;
}

const describeSchema = {
  type: Type.OBJECT,
  properties: {
    description: { type: Type.STRING },
    keywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    latex: { type: Type.STRING },
    language: { type: Type.STRING },
  },
  required: ["description", "keywords", "language"],
  propertyOrdering: ["description", "keywords", "latex", "language"],
};

const DESCRIBE_PROMPT = `Bu görüntüdeki matematik/fizik/kimya soru ya da formülünü analiz et. JSON olarak dön:
- description: Sorunun veya formülün TÜRKÇE düz metin özeti (1-2 cümle).
- keywords: Konu/operatör/sembol anahtar kelimeleri (en az 3, en fazla 8). Örn. ["integral", "polynom kökleri", "türev"].
- latex: Görselde net bir formül varsa LaTeX (yoksa null).
- language: "tr" veya "en".

Sadece bu JSON'u döndür.`;

export interface SearchInput {
  userId: string;
  buffer: Buffer;
  mimeType: string;
  limit?: number;
}

export interface SearchResultItem {
  source: "exam-analysis" | "mock-exam";
  id: string;
  snippet: string;
  similarity: number; // 0..1 — keyword overlap heuristic for MVP
  professor?: {
    id: string;
    name: string;
    university: string;
  } | null;
  year?: number | null;
}

export interface SearchOutput {
  status: "ready" | "empty";
  description: string;
  keywords: string[];
  results: SearchResultItem[];
}

async function describeImage(
  buffer: Buffer,
  mimeType: string,
  userId: string
): Promise<DescribeResponse> {
  const client = getClient();
  const model = process.env.MULTIMODAL_SEARCH_MODEL || DEFAULT_MODEL;
  const startedAt = Date.now();

  const response = await client.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType, data: buffer.toString("base64") } },
          { text: DESCRIBE_PROMPT },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: describeSchema,
      temperature: 0.2,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Gemini returned empty describe response");
  const parsed = JSON.parse(text) as DescribeResponse;

  const usage = response.usageMetadata;
  await recordAICall({
    userId,
    feature: "multimodal-search",
    provider: "gemini",
    model,
    inputTokens: usage?.promptTokenCount ?? 0,
    outputTokens: usage?.candidatesTokenCount ?? 0,
    latencyMs: Date.now() - startedAt,
    success: true,
  });

  return parsed;
}

function keywordOverlap(keywords: string[], haystack: string): number {
  if (keywords.length === 0) return 0;
  const needle = haystack.toLowerCase();
  let hits = 0;
  for (const kw of keywords) {
    if (needle.includes(kw.toLowerCase())) hits += 1;
  }
  return hits / keywords.length;
}

async function searchExamAnalyses(
  keywords: string[],
  limit: number
): Promise<SearchResultItem[]> {
  if (keywords.length === 0) return [];
  const orClauses = keywords.map((kw) => ({
    summary: { contains: kw, mode: "insensitive" as const },
  }));

  const hits = await prisma.examAnalysis.findMany({
    where: { OR: orClauses },
    include: {
      exam: {
        include: {
          course: { include: { professor: true } },
        },
      },
    },
    take: limit * 3, // overfetch; we rescore + cap after dedupe
  });

  return hits
    .map<SearchResultItem>((h) => {
      const professor = h.exam.course.professor;
      return {
        source: "exam-analysis",
        id: h.id,
        snippet: h.summary.slice(0, 240),
        similarity: keywordOverlap(keywords, h.summary),
        professor: professor
          ? { id: professor.id, name: professor.name, university: professor.university }
          : null,
        year: h.exam.year,
      };
    })
    .filter((r) => r.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

async function searchMockExamQuestions(
  keywords: string[],
  limit: number
): Promise<SearchResultItem[]> {
  if (keywords.length === 0) return [];
  // MockExam.questions is a Json column; we do a coarse pre-filter via
  // any-keyword ILIKE against the cast-to-text form so we don't pull
  // every row into memory. A Phase 7 pgvector move replaces this
  // path with a real similarity join.
  const conditions = keywords
    .map((kw) => `questions::text ILIKE '%${kw.replace(/'/g, "''")}%'`)
    .join(" OR ");
  const candidates = await prisma.$queryRawUnsafe<
    Array<{ id: string; questions: unknown; professorId: string | null }>
  >(
    `SELECT id, questions, "professorId" FROM mock_exams WHERE ${conditions} LIMIT ${limit * 2}`
  );

  const profIds = Array.from(
    new Set(candidates.map((c) => c.professorId).filter((id): id is string => !!id))
  );
  const professors = profIds.length
    ? await prisma.professor.findMany({
        where: { id: { in: profIds } },
        select: { id: true, name: true, university: true },
      })
    : [];
  const profMap = new Map(professors.map((p) => [p.id, p]));

  return candidates
    .map<SearchResultItem>((c) => {
      const snippet = JSON.stringify(c.questions).slice(0, 240);
      return {
        source: "mock-exam",
        id: c.id,
        snippet,
        similarity: keywordOverlap(keywords, snippet),
        professor: c.professorId ? profMap.get(c.professorId) ?? null : null,
        year: null,
      };
    })
    .filter((r) => r.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

export async function searchByImage(input: SearchInput): Promise<SearchOutput> {
  const limit = Math.max(1, Math.min(input.limit ?? 10, 20));
  const described = await describeImage(input.buffer, input.mimeType, input.userId);

  const [examHits, mockHits] = await Promise.all([
    searchExamAnalyses(described.keywords, limit),
    searchMockExamQuestions(described.keywords, limit),
  ]);

  const combined = [...examHits, ...mockHits]
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  log.info(
    {
      userId: input.userId,
      keywordCount: described.keywords.length,
      resultCount: combined.length,
    },
    "multimodal search complete"
  );

  return {
    status: combined.length === 0 ? "empty" : "ready",
    description: described.description,
    keywords: described.keywords,
    results: combined,
  };
}
