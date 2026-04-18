import api from './api';
import type { UniversityDashboard } from '../types/b2b';

export const universityService = {
  async getDashboard(): Promise<UniversityDashboard> {
    const res = await api.get('/university/dashboard');
    return res.data.data as UniversityDashboard;
  },

  async addSeat(userEmail: string): Promise<void> {
    await api.post('/university/seats', { userEmail });
  },

  async removeSeat(userId: string): Promise<void> {
    await api.delete(`/university/seats/${userId}`);
  },

  async provisionSso(samlMetadata: string): Promise<void> {
    await api.post('/university/sso', { samlMetadata });
  },
};
