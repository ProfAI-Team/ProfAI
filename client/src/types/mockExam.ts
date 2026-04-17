// Mirrors the server's sanitised MockExam question shape — no
// correctAnswer, no rationale, no rubric while a session is open.
export type QuestionTypeCode = "MC" | "CLASSIC" | "TF";

export interface MockExamClientQuestion {
  q: string;
  type: QuestionTypeCode;
  options?: string[];
  topic: string;
  difficulty: number;
}

export interface SectionBreakdown {
  title: string;
  startIdx: number;
  endIdx: number;
}

export interface MockExam {
  id: string;
  userId: string;
  professorId: string;
  studyPackId: string | null;
  noteIds: string[];
  title: string;
  questions: MockExamClientQuestion[];
  durationMin: number;
  sectionBreakdown: SectionBreakdown[] | null;
  geminiVersion: string;
  promptVersion: string;
  generatedAt: string;
  expiresAt: string;
}

export type MockExamGenerateResponse =
  | {
      status: "ready";
      cacheHit: boolean;
      exam: MockExam;
    }
  | {
      status: "insufficient_data";
      reason:
        | "professor_not_found"
        | "style_profile_missing"
        | "notes_not_found"
        | "study_pack_not_found";
      message: string;
    };

export interface StudentAnswer {
  qIdx: number;
  answer: string;
  timeSpentSec?: number;
  flagged?: boolean;
}

export interface QuestionFeedback {
  qIdx: number;
  correct: boolean;
  scoreOutOf100: number;
  feedback: string;
  suggestedTopic?: string;
  rubricHits?: { criterion: string; met: boolean }[];
}

export interface SectionScore {
  title: string;
  startIdx: number;
  endIdx: number;
  avgScore: number;
  questionCount: number;
}

export interface PredictionBand {
  lowerBound: number;
  upperBound: number;
  confidence: "low" | "medium" | "high";
  reasoning: string;
  disclaimer: string;
}

export interface TopicGap {
  topic: string;
  correctCount: number;
  totalCount: number;
  accuracy: number;
  avgDifficulty: number;
  priority: number;
}

export interface MockExamSubmitResponse {
  sessionId: string;
  score: number;
  sections: SectionScore[];
  feedback: QuestionFeedback[];
  prediction: PredictionBand;
  topicGaps: TopicGap[];
}

export interface MockExamResultResponse {
  session: {
    id: string;
    score: number | null;
    startedAt: string;
    completedAt: string | null;
    timeSpentSec: number | null;
    autoSubmitted: boolean;
    feedback: QuestionFeedback[] | null;
    prediction: PredictionBand | null;
    topicGaps: TopicGap[] | null;
  };
  exam: MockExam;
}

export interface PanicPlanStep {
  topic: string;
  minutes: number;
  reason: string;
  suggestion: string;
}

export interface PanicPlanResponse {
  totalMinutes: number;
  hoursUntilExam: number;
  steps: PanicPlanStep[];
  advice: string[];
}
