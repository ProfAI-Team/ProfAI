import api from './api';
import type {
  StartVoiceSessionResponse,
  VoiceProvider,
  VoiceSession,
  VoiceTopicSegment,
  VoiceUsage,
} from '../types/multimodal';

export interface StartSessionPayload {
  professorId?: string | null;
  topicHint?: string | null;
}

export interface EndSessionPayload {
  sessionId: string;
  durationSec: number;
  transcript: string;
  topics: VoiceTopicSegment[];
  provider: VoiceProvider;
  interruptCount: number;
  fallbackUsed: boolean;
  costUsd?: number | null;
  professorId?: string | null;
}

export const voiceService = {
  async startSession(
    payload: StartSessionPayload
  ): Promise<StartVoiceSessionResponse> {
    const res = await api.post<StartVoiceSessionResponse>(
      '/voice/sessions',
      payload
    );
    return res.data;
  },
  async endSession(
    payload: EndSessionPayload
  ): Promise<{ session: VoiceSession }> {
    const res = await api.post<{ session: VoiceSession }>(
      '/voice/sessions/end',
      payload
    );
    return res.data;
  },
  async listMine(): Promise<{ sessions: VoiceSession[] }> {
    const res = await api.get<{ sessions: VoiceSession[] }>(
      '/voice/sessions/me'
    );
    return res.data;
  },
  async getUsage(): Promise<VoiceUsage> {
    const res = await api.get<VoiceUsage>('/voice/usage/me');
    return res.data;
  },
};
