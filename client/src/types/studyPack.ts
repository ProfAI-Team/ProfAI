// Shape returned by POST /api/notes/upload (per-file).
export interface UploadedNote {
  id: string;
  title: string;
  wordCount: number;
  fileUrl: string;
  warning?: "insufficient_content";
}

export interface NoteUploadError {
  originalName: string;
  error: "EXTRACTION_UNSUPPORTED" | "EXTRACTION_FAILED" | "DB_FAILED";
  message: string;
}

export interface NoteUploadResponse {
  notes: UploadedNote[];
  errors: NoteUploadError[];
}

// Row returned by GET /api/notes/mine.
export interface StudentNoteSummary {
  id: string;
  title: string;
  courseId: string | null;
  fileUrl: string;
  mimeType: string;
  wordCount: number;
  createdAt: string;
}

// Matches StudyPack Prisma row + Gemini content shape.
export type QuestionTypeCode = "MC" | "CLASSIC" | "TF";

export interface TopicSummary {
  topic: string;
  content: string; // markdown
}

export interface PracticeQuestion {
  question: string;
  type: QuestionTypeCode;
  topic: string;
  difficulty: number;
  answer: string;
  rationale: string;
}

export interface StudyPack {
  id: string;
  userId: string;
  professorId: string;
  noteIds: string[];
  noteHash: string;
  topicSummaries: TopicSummary[];
  practiceQuestions: PracticeQuestion[];
  profStylePatterns: string[];
  geminiVersion: string;
  promptVersion: string;
  generatedAt: string;
  expiresAt: string;
}

// POST /api/study-pack/generate response union.
export type StudyPackGenerateResponse =
  | {
      status: "ready";
      cacheHit: boolean;
      distributionWithinTolerance: boolean;
      pack: StudyPack;
    }
  | {
      status: "insufficient_data";
      reason:
        | "no_notes"
        | "notes_not_found"
        | "professor_not_found"
        | "style_profile_missing";
      message: string;
    };

export interface StudyPackListResponse {
  packs: StudyPack[];
  total: number;
  page: number;
  limit: number;
}
