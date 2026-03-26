import api from './api';
import { ProfessorRating } from '../types';

export const ratingService = {
  async create(data: {
    professorId: string;
    difficultyScore: number;
    fairnessScore: number;
    comment: string;
  }): Promise<ProfessorRating> {
    const res = await api.post('/ratings', data);
    return res.data.rating;
  },

  async getByProfessor(professorId: string): Promise<ProfessorRating[]> {
    const res = await api.get(`/ratings/professor/${professorId}`);
    return res.data.ratings || [];
  },
};
