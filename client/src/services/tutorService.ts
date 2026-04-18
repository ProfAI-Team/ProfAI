import api from './api';
import type {
  Tutor,
  TutorMatchResult,
  TutoringSession,
} from '../types/b2b';

export interface MatchFilters {
  subject?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  priceMinTl?: number;
  priceMaxTl?: number;
  minRating?: number;
  limit?: number;
}

export const tutorService = {
  async apply(payload: {
    bio: string;
    hourlyRate: number;
    specializations: Tutor['specializations'];
    availability: Tutor['availability'];
  }): Promise<Tutor> {
    const res = await api.post('/tutors', payload);
    return res.data.data as Tutor;
  },

  async getMe(): Promise<Tutor | null> {
    const res = await api.get('/tutors/me');
    return res.data.data as Tutor | null;
  },

  async getById(id: string): Promise<Tutor> {
    const res = await api.get(`/tutors/${id}`);
    return res.data.data as Tutor;
  },

  async match(filters: MatchFilters): Promise<TutorMatchResult[]> {
    const res = await api.post('/tutors/match', filters);
    return (res.data.data.results ?? []) as TutorMatchResult[];
  },
};

export const tutoringService = {
  async book(payload: {
    tutorId: string;
    scheduledAt: string;
    durationMin: number;
  }): Promise<TutoringSession> {
    const res = await api.post('/tutoring/sessions', payload);
    return res.data.data as TutoringSession;
  },

  async get(id: string): Promise<TutoringSession> {
    const res = await api.get(`/tutoring/sessions/${id}`);
    return res.data.data as TutoringSession;
  },

  async mine(): Promise<TutoringSession[]> {
    const res = await api.get('/tutoring/sessions/me');
    return (res.data.data ?? []) as TutoringSession[];
  },

  async complete(
    id: string,
    payload: { rating: number; feedback?: string }
  ): Promise<void> {
    await api.post(`/tutoring/sessions/${id}/complete`, payload);
  },
};
