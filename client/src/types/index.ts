export interface User {
  id: string;
  name: string;
  email: string;
  university: string | null;
  department: string | null;
  createdAt?: string;
}

export interface Professor {
  id: string;
  name: string;
  department: string;
  university: string;
  createdAt: string;
  _count?: {
    courses: number;
    ratings: number;
  };
  courses?: Course[];
  ratings?: ProfessorRating[];
  averageDifficulty?: number;
  averageFairness?: number;
  totalRatings?: number;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  professorId: string;
  professor?: Professor;
  createdAt: string;
  _count?: {
    exams: number;
  };
}

export interface Exam {
  id: string;
  courseId: string;
  course?: Course;
  examType: 'MIDTERM' | 'FINAL' | 'MAKEUP';
  year: number;
  semester: string;
  fileUrl: string;
  uploadedById: string;
  uploadedBy?: { id: string; name: string };
  createdAt: string;
  analysis?: ExamAnalysisRaw;
}

export interface ExamAnalysisRaw {
  id: string;
  examId: string;
  questionCount: number;
  questionTypes: Record<string, number>;
  topicDistribution: Record<string, number>;
  difficultyScore: number;
  summary: string;
  createdAt: string;
}

export interface QuestionType {
  type: string;
  percentage: number;
}

export interface TopicDistribution {
  topic: string;
  frequency: number;
}

export interface ExamAnalysis {
  id: string;
  questionCount: number;
  questionTypes: QuestionType[];
  topicDistribution: TopicDistribution[];
  difficultyScore: number;
  summary: string;
}

export interface ProfessorAnalysis {
  totalExamsAnalyzed: number;
  averageDifficultyScore: number;
  averageQuestionCount: number;
  averageQuestionTypes: Record<string, number>;
  topTopics: { topic: string; averagePercentage: number; frequency: number }[];
}

export interface ProfessorRating {
  id: string;
  professorId: string;
  userId: string;
  difficultyScore: number;
  fairnessScore: number;
  comment: string | null;
  createdAt: string;
  user?: { id: string; name: string };
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string>;
}
