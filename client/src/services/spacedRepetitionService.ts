import api from './api';
import type { SM2Result, SpacedRepetitionReview } from '../types/dna';

export const spacedRepetitionService = {
  async getDue(until?: Date): Promise<SpacedRepetitionReview[]> {
    const q = until ? `?until=${encodeURIComponent(until.toISOString())}` : '';
    const res = await api.get<{ reviews: SpacedRepetitionReview[] }>(
      `/spaced-repetition/me/due${q}`
    );
    return res.data.reviews;
  },
  async complete(questionId: string, correct: boolean): Promise<SM2Result> {
    const res = await api.post<SM2Result>(
      `/spaced-repetition/me/${encodeURIComponent(questionId)}/complete`,
      { correct }
    );
    return res.data;
  },
  async setFrequency(
    frequency: 'daily' | 'weekly' | 'off'
  ): Promise<{ reviewFrequency: string }> {
    const res = await api.patch<{ reviewFrequency: string }>(
      '/users/me/review-frequency',
      { reviewFrequency: frequency }
    );
    return res.data;
  },
};
