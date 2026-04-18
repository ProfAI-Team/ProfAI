import api from './api';
import type { HocaDashboard, HocaFeedback } from '../types/b2b';

export const hocaService = {
  async verify(universityEmail: string): Promise<{
    matched: Array<{ id: string; name: string; department: string }>;
  }> {
    const res = await api.post('/hoca/verify', { universityEmail });
    return res.data.data as {
      matched: Array<{ id: string; name: string; department: string }>;
    };
  },

  async dashboard(professorIds: string[]): Promise<HocaDashboard> {
    const params = new URLSearchParams();
    if (professorIds.length > 0) {
      params.set('professorIds', professorIds.join(','));
    }
    const res = await api.get(`/hoca/dashboard?${params.toString()}`);
    return res.data.data as HocaDashboard;
  },

  async feedback(professorIds: string[]): Promise<HocaFeedback> {
    const params = new URLSearchParams();
    if (professorIds.length > 0) {
      params.set('professorIds', professorIds.join(','));
    }
    const res = await api.get(`/hoca/feedback?${params.toString()}`);
    return res.data.data as HocaFeedback;
  },
};
