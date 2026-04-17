import api from './api';
import type { CompatibilityResult, ReconstructResult } from '../types/dna';

export const courseAdvisorService = {
  async getCompatibility(professorId: string): Promise<CompatibilityResult> {
    const res = await api.get<CompatibilityResult>(
      `/course-advisor/${professorId}`
    );
    return res.data;
  },
  async reconstructExam(professorId: string): Promise<ReconstructResult> {
    const res = await api.get<ReconstructResult>(
      `/exam-reconstruct/${professorId}`
    );
    return res.data;
  },
};
