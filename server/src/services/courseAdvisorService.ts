import prisma from "../lib/prisma";
import { getDNA } from "./dnaService";
import { getOrBuildStyleProfile } from "./professorStyleService";

/**
 * Course compatibility scoring — "how well does this professor's style
 * line up with what I've been good at?". Deterministic rule-based
 * formula; no Gemini call. The scoring weights are intentionally
 * transparent so the `reasons[]` output can explain each contribution
 * to the student (advisor is gated behind premium in 5.14 but the
 * service itself is free-standing).
 *
 * Weights (out of 100):
 *   - Style match: 30
 *   - Difficulty match: 20
 *   - Topic overlap: up to 50
 *
 * Insufficient when: user has no AcademicDNA or totalQuestionsAnswered
 * < MIN_DNA_QUESTIONS, or the professor's style profile hasn't reached
 * the 3-analyzed-exams threshold (returned as status: "insufficient").
 */

export const MIN_DNA_QUESTIONS = 40; // ~a semester of mock exams
export const MAX_TOPIC_OVERLAP_POINTS = 50;
export const TOPIC_OVERLAP_PER_MATCH = 10;

export type AdvisorStatus =
  | "ready"
  | "insufficient_dna"
  | "insufficient_professor";

export interface CompatibilityResult {
  status: AdvisorStatus;
  score: number; // 0-100
  reasons: string[];
  warnings: string[];
  professor: { id: string; name: string };
  dnaQuestionCount: number;
  professorExamCount: number;
}

type LearningStyle = string | null;

/**
 * Map the professor's dominant question type to the closest learning
 * style bucket we can infer from. Null when no dominance signal.
 */
function dominantTypeToStyle(
  dominantType: string | null | undefined
): LearningStyle {
  switch (dominantType) {
    case "Multiple Choice":
    case "True/False":
      return "reading";
    case "Classic/Open-ended":
      return "kinesthetic";
    default:
      return null;
  }
}

function bucketDifficulty(score: number | null | undefined): string | null {
  if (typeof score !== "number") return null;
  if (score <= 2.5) return "easy";
  if (score <= 3.5) return "medium";
  return "hard";
}

/**
 * Pure scoring function — unit-testable without touching the DB.
 */
export function scoreCompatibility(params: {
  userLearningStyle: LearningStyle;
  professorDominantType: string | null;
  userPreferredDifficulty: string | null;
  professorDifficultyBucket: string | null;
  userStrengthTopics: string[];
  professorTopTopics: string[];
}): { score: number; reasons: string[]; warnings: string[] } {
  const reasons: string[] = [];
  const warnings: string[] = [];
  let score = 0;

  const profStyle = dominantTypeToStyle(params.professorDominantType);
  if (
    params.userLearningStyle &&
    profStyle &&
    (params.userLearningStyle === profStyle ||
      params.userLearningStyle === "mixed")
  ) {
    score += 30;
    reasons.push("style-match");
  } else if (params.userLearningStyle && profStyle) {
    warnings.push("style-mismatch");
  }

  if (
    params.userPreferredDifficulty &&
    params.professorDifficultyBucket &&
    params.userPreferredDifficulty === params.professorDifficultyBucket
  ) {
    score += 20;
    reasons.push("difficulty-match");
  } else if (params.professorDifficultyBucket === "hard") {
    warnings.push("difficulty-hard");
  }

  if (params.userStrengthTopics.length > 0) {
    const strengthSet = new Set(
      params.userStrengthTopics.map((t) => t.toLowerCase())
    );
    const overlaps = params.professorTopTopics.filter((t) =>
      strengthSet.has(t.toLowerCase())
    );
    const overlapPoints = Math.min(
      MAX_TOPIC_OVERLAP_POINTS,
      overlaps.length * TOPIC_OVERLAP_PER_MATCH
    );
    score += overlapPoints;
    if (overlaps.length > 0) {
      reasons.push(`topic-overlap:${overlaps.length}`);
    } else {
      warnings.push("no-topic-overlap");
    }
  } else {
    warnings.push("no-strengths");
  }

  return { score: Math.min(100, Math.round(score)), reasons, warnings };
}

export async function getCompatibility(params: {
  userId: string;
  professorId: string;
}): Promise<CompatibilityResult> {
  const professor = await prisma.professor.findUnique({
    where: { id: params.professorId },
    select: { id: true, name: true },
  });
  if (!professor) {
    throw new Error("Professor not found.");
  }

  const [dnaResult, styleResult] = await Promise.all([
    getDNA(params.userId),
    getOrBuildStyleProfile(params.professorId),
  ]);

  // DNA insufficient: either user has no record or fewer than 40
  // questions answered (MIN_DNA_QUESTIONS). We return a distinct status
  // so the UI can nudge them toward more mock exams.
  if (dnaResult.status !== "ready") {
    return {
      status: "insufficient_dna",
      score: 0,
      reasons: [],
      warnings: ["dna-insufficient"],
      professor,
      dnaQuestionCount: dnaResult.status === "insufficient" ? dnaResult.count : 0,
      professorExamCount:
        styleResult.status === "insufficient_data"
          ? styleResult.examSourceCount
          : styleResult.status === "ready"
          ? styleResult.profile.examSourceCount
          : 0,
    };
  }

  if (dnaResult.dna.totalQuestionsAnswered < MIN_DNA_QUESTIONS) {
    return {
      status: "insufficient_dna",
      score: 0,
      reasons: [],
      warnings: ["dna-insufficient"],
      professor,
      dnaQuestionCount: dnaResult.dna.totalQuestionsAnswered,
      professorExamCount:
        styleResult.status === "ready"
          ? styleResult.profile.examSourceCount
          : 0,
    };
  }

  if (styleResult.status !== "ready") {
    return {
      status: "insufficient_professor",
      score: 0,
      reasons: [],
      warnings: ["professor-insufficient"],
      professor,
      dnaQuestionCount: dnaResult.dna.totalQuestionsAnswered,
      professorExamCount:
        styleResult.status === "insufficient_data"
          ? styleResult.examSourceCount
          : 0,
    };
  }

  const profileMetrics = styleResult.profile.metrics;
  const scored = scoreCompatibility({
    userLearningStyle: dnaResult.dna.learningStyle,
    professorDominantType: profileMetrics.dominantType ?? null,
    userPreferredDifficulty: dnaResult.dna.preferredDifficulty,
    professorDifficultyBucket: bucketDifficulty(profileMetrics.avgDifficulty),
    userStrengthTopics: dnaResult.dna.strengths.map((s) => s.topic),
    professorTopTopics: styleResult.profile.topTopics.map((t) => t.topic),
  });

  return {
    status: "ready",
    score: scored.score,
    reasons: scored.reasons,
    warnings: scored.warnings,
    professor,
    dnaQuestionCount: dnaResult.dna.totalQuestionsAnswered,
    professorExamCount: styleResult.profile.examSourceCount,
  };
}
