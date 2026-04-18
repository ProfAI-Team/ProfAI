import api from './api';
import type {
  LectureDetail,
  LectureEnqueueResponse,
} from '../types/multimodal';

export const lectureService = {
  async upload(
    file: File,
    options?: { durationHintSec?: number; professorId?: string }
  ): Promise<LectureEnqueueResponse> {
    const form = new FormData();
    form.append('audio', file);
    if (options?.durationHintSec !== undefined) {
      form.append('durationHintSec', String(options.durationHintSec));
    }
    if (options?.professorId) {
      form.append('professorId', options.professorId);
    }
    const res = await api.post<LectureEnqueueResponse>(
      '/lectures/upload',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data;
  },
  async listMine(): Promise<{ lectures: LectureDetail[] }> {
    const res = await api.get<{ lectures: LectureDetail[] }>('/lectures/me');
    return res.data;
  },
  async get(id: string): Promise<{ lecture: LectureDetail }> {
    const res = await api.get<{ lecture: LectureDetail }>(`/lectures/${id}`);
    return res.data;
  },
};
