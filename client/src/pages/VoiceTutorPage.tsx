import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { voiceService } from '../services/voiceService';
import VoiceRecorder from '../components/voice/VoiceRecorder';
import TranscriptView, {
  type TranscriptTurn,
} from '../components/voice/TranscriptView';
import type {
  StartVoiceSessionResponse,
  VoiceProvider,
} from '../types/multimodal';
import { getApiErrorCode } from '../services/api';

// Phase 6 task 6.18 — live voice tutor page.
//
// State machine is deliberately tiny (useReducer is enough, xstate would
// be overkill). The page hands the browser's MediaStream to an imagined
// Gemini Live bridge (wired in production via the handshake payload we
// get from POST /api/voice/sessions) — here we focus on the UX wiring:
// permission prompt, streaming bar + transcript, interrupt/resume,
// quota banner, error states.

type TutorState =
  | { step: 'idle' }
  | { step: 'connecting'; sessionId: string; startedAt: number }
  | {
      step: 'streaming';
      sessionId: string;
      startedAt: number;
      interruptCount: number;
      turns: TranscriptTurn[];
      provider: VoiceProvider;
      fallbackUsed: boolean;
    }
  | {
      step: 'paused';
      sessionId: string;
      startedAt: number;
      interruptCount: number;
      turns: TranscriptTurn[];
      provider: VoiceProvider;
      fallbackUsed: boolean;
    }
  | { step: 'error'; message: string }
  | {
      step: 'ended';
      sessionId: string;
      durationSec: number;
      turns: TranscriptTurn[];
      provider: VoiceProvider;
    };

type Action =
  | { type: 'START'; payload: StartVoiceSessionResponse }
  | { type: 'STREAM_READY'; provider: VoiceProvider; fallbackUsed: boolean }
  | { type: 'APPEND'; turn: TranscriptTurn }
  | { type: 'INTERRUPT' }
  | { type: 'RESUME' }
  | { type: 'ERROR'; message: string }
  | { type: 'END' }
  | { type: 'RESET' };

function reducer(state: TutorState, action: Action): TutorState {
  switch (action.type) {
    case 'START':
      return {
        step: 'connecting',
        sessionId: action.payload.sessionId,
        startedAt: Date.now(),
      };
    case 'STREAM_READY':
      if (state.step !== 'connecting') return state;
      return {
        step: 'streaming',
        sessionId: state.sessionId,
        startedAt: state.startedAt,
        interruptCount: 0,
        turns: [],
        provider: action.provider,
        fallbackUsed: action.fallbackUsed,
      };
    case 'APPEND':
      if (state.step !== 'streaming' && state.step !== 'paused') return state;
      return {
        ...state,
        turns: [...state.turns, action.turn],
      };
    case 'INTERRUPT':
      if (state.step !== 'streaming') return state;
      return { ...state, step: 'paused', interruptCount: state.interruptCount + 1 };
    case 'RESUME':
      if (state.step !== 'paused') return state;
      return { ...state, step: 'streaming' };
    case 'ERROR':
      return { step: 'error', message: action.message };
    case 'END':
      if (state.step === 'streaming' || state.step === 'paused') {
        return {
          step: 'ended',
          sessionId: state.sessionId,
          durationSec: Math.floor((Date.now() - state.startedAt) / 1000),
          turns: state.turns,
          provider: state.provider,
        };
      }
      return state;
    case 'RESET':
      return { step: 'idle' };
    default:
      return state;
  }
}

