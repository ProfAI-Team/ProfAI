import api from './api';
import { Course } from '../types';

export const courseService = {
  async getAll(): Promise<Course[]> {
    const res = await api.get('/courses');
    return res.data.courses || [];
  },

  async getById(id: string): Promise<Course> {
    const res = await api.get(`/courses/${id}`);
    return res.data.course;
  },

  async create(data: {
    name: string;
    code: string;
    professorId: string;
  }): Promise<Course> {
    const res = await api.post('/courses', data);
    return res.data.course;
  },
};
