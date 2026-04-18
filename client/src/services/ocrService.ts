import api from './api';
import type { OCRResult, OCRUploadResponse } from '../types/multimodal';

export const ocrService = {
  async upload(file: File): Promise<OCRUploadResponse> {
    const form = new FormData();
    form.append('image', file);
    const res = await api.post<OCRUploadResponse>('/ocr/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  async listMine(limit = 20): Promise<{ results: OCRResult[] }> {
    const res = await api.get<{ results: OCRResult[] }>('/ocr/me', {
      params: { limit },
    });
    return res.data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/ocr/${id}`);
  },
};