function formatSeconds(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.round(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function VoiceTutorPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [state, dispatch] = useReducer(reducer, { step: 'idle' });
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const usageQuery = useQuery({
    queryKey: ['voice', 'usage'],
    queryFn: voiceService.getUsage,
    refetchInterval: state.step === 'streaming' ? 30_000 : false,
    staleTime: 15_000,
  });

  const startMutation = useMutation({
    mutationFn: voiceService.startSession,
    onSuccess: (data) => dispatch({ type: 'START', payload: data }),
    onError: (err) => {
      const code = getApiErrorCode(err);
      if (code === 'VOICE_QUOTA_EXCEEDED') {
        dispatch({ type: 'ERROR', message: t('voice.errors.quota') });
      } else if (code === 'PREMIUM_REQUIRED') {
        dispatch({ type: 'ERROR', message: t('voice.errors.premium') });
      } else {
        dispatch({ type: 'ERROR', message: t('voice.errors.generic') });
      }
    },
  });

  const endMutation = useMutation({
    mutationFn: voiceService.endSession,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['voice'] });
    },
  });

  const handleStreamFromRecorder = useCallback((stream: MediaStream) => {
    mediaStreamRef.current = stream;
    // Simulated handshake success — production wires this to the
    // Gemini Live socket `open` event. Demo transcript below keeps the
    // UI testable under visual smoke.
    dispatch({
      type: 'STREAM_READY',
      provider: 'gemini-live',
      fallbackUsed: false,
    });
    dispatch({
      type: 'APPEND',
      turn: {
        id: 'welcome',
        speaker: 'tutor',
        text: t('voice.welcomeTurn'),
        timestampSec: 0,
      },
    });
  }, [t]);

  const handleRecorderError = useCallback(
    (err: Error) => {
      dispatch({
        type: 'ERROR',
        message:
          err.name === 'NotAllowedError'
            ? t('voice.errors.micDenied')
            : t('voice.errors.micUnavailable'),
      });
    },
    [t]
  );

  const onEnd = useCallback(async () => {
    if (state.step !== 'streaming' && state.step !== 'paused') return;
    const durationSec = Math.floor((Date.now() - state.startedAt) / 1000);
    await endMutation.mutateAsync({
      sessionId: state.sessionId,
      durationSec,
      transcript: state.turns.map((t) => `${t.speaker}: ${t.text}`).join('\n'),
      topics: [],
      provider: state.provider,
      interruptCount: state.interruptCount,
      fallbackUsed: state.fallbackUsed,
    });
    dispatch({ type: 'END' });
  }, [state, endMutation]);

  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        for (const track of mediaStreamRef.current.getTracks()) track.stop();
      }
    };
  }, []);

  const usageBadge = useMemo(() => {
    if (!usageQuery.data) return null;
    const total = usageQuery.data.dailyCapSec;
    const used = usageQuery.data.totalSec;
    return t('voice.usage', {
      used: formatSeconds(used),
      total: formatSeconds(total),
    });
  }, [usageQuery.data, t]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-text-base">
          {t('voice.heading')}
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          {t('voice.subheading')}
        </p>
        {usageBadge && (
          <p className="mt-2 text-xs text-text-muted">{usageBadge}</p>
        )}
      </header>

      {state.step === 'idle' && (
        <section className="rounded-lg border border-border bg-surface p-6">
          <p className="mb-4 text-sm text-text-muted">
            {t('voice.idleHelp')}
          </p>
          <button
            type="button"
            onClick={() => startMutation.mutate({})}
            disabled={startMutation.isPending}
            className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
          >
            {startMutation.isPending
              ? t('voice.starting')
              : t('voice.start')}
          </button>
        </section>
      )}

      {(state.step === 'connecting' ||
        state.step === 'streaming' ||
        state.step === 'paused') && (
        <section className="space-y-4 rounded-lg border border-border bg-surface p-6">
          <VoiceRecorder
            active={state.step !== 'paused'}
            onStream={handleStreamFromRecorder}
            onError={handleRecorderError}
          />
          {state.step !== 'connecting' && (
            <TranscriptView turns={state.turns} />
          )}
          <div className="flex flex-wrap gap-3">
            {state.step === 'streaming' && (
              <button
                type="button"
                onClick={() => dispatch({ type: 'INTERRUPT' })}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-border"
              >
                {t('voice.interrupt')}
              </button>
            )}
            {state.step === 'paused' && (
              <button
                type="button"
                onClick={() => dispatch({ type: 'RESUME' })}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
              >
                {t('voice.resume')}
              </button>
            )}
            <button
              type="button"
              onClick={onEnd}
              disabled={endMutation.isPending}
              className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-border disabled:opacity-60"
            >
              {endMutation.isPending ? t('voice.ending') : t('voice.end')}
            </button>
          </div>
        </section>
      )}

      {state.step === 'ended' && (
        <section className="rounded-lg border border-border bg-surface p-6">
          <h2 className="font-display text-lg font-semibold text-text-base">
            {t('voice.endedHeading')}
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            {t('voice.endedDuration', {
              duration: formatSeconds(state.durationSec),
            })}
          </p>
          <div className="mt-4">
            <TranscriptView turns={state.turns} />
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: 'RESET' })}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            {t('voice.restart')}
          </button>
        </section>
      )}

      {state.step === 'error' && (
        <section className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
          <h2 className="font-display text-lg font-semibold">
            {t('voice.errorHeading')}
          </h2>
          <p className="mt-2">{state.message}</p>
          <button
            type="button"
            onClick={() => dispatch({ type: 'RESET' })}
            className="mt-3 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium"
          >
            {t('voice.tryAgain')}
          </button>
        </section>
      )}
    </div>
  );
}
