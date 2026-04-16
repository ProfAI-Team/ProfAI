import type { ExamAnalysis, ProfessorStyleProfile } from "@prisma/client";

import prisma from "../lib/prisma";
import { generateStyleSummary } from "./llm/geminiProvider";
import { STYLE_SUMMARY_VERSION } from "../prompts/style-summary";

// ExamAnalysis JSON shapes (authored on write via analysisService).
// Keys are preserved as-is across the codebase.
export interface QuestionTypeCounts {
  "Multiple Choice": number;
  "Classic/Open-ended": number;
  "True/False": number;
}

export type TopicDistribution = Record<string, number>;

export interface AggregatedData {
  questionTypes: QuestionTypeCounts;
  topicDistribution: TopicDistribution;
  difficulty: number;
}

export interface TopTopic {
  topic: string;
  frequency: number;
}

export interface EvolutionPoint {
  year: number;
  questionTypes: QuestionTypeCounts;
  difficulty: number;
  examCount: number;
}

export interface StyleMetrics {
  totalExams: number;
  avgDifficulty: number;
  avgQuestionCount: number;
  dominantType: keyof QuestionTypeCounts | null;
}

export interface AggregationResult {
  aggregated: AggregatedData;
  topTopics: TopTopic[];
  evolution: EvolutionPoint[];
  metrics: StyleMetrics;
  examSourceCount: number;
}

export type StyleProfileResponse =
  | { status: "ready"; profile: ProfessorStyleProfile }
  | { status: "insufficient_data"; examSourceCount: number };

// Minimum exams required to produce a meaningful style profile.
const MIN_EXAMS_FOR_PROFILE = 3;

// Maximum topics surfaced in the "Top topics" section of the UI.
const TOP_TOPIC_LIMIT = 10;

// If a regeneration flag is older than this, treat it as abandoned and retry.
const REGENERATION_STALE_AFTER_MS = 5 * 60 * 1000; // 5 minutes

// Fallback copy when Gemini fails — the profile still persists so the UI
// has data to render; isStale remains true so the next request retries.
const FALLBACK_SUMMARY =
  "Hoca tarzı özeti şu an üretilemedi. Biraz sonra tekrar denenecek.";
const FALLBACK_VERSION = "fallback-v0";

type ExamWithAnalysis = {
  id: string;
  year: number;
  analysis: ExamAnalysis | null;
};

