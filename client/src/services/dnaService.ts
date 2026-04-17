import api from './api';
import type { DNAResponse, LearningStyle } from '../types/dna';

export const dnaService = {
  async getDNA(): Promise<DNAResponse> {
    const res = await api.get<DNAResponse>('/dna/me');
    return res.data;
  },
  async recompute(): Promise<DNAResponse> {
    const res = await api.post<DNAResponse>('/dna/me/recompute');
    return res.data;
  },
  async setLearningStyle(
    learningStyle: LearningStyle
  ): Promise<{ learningStyle: LearningStyle }> {
    const res = await api.patch<{ learningStyle: LearningStyle }>(
      '/dna/me/learning-style',
      { learningStyle }
    );
    return res.data;
  },
};
