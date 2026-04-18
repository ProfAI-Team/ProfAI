// Phase 6 types (6.17). Mirror the server DTOs exactly — when an
// endpoint wraps a list in `{ sessions: […] }` vs `{ results: […] }`
// the key is preserved.

export type VoiceProvider = 'gemini-live' | 'claude' | 'openai-realtime';

export interface VoiceTopicSegment {
  topic: string;
  startSec: number;
  endSec: number;
  quote?: string;
}

export interface VoiceSession {
  id: string;
  userId: string;
  professorId: string | null;
  sourceType: 'live' | 'lecture';
  durationSec: number;
  transcript: string;
  topics: VoiceTopicSegment[] | {
    fileHash?: string;
    keyTopics?: VoiceTopicSegment[];
    examHints?: string[];
  };
  provider: VoiceProvider | 'gemini' | 'fallback';
  interruptCount: number;
  fallbackUsed: boolean;
  costUsd: number | null;
  createdAt: string;
}

export interface VoiceUsage {
  totalSec: number;
  sessionCount: number;
  dailyCapSec: number;
  remainingSec: number;
}

export interface VoiceSessionHandshake {
  provider: VoiceProvider;
  expiresAt: string;
}

export interface StartVoiceSessionResponse {
  status: 'ready';
  sessionId: string;
  remainingSec: number;
  dailyCapSec: number;
  handshake: VoiceSessionHandshake;
}

export interface OCRFormula {
  latex: string;
  confidence: number;
}

export interface OCRResult {
  id: string;
  userId: string;
  fileUrl: string;
  mimeType: string;
  extractedText: string;
  latexFormulas: OCRFormula[];
  confidence: number;
  provider: string;
  processingMs: number;
  createdAt: string;
}

export interface OCRUploadResponse {
  status: 'ready';
  result: OCRResult;
  lowConfidence: boolean;
  fallbackUsed: boolean;
}

export interface LectureTopic {
  topic: string;
  timestampSec: number;
  quote?: string;
}

export interface LectureDetail {
  id: string;
  transcript: string;
  durationSec: number;
  topics: {
    fileHash?: string;
    keyTopics?: LectureTopic[];
    examHints?: string[];
  };
  createdAt: string;
  professorId: string | null;
}

export interface LectureEnqueueResponse {
  status: 'queued' | 'duplicate';
  fileHash: string;
  message: string;
}

export interface MultimodalSearchHit {
  source: 'exam-analysis' | 'mock-exam';
  id: string;
  snippet: string;
  similarity: number;
  professor: {
    id: string;
    name: string;
    university: string;
  } | null;
  year: number | null;
}

export interface MultimodalSearchResponse {
  status: 'ready' | 'empty';
  description: string;
  keywords: string[];
  results: MultimodalSearchHit[];
}

export interface PushConfig {
  configured: boolean;
  vapidPublicKey: string | null;
}

export interface PushDevice {
  id: string;
  endpoint: string;
  userAgent: string | null;
  lastSeenAt: string;
}
