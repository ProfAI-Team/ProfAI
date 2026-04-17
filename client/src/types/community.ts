export interface CreditBalance {
  balance: number;
  updatedAt: string;
}

export interface CreditHistoryEntry {
  type: "earn" | "spend";
  amount: number;
  reason: string;
  refId?: string;
  at: string;
}

export interface CreditHistory {
  total: number;
  entries: CreditHistoryEntry[];
}

export interface ApprovalOutcome {
  exam: {
    id: string;
    verified: boolean;
    flagged: boolean;
    verifiedAt: string | null;
  };
  approvalCount: number;
  rejectionCount: number;
  justVerified: boolean;
  justFlagged: boolean;
}

export interface PendingExam {
  id: string;
  year: number;
  semester: string;
  examType: string;
  createdAt: string;
  verified: boolean;
  flagged: boolean;
  course: { id: string; name: string; code: string };
  professor: { id: string; name: string };
}

export interface PendingExamList {
  total: number;
  exams: PendingExam[];
}

export interface QuestionVoteStats {
  direction: -1 | 0 | 1;
  upvotes: number;
  downvotes: number;
  cameOnExamCount: number;
  verified: boolean;
  myVote?: { direction: -1 | 0 | 1; cameOnExam: boolean | null } | null;
}

export interface VerifiedPoolEntry {
  questionId: string;
  upvotes: number;
  downvotes: number;
  net: number;
  cameOnExamCount: number;
}

export interface VerifiedPool {
  total: number;
  questions: VerifiedPoolEntry[];
}

export type TopicFrequency = "once" | "few" | "many";

export interface ReportedTopic {
  topic: string;
  frequency: TopicFrequency;
  difficulty: number;
}

export interface PostExamReportInput {
  professorId: string;
  courseId?: string | null;
  examDate: string;
  reportedTopics: ReportedTopic[];
  notes?: string | null;
  selfReportedGrade?: number | null;
  selfReportedLetter?: string | null;
}

export interface PostExamReportResult {
  reportId: string;
  isNew: boolean;
  balance: number | null;
}

export type AggregatedReportResponse =
  | { status: "insufficient"; count: number; threshold: number }
  | {
      status: "ready";
      count: number;
      windowStart: string;
      windowEnd: string;
      topics: Array<{
        topic: string;
        reportedCount: number;
        frequencyMode: TopicFrequency;
        medianDifficulty: number;
      }>;
    };

export type HighPerformerStrategyResponse =
  | { status: "insufficient"; count: number; threshold: number }
  | {
      status: "ready";
      count: number;
      topics: Array<{
        topic: string;
        coveragePct: number;
        dominantFrequency: TopicFrequency;
      }>;
    };

export interface StudyGroupSummary {
  id: string;
  professorId: string;
  courseId: string | null;
  examDate: string | null;
  externalLink: string | null;
  status: "SUGGESTED" | "ACTIVE" | "CLOSED";
  memberCount: number;
}

export interface StudyGroupSuggestion {
  id: string;
  courseId: string | null;
  examDate: string | null;
  memberCount: number;
  status: "SUGGESTED" | "ACTIVE" | "CLOSED";
}

export interface MatchmakingResult {
  group: {
    id: string;
    status: "SUGGESTED" | "ACTIVE" | "CLOSED";
    memberCount: number;
  };
  action: "joined_existing" | "created" | "promoted";
}