// Weighted by questionCount so a 30-question exam counts 3× a 10-question one.
function aggregateQuestionTypes(
  analyses: ExamAnalysis[]
): QuestionTypeCounts {
  const totals: QuestionTypeCounts = {
    "Multiple Choice": 0,
    "Classic/Open-ended": 0,
    "True/False": 0,
  };
  let totalWeight = 0;

  for (const a of analyses) {
    const weight = a.questionCount ?? 1;
    const types = a.questionTypes as unknown as Partial<QuestionTypeCounts>;
    totals["Multiple Choice"] += (types["Multiple Choice"] ?? 0) * weight;
    totals["Classic/Open-ended"] += (types["Classic/Open-ended"] ?? 0) * weight;
    totals["True/False"] += (types["True/False"] ?? 0) * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return totals;

  return {
    "Multiple Choice": roundPct(totals["Multiple Choice"] / totalWeight),
    "Classic/Open-ended": roundPct(totals["Classic/Open-ended"] / totalWeight),
    "True/False": roundPct(totals["True/False"] / totalWeight),
  };
}

function aggregateTopics(analyses: ExamAnalysis[]): TopicDistribution {
  const totals: TopicDistribution = {};
  let totalWeight = 0;

  for (const a of analyses) {
    const weight = a.questionCount ?? 1;
    const dist = a.topicDistribution as unknown as TopicDistribution;
    for (const [topic, pct] of Object.entries(dist)) {
      totals[topic] = (totals[topic] ?? 0) + pct * weight;
    }
    totalWeight += weight;
  }

  if (totalWeight === 0) return totals;

  const normalized: TopicDistribution = {};
  for (const [topic, weighted] of Object.entries(totals)) {
    normalized[topic] = roundPct(weighted / totalWeight);
  }
  return normalized;
}

function averageDifficulty(analyses: ExamAnalysis[]): number {
  if (analyses.length === 0) return 0;
  const sum = analyses.reduce((acc, a) => acc + a.difficultyScore, 0);
  return round1(sum / analyses.length);
}

function averageQuestionCount(analyses: ExamAnalysis[]): number {
  if (analyses.length === 0) return 0;
  const sum = analyses.reduce((acc, a) => acc + a.questionCount, 0);
  return Math.round(sum / analyses.length);
}

function dominantType(types: QuestionTypeCounts): keyof QuestionTypeCounts | null {
  const entries = Object.entries(types) as [keyof QuestionTypeCounts, number][];
  const [topKey, topVal] = entries.reduce(
    (best, curr) => (curr[1] > best[1] ? curr : best),
    entries[0]
  );
  return topVal > 0 ? topKey : null;
}

function topTopics(dist: TopicDistribution, limit = TOP_TOPIC_LIMIT): TopTopic[] {
  return Object.entries(dist)
    .map(([topic, frequency]) => ({ topic, frequency }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, limit);
}

function buildEvolution(exams: ExamWithAnalysis[]): EvolutionPoint[] {
  const byYear = new Map<number, ExamAnalysis[]>();
  for (const e of exams) {
    if (!e.analysis) continue;
    const bucket = byYear.get(e.year) ?? [];
    bucket.push(e.analysis);
    byYear.set(e.year, bucket);
  }

  const points: EvolutionPoint[] = [];
  for (const [year, analyses] of byYear) {
    points.push({
      year,
      questionTypes: aggregateQuestionTypes(analyses),
      difficulty: averageDifficulty(analyses),
      examCount: analyses.length,
    });
  }
  return points.sort((a, b) => a.year - b.year);
}

function roundPct(value: number): number {
  return Math.round(value * 10) / 10;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Pure aggregation — reads the professor's exams + analyses and computes a
 * StyleProfile-shaped payload. No DB writes, no Gemini calls.
 *
 * Returns null when there are no analyzed exams.
 */
export async function aggregateFromExams(
  professorId: string
): Promise<AggregationResult | null> {
  const exams = await prisma.exam.findMany({
    where: { course: { professorId } },
    select: {
      id: true,
      year: true,
      analysis: true,
    },
  });

  const analyses = exams
    .map((e) => e.analysis)
    .filter((a): a is ExamAnalysis => a !== null);

  if (analyses.length === 0) return null;

  const questionTypes = aggregateQuestionTypes(analyses);
  const topicDistribution = aggregateTopics(analyses);
  const difficulty = averageDifficulty(analyses);

  return {
    aggregated: { questionTypes, topicDistribution, difficulty },
    topTopics: topTopics(topicDistribution),
    evolution: buildEvolution(exams),
    metrics: {
      totalExams: analyses.length,
      avgDifficulty: difficulty,
      avgQuestionCount: averageQuestionCount(analyses),
      dominantType: dominantType(questionTypes),
    },
    examSourceCount: analyses.length,
  };
}

function isRegenerationInFlight(profile: ProfessorStyleProfile): boolean {
  if (!profile.regenerationStartedAt) return false;
  const age = Date.now() - profile.regenerationStartedAt.getTime();
  return age < REGENERATION_STALE_AFTER_MS;
}

async function tryAcquireRegenerationLock(
  professorId: string
): Promise<boolean> {
  const staleBefore = new Date(Date.now() - REGENERATION_STALE_AFTER_MS);
  const result = await prisma.professorStyleProfile.updateMany({
    where: {
      professorId,
      OR: [
        { regenerationStartedAt: null },
        { regenerationStartedAt: { lt: staleBefore } },
      ],
    },
    data: { regenerationStartedAt: new Date() },
  });
  return result.count > 0;
}

async function buildAndPersist(
  professorId: string,
  result: AggregationResult
): Promise<ProfessorStyleProfile> {
  let summary: string;
  let version: string;
  let isStale: boolean;

  if (!process.env.GEMINI_API_KEY) {
    console.warn(
      "[professorStyleService] GEMINI_API_KEY not set — using fallback summary."
    );
    summary = FALLBACK_SUMMARY;
    version = FALLBACK_VERSION;
    isStale = true; // retry next request
  } else {
    try {
      const generated = await generateStyleSummary({
        aggregated: result.aggregated,
        topTopics: result.topTopics,
        evolution: result.evolution,
        metrics: result.metrics,
      });
      summary = generated.text;
      version = `${STYLE_SUMMARY_VERSION}:${generated.model}`;
      isStale = false;
    } catch (error) {
      console.error(
        "[professorStyleService] Gemini summary failed, persisting fallback:",
        error instanceof Error ? error.message : error
      );
      summary = FALLBACK_SUMMARY;
      version = FALLBACK_VERSION;
      isStale = true; // UI can show fallback text; next call will retry
    }
  }

  const data = {
    aggregatedData: result.aggregated as object,
    geminiSummary: summary,
    topTopics: result.topTopics as object,
    evolution: result.evolution as object,
    metrics: result.metrics as object,
    examSourceCount: result.examSourceCount,
    geminiVersion: version,
    isStale,
    regenerationStartedAt: null,
    generatedAt: new Date(),
  };

  return prisma.professorStyleProfile.upsert({
    where: { professorId },
    create: { professorId, ...data },
    update: data,
  });
}

/**
 * Fetches the cached style profile if fresh; otherwise rebuilds it lazily.
 *
 * Concurrency: uses `regenerationStartedAt` as a soft advisory lock.
 * - A request that finds an in-flight regeneration returns the current
 *   (stale) cache rather than duplicating the rebuild work.
 * - If the flag is older than REGENERATION_STALE_AFTER_MS we assume the
 *   previous attempt died and retry.
 *
 * Returns `insufficient_data` if the professor has fewer than
 * MIN_EXAMS_FOR_PROFILE analyzed exams — the UI will render an empty state.
 */
export async function getOrBuildStyleProfile(
  professorId: string
): Promise<StyleProfileResponse> {
  const cached = await prisma.professorStyleProfile.findUnique({
    where: { professorId },
  });

  if (cached && !cached.isStale) {
    return { status: "ready", profile: cached };
  }

  if (cached && isRegenerationInFlight(cached)) {
    // Another worker is rebuilding — serve the current (stale) cache.
    return { status: "ready", profile: cached };
  }

  const aggregation = await aggregateFromExams(professorId);
  if (!aggregation || aggregation.examSourceCount < MIN_EXAMS_FOR_PROFILE) {
    return {
      status: "insufficient_data",
      examSourceCount: aggregation?.examSourceCount ?? 0,
    };
  }

  if (cached) {
    const gotLock = await tryAcquireRegenerationLock(professorId);
    if (!gotLock) {
      // Someone else beat us to the lock; return their (soon-to-be-fresh) data.
      const current = await prisma.professorStyleProfile.findUnique({
        where: { professorId },
      });
      return { status: "ready", profile: current ?? cached };
    }
  }

  const profile = await buildAndPersist(professorId, aggregation);
  return { status: "ready", profile };
}

/**
 * Marks a professor's cached style profile as stale so the next
 * `getOrBuildStyleProfile` call rebuilds it. Called by analysisService
 * whenever a new exam analysis lands (Task 1.5).
 */
export async function invalidateStyleProfile(
  professorId: string
): Promise<void> {
  await prisma.professorStyleProfile.updateMany({
    where: { professorId },
    data: { isStale: true },
  });
}
