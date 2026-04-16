import api from './api';
import { Professor, ProfessorAnalysis, ExamAnalysis } from '../types';

function transformAnalysis(raw: any): ExamAnalysis {
  const questionTypes = Object.entries(raw.averageQuestionTypes || {}).map(
    ([type, percentage]) => ({ type, percentage: percentage as number })
  );
  const topicDistribution = (raw.topTopics || []).map((t: any) => ({
    topic: t.topic,
    frequency: t.averagePercentage,
  }));
  return {
    id: 'aggregated',
    questionCount: raw.averageQuestionCount || 0,
    questionTypes,
    topicDistribution,
    difficultyScore: raw.averageDifficultyScore || 0,
    summary: `Based on ${raw.totalExamsAnalyzed} exams analyzed. Average difficulty: ${(raw.averageDifficultyScore || 0).toFixed(1)}/10 with an average of ${raw.averageQuestionCount || 0} questions per exam.`,
  };
}

export const professorService = {
  async getAll(params?: {
    search?: string;
    department?: string;
    university?: string;
    limit?: number;
    page?: number;
  }): Promise<Professor[]> {
    const res = await api.get('/professors', {
      params: { limit: 100, ...params },
    });
    return res.data.professors || [];
  },

  async getPaged(params?: {
    search?: string;
    department?: string;
    university?: string;
    city?: string;
    sort?: string;
    limit?: number;
    page?: number;
  }): Promise<{ professors: Professor[]; total: number; page: number; totalPages: number }> {
    const res = await api.get('/professors', {
      params: { limit: 30, ...params },
    });
    const { professors = [], pagination = {} } = res.data;
    return {
      professors,
      total: pagination.total || professors.length,
      page: pagination.page || 1,
      totalPages: pagination.totalPages || 1,
    };
  },

  async getFilterOptions(): Promise<{
    universities: Array<{ name: string; count: number; city: string | null }>;
    departments: Array<{ name: string; count: number }>;
    cities: Array<{ name: string; count: number }>;
  }> {
    const res = await api.get('/professors/filters');
    // Backward compat: old API returned plain string arrays
    const normalize = (arr: any[]) =>
      arr.map((item) => (typeof item === 'string' ? { name: item, count: 0 } : item));
    return {
      universities: normalize(res.data.universities || []),
      departments: normalize(res.data.departments || []),
      cities: res.data.cities || [],
    };
  },

  async getDiscovery(university?: string): Promise<{
    topRated: Professor[];
    byUserUni: Professor[];
  }> {
    const res = await api.get('/professors/discovery', {
      params: university ? { university } : undefined,
    });
    return {
      topRated: res.data.topRated || [],
      byUserUni: res.data.byUserUni || [],
    };
  },

  async getById(id: string): Promise<Professor> {
    const res = await api.get(`/professors/${id}`);
    const { professor, averageRatings } = res.data;
    return {
      ...professor,
      averageDifficulty: averageRatings?.difficulty || 0,
      averageFairness: averageRatings?.fairness || 0,
      totalRatings: averageRatings?.totalRatings || 0,
    };
  },

  async create(data: {
    name: string;
    department: string;
    university: string;
  }): Promise<Professor> {
    const res = await api.post('/professors', data);
    return res.data.professor;
  },

  async getAnalysis(id: string): Promise<ExamAnalysis[]> {
    const res = await api.get(`/professors/${id}/analysis`);
    if (!res.data.analysis) return [];
    return [transformAnalysis(res.data.analysis)];
  },

  async getStyleProfile(id: string): Promise<StyleProfileResponse> {
    const res = await api.get(`/professors/${id}/style-profile`);
    return res.data;
  },
};

// Shape of GET /api/professors/:id/style-profile — Phase 1.
export interface StyleProfileProfessor {
  id: string;
  name: string;
  department: string;
  university: string;
}

export interface StyleProfileTopTopic {
  topic: string;
  frequency: number;
}

export interface StyleProfileEvolutionPoint {
  year: number;
  questionTypes: {
    'Multiple Choice': number;
    'Classic/Open-ended': number;
    'True/False': number;
  };
  difficulty: number;
  examCount: number;
}

export interface StyleProfileMetrics {
  totalExams: number;
  avgDifficulty: number;
  avgQuestionCount: number;
  dominantType: 'Multiple Choice' | 'Classic/Open-ended' | 'True/False' | null;
}

export interface StyleProfileReady {
  status: 'ready';
  professor: StyleProfileProfessor;
  profile: {
    aggregated: {
      questionTypes: StyleProfileEvolutionPoint['questionTypes'];
      topicDistribution: Record<string, number>;
      difficulty: number;
    };
    topTopics: StyleProfileTopTopic[];
    evolution: StyleProfileEvolutionPoint[];
    metrics: StyleProfileMetrics;
    styleSummary: string;
    examSourceCount: number;
    isStale: boolean;
    geminiVersion: string;
    generatedAt: string;
  };
}

export interface StyleProfileInsufficient {
  status: 'insufficient_data';
  professor: StyleProfileProfessor;
  examSourceCount: number;
  minRequired: number;
}

export type StyleProfileResponse = StyleProfileReady | StyleProfileInsufficient;
