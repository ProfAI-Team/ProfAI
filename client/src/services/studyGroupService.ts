import api from './api';
import type {
  MatchmakingResult,
  StudyGroupSuggestion,
  StudyGroupSummary,
} from '../types/community';

export const studyGroupService = {
  async listMine(): Promise<{ groups: StudyGroupSummary[] }> {
    const res = await api.get('/study-groups/mine');
    return res.data as { groups: StudyGroupSummary[] };
  },

  async listSuggestions(
    professorId: string
  ): Promise<{ suggestions: StudyGroupSuggestion[] }> {
    const res = await api.get(
      `/study-groups/suggestions/${professorId}`
    );
    return res.data as { suggestions: StudyGroupSuggestion[] };
  },

  async join(input: {
    professorId: string;
    courseId?: string | null;
    examDate?: string | null;
  }): Promise<MatchmakingResult> {
    const res = await api.post('/study-groups/matchmake', input);
    return res.data as MatchmakingResult;
  },

  async submitLink(
    groupId: string,
    body: { url: string }
  ): Promise<{ url: string }> {
    const res = await api.post(
      `/study-groups/${groupId}/link`,
      body
    );
    return res.data as { url: string };
  },
};
