import api from './api';
import type {
  GpaResult,
  GpaSimulationResult,
  GradeRecord,
  UniversityKey,
  WhatIfResult,
} from '../types/dna';

export interface AddGradeInput {
  courseId?: string;
  courseName: string;
  grade: number;
  credit: number;
  semester: string;
  letterGrade?: string;
  university?: UniversityKey;
}

export const gradeService = {
  async add(input: AddGradeInput): Promise<{ id: string; letterGrade: string }> {
    const res = await api.post<{ id: string; letterGrade: string }>(
      '/grades',
      input
    );
    return res.data;
  },
  async list(semester?: string): Promise<GradeRecord[]> {
    const q = semester ? `?semester=${encodeURIComponent(semester)}` : '';
    const res = await api.get<{ grades: GradeRecord[] }>(`/grades/me${q}`);
    return res.data.grades;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/grades/${id}`);
  },
  async getGPA(opts: {
    semester?: string;
    university?: UniversityKey;
  } = {}): Promise<GpaResult> {
    const params = new URLSearchParams();
    if (opts.semester) params.set('semester', opts.semester);
    if (opts.university) params.set('university', opts.university);
    const qs = params.toString();
    const res = await api.get<GpaResult>(
      `/grades/me/gpa${qs ? `?${qs}` : ''}`
    );
    return res.data;
  },
  async simulate(input: {
    courseName: string;
    hypotheticalGrade: number;
    credit: number;
    university?: UniversityKey;
  }): Promise<GpaSimulationResult> {
    const res = await api.post<GpaSimulationResult>(
      '/grades/me/simulate',
      input
    );
    return res.data;
  },
  async whatIf(input: {
    targetGPA: number;
    courseName: string;
    credit: number;
    university?: UniversityKey;
  }): Promise<WhatIfResult> {
    const res = await api.post<WhatIfResult>('/grades/me/target', input);
    return res.data;
  },
};
