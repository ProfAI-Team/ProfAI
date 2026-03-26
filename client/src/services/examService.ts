import api from './api';
import { Exam } from '../types';

export const examService = {
  async upload(data: {
    courseId: string;
    examType: string;
    year: number;
    semester: string;
    file: File;
  }): Promise<Exam> {
    const formData = new FormData();
    formData.append('courseId', data.courseId);
    formData.append('examType', data.examType);
    formData.append('year', String(data.year));
    formData.append('semester', data.semester);
    formData.append('file', data.file);

    const res = await api.post('/exams/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.exam;
  },

  async getByCourse(courseId: string): Promise<Exam[]> {
    const res = await api.get(`/exams/course/${courseId}`);
    return res.data.exams || [];
  },
};
