import api from "./api";
import type {
  StudyPack,
  StudyPackGenerateResponse,
  StudyPackListResponse,
} from "../types/studyPack";

export interface GenerateStudyPackParams {
  professorId: string;
  noteIds: string[];
}

export const studyPackService = {
  async generate(
    params: GenerateStudyPackParams
  ): Promise<StudyPackGenerateResponse> {
    const res = await api.post("/study-pack/generate", params);
    return res.data as StudyPackGenerateResponse;
  },

  async getById(id: string): Promise<StudyPack> {
    const res = await api.get(`/study-pack/${id}`);
    return res.data.pack as StudyPack;
  },

  async listMine(
    page: number = 1,
    limit: number = 20
  ): Promise<StudyPackListResponse> {
    const res = await api.get("/study-pack/mine", {
      params: { page, limit },
    });
    return res.data as StudyPackListResponse;
  },
};
