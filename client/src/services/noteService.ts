import api from "./api";
import type {
  NoteUploadResponse,
  StudentNoteSummary,
} from "../types/studyPack";

export interface UploadNotesParams {
  files: File[];
  courseId?: string | null;
  titles?: string[];
}

export const noteService = {
  async upload(params: UploadNotesParams): Promise<NoteUploadResponse> {
    const formData = new FormData();
    for (const file of params.files) formData.append("files", file);
    if (params.courseId) formData.append("courseId", params.courseId);
    if (params.titles) {
      for (const t of params.titles) formData.append("titles", t);
    }

    const res = await api.post("/notes/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data as NoteUploadResponse;
  },

  async getMine(): Promise<StudentNoteSummary[]> {
    const res = await api.get("/notes/mine");
    return (res.data.notes ?? []) as StudentNoteSummary[];
  },
};
