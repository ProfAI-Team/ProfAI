import api from './api';
import type { ConfidenceEntry } from '../types/dna';

export const confidenceService = {
  async getMap(): Promise<ConfidenceEntry[]> {
    const res = await api.get<{ topics: ConfidenceEntry[] }>('/confidence/me');
    return res.data.topics;
  },
  async getWeakest(n = 3): Promise<ConfidenceEntry[]> {
    const res = await api.get<{ topics: ConfidenceEntry[] }>(
      `/confidence/me/weakest?n=${n}`
    );
    return res.data.topics;
  },
};
