import api from './api';
import type {
  AggregatedReportResponse,
  HighPerformerStrategyResponse,
  PostExamReportInput,
  PostExamReportResult,
} from '../types/community';

export const postExamReportService = {
  async submit(input: PostExamReportInput): Promise<PostExamReportResult> {
    const res = await api.post('/post-exam-reports', input);
    return res.data as PostExamReportResult;
  },

  async getAggregated(
    professorId: string,
    params?: { windowMonths?: number }
  ): Promise<AggregatedReportResponse> {
    const res = await api.get(
      `/post-exam-reports/professor/${professorId}`,
      { params }
    );
    return res.data as AggregatedReportResponse;
  },

  async getHighPerformerStrategy(
    professorId: string
  ): Promise<HighPerformerStrategyResponse> {
    const res = await api.get(
      `/professors/${professorId}/high-performer-strategy`
    );
    return res.data as HighPerformerStrategyResponse;
  },
};
