import api from './api';
import type {
  QuestionVoteStats,
  VerifiedPool,
} from '../types/community';

export const questionVoteService = {
  async getStats(questionId: string): Promise<QuestionVoteStats> {
    const res = await api.get(
      `/questions/${encodeURIComponent(questionId)}/stats`
    );
    return res.data as QuestionVoteStats;
  },

  async vote(
    questionId: string,
    body: { direction: -1 | 0 | 1; cameOnExam?: boolean }
  ): Promise<QuestionVoteStats> {
    const res = await api.post(
      `/questions/${encodeURIComponent(questionId)}/vote`,
      body
    );
    return res.data as QuestionVoteStats;
  },

  async markCameOnExam(
    questionId: string,
    body: { cameOnExam: boolean }
  ): Promise<{ cameOnExamCount: number }> {
    const res = await api.post(
      `/questions/${encodeURIComponent(questionId)}/came-on-exam`,
      body
    );
    return res.data as { cameOnExamCount: number };
  },

  async verifiedPool(params?: {
    limit?: number;
    offset?: number;
  }): Promise<VerifiedPool> {
    const res = await api.get('/questions/verified', { params });
    return res.data as VerifiedPool;
  },
};
