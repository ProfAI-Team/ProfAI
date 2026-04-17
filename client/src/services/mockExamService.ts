import api from "./api";
import type {
  MockExam,
  MockExamGenerateResponse,
  MockExamResultResponse,
  MockExamSubmitResponse,
  PanicPlanResponse,
  StudentAnswer,
} from "../types/mockExam";

export interface GenerateMockExamParams {
  professorId: string;
  studyPackId?: string | null;
  noteIds?: string[];
  questionCount?: number;
  durationMin?: number;
}

export interface SubmitMockExamParams {
  answers: StudentAnswer[];
  autoSubmitted?: boolean;
}

export interface PanicPlanParams {
  hoursUntilExam: number;
  professorId: string;
  mockExamSessionId?: string;
}

export const mockExamService = {
  async generate(
    params: GenerateMockExamParams
  ): Promise<MockExamGenerateResponse> {
    const res = await api.post("/mock-exam/generate", params);
    return res.data as MockExamGenerateResponse;
  },

  async getById(id: string): Promise<MockExam> {
    const res = await api.get(`/mock-exam/${id}`);
    return res.data.exam as MockExam;
  },

  async submit(
    id: string,
    params: SubmitMockExamParams
  ): Promise<MockExamSubmitResponse> {
    const res = await api.post(`/mock-exam/${id}/submit`, params);
    return res.data as MockExamSubmitResponse;
  },

  async getResult(sessionId: string): Promise<MockExamResultResponse> {
    const res = await api.get(`/mock-exam/session/${sessionId}/result`);
    return res.data as MockExamResultResponse;
  },

  async panicPlan(params: PanicPlanParams): Promise<PanicPlanResponse> {
    const res = await api.post("/mock-exam/panic-plan", params);
    return res.data as PanicPlanResponse;
  },
};
