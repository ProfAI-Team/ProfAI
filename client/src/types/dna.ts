// Phase 5 — DNA / confidence / grades / advisor / spaced-rep shapes.
// Mirrored from server/src/services/*.ts return types; changes there
// should sync here.

export interface DNAScoredTopic {
  topic: string;
  score: number; // 0-100
  confidence: number; // 0-1
  sampleSize: number;
}

export interface AcademicDNAResult {
  userId: string;
  learningStyle: string | null;
  strengths: DNAScoredTopic[];
  weaknesses: DNAScoredTopic[];
  totalQuestionsAnswered: number;
  correctRate: number | null;
  preferredDifficulty: string | null;
  version: number;
  lastComputedAt: string;
}

export type DNAResponse =
  | { status: 'insufficient'; count: number; minRequired: number }
  | { status: 'ready'; dna: AcademicDNAResult };

export interface ConfidenceEntry {
  topic: string;
  score: number;
  source: string;
  lastQuestionCount: number;
  updatedAt: string;
}

export interface GradeRecord {
  id: string;
  userId: string;
  courseId: string | null;
  courseName: string;
  grade: number;
  letterGrade: string | null;
  credit: number;
  semester: string;
  university: string | null;
  createdAt: string;
}

export type UniversityKey = 'aydin' | 'bogazici' | 'odtu';

export interface GpaResult {
  gpa: number | null;
  totalCredits: number;
  formulaKey: UniversityKey;
}

export interface GpaSimulationResult {
  gpa: number | null;
  totalCredits: number;
}

export interface WhatIfResult {
  minimumGrade: number | null;
  achievable: boolean;
}

export interface CompatibilityResult {
  status: 'ready' | 'insufficient_dna' | 'insufficient_professor';
  score: number;
  reasons: string[];
  warnings: string[];
  professor: { id: string; name: string };
  dnaQuestionCount: number;
  professorExamCount: number;
}

export interface SpacedRepetitionReview {
  id: string;
  questionId: string;
  questionText: string | null;
  nextReview: string;
  interval: number;
  correctStreak: number;
  lapseCount: number;
}

export interface SM2Result {
  interval: number;
  easiness: number;
  correctStreak: number;
  lapseCount: number;
  nextReview: string;
}

export interface ReconstructResult {
  status: 'insufficient' | 'ready';
  count?: number;
  threshold?: number;
  summary?: string;
  source?: 'gemini' | 'fallback';
  basedOnReports?: number;
}

export type LearningStyle =
  | 'reading'
  | 'kinesthetic'
  | 'visual'
  | 'auditory'
  | 'mixed'
  | null;
