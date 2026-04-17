import api from './api';
import type {
  ApprovalOutcome,
  PendingExamList,
} from '../types/community';

export const examApprovalService = {
  async listPending(params?: {
    limit?: number;
    offset?: number;
  }): Promise<PendingExamList> {
    const res = await api.get('/exams/pending-approval', { params });
    return res.data as PendingExamList;
  },

  async cast(
    examId: string,
    body: { approved: boolean; reason?: string }
  ): Promise<ApprovalOutcome> {
    const res = await api.post(`/exams/${examId}/approve`, body);
    return res.data as ApprovalOutcome;
  },
};
