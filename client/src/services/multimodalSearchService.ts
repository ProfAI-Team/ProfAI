import api from './api';
import type { MultimodalSearchResponse } from '../types/multimodal';

export const multimodalSearchService = {
  async search(
    file: File,
    limit = 10
  ): Promise<MultimodalSearchResponse> {
    const form = new FormData();
    form.append('image', file);
    const res = await api.post<MultimodalSearchResponse>(
      '/multimodal/search',
      form,
      {
        params: { limit },
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data;
  },
};
