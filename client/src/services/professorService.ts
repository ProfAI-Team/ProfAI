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
  }): Promise<Professor[]> {
    const res = await api.get('/professors', { params });
    return res.data.professors || [];
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
};
