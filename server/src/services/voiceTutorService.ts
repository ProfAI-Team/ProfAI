import { randomUUID } from "node:crypto";

import type { VoiceSession } from "@prisma/client";

import prisma from "../lib/prisma";
import { featureLogger } from "../lib/logger";
import { stringifyJsonField } from "../lib/jsonField";
import { getDailyCap } from "../config/premiumFeatures";

// Phase 6 task 6.11 — voice tutor lifecycle service.
//
// Architecture split:
//   - `startSession` checks the daily minute cap + returns an opaque
//     session token + a short-lived Gemini Live handshake payload. The
//     actual audio-over-WebSocket streaming is handled by the client
//     (Gemini Live is WebRTC/WS based; brokering through the server
//     would double the bandwidth bill). Keeping the handshake on our
//     side keeps API keys off the client.
//   - `endSession` persists the transcript the client accumulated + the
//     interruption counter + the fallback flag to VoiceSession + bumps
//     VoiceUsage. Topic extraction is an optional post-processing hook
//     the caller can fire-and-forget after the response.
//
// Gemini Live geo-restriction risk (roadmap): when the client can't
// reach the Live API, the frontend falls back to text-only Claude via
// voiceService.startClaudeTextSession (6.17 / 6.18). From this
// service's perspective both paths call `endSession` the same way —
// `provider` + `fallbackUsed` record which path was used.

export const VOICE_DAILY_SEC_CAP = 30 * 60; // 30 minutes
export const VOICE_DAILY_SESSION_CAP_KEY = "VOICE_TUTOR";

const log = featureLogger("voiceTutor");

export type VoiceProvider = "gemini-live" | "claude" | "openai-realtime";

export interface StartSessionInput {
  userId: string;
  professorId?: string | null;
  topicHint?: string | null;
}

export type StartSessionResult =
  | {
      status: "ready";
      sessionId: string;
      remainingSec: number;
      dailyCapSec: number;
      handshake: {
        provider: VoiceProvider;
        expiresAt: Date;
      };
    }
  | {
      status: "quota_exceeded";
      remainingSec: 0;
      dailyCapSec: number;
      usedSec: number;
    };

function todayUtc(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function getVoiceUsage(userId: string, date = todayUtc()): Promise<{
  totalSec: number;
  sessionCount: number;
}> {
  const row = await prisma.voiceUsage.findUnique({
    where: { userId_date: { userId, date } },
  });
  return {
    totalSec: row?.totalSec ?? 0,
    sessionCount: row?.sessionCount ?? 0,
  };
}

export async function startSession(
  input: StartSessionInput
): Promise<StartSessionResult> {
  const today = todayUtc();
  const usage = await getVoiceUsage(input.userId, today);
  const remaining = VOICE_DAILY_SEC_CAP - usage.totalSec;

  const sessionCap = getDailyCap(VOICE_DAILY_SESSION_CAP_KEY) ?? 20;
  if (remaining <= 0 || usage.sessionCount >= sessionCap) {
    log.warn(
      { userId: input.userId, usedSec: usage.totalSec, sessionCount: usage.sessionCount },
      "voice quota exceeded"
    );
    return {
      status: "quota_exceeded",
      remainingSec: 0,
      dailyCapSec: VOICE_DAILY_SEC_CAP,
      usedSec: usage.totalSec,
    };
  }

  const sessionId = randomUUID();
  // 10-minute handshake TTL — the client has to begin streaming before
  // the token expires, otherwise the server treats the slot as free
  // again.
  const expiresAt = new Date(Date.now() + 10 * 60_000);

  log.info(
    {
      userId: input.userId,
      sessionId,
      professorId: input.professorId,
      remainingSec: remaining,
    },
    "voice session started"
  );

  return {
    status: "ready",
    sessionId,
    remainingSec: remaining,
    dailyCapSec: VOICE_DAILY_SEC_CAP,
    handshake: {
      provider: "gemini-live",
      expiresAt,
    },
  };
}

export interface EndSessionInput {
  userId: string;
  sessionId: string;
  professorId?: string | null;
  durationSec: number;
  transcript: string;
  topics: Array<{ topic: string; startSec: number; endSec: number }>;
  provider: VoiceProvider;
  interruptCount: number;
  fallbackUsed: boolean;
  costUsd?: number | null;
  sourceType?: "live" | "lecture";
}

export async function endSession(input: EndSessionInput): Promise<VoiceSession> {
  const clampedDuration = Math.max(
    0,
    Math.min(input.durationSec, VOICE_DAILY_SEC_CAP)
  );

  // Idempotency — re-submitting the same sessionId returns the existing
  // row rather than double-counting against the daily cap.
  const existing = await prisma.voiceSession.findFirst({
    where: { id: input.sessionId, userId: input.userId },
  });
  if (existing) {
    log.info({ userId: input.userId, sessionId: input.sessionId }, "endSession idempotent — returning existing row");
    return existing;
  }

  const today = todayUtc();

  // Compose the write + usage bump as a Serializable tx so concurrent
  // endSession calls can't leave usage below reality. The unique
  // VoiceUsage composite PK + transactional upsert handle the race.
  return prisma.$transaction(async (tx) => {
    const created = await tx.voiceSession.create({
      data: {
        id: input.sessionId,
        userId: input.userId,
        professorId: input.professorId ?? null,
        sourceType: input.sourceType ?? "live",
        durationSec: clampedDuration,
        transcript: input.transcript,
        topics: stringifyJsonField(input.topics),
        provider: input.provider,
        interruptCount: input.interruptCount,
        fallbackUsed: input.fallbackUsed,
        costUsd: input.costUsd ?? null,
      },
    });

    await tx.voiceUsage.upsert({
      where: { userId_date: { userId: input.userId, date: today } },
      update: {
        totalSec: { increment: clampedDuration },
        sessionCount: { increment: 1 },
      },
      create: {
        userId: input.userId,
        date: today,
        totalSec: clampedDuration,
        sessionCount: 1,
      },
    });

    log.info(
      {
        userId: input.userId,
        sessionId: input.sessionId,
        provider: input.provider,
        fallbackUsed: input.fallbackUsed,
        durationSec: clampedDuration,
        interruptCount: input.interruptCount,
      },
      "voice session persisted"
    );

    return created;
  });
}

export async function listSessionsForUser(
  userId: string,
  limit = 20
): Promise<VoiceSession[]> {
  return prisma.voiceSession.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: Math.max(1, Math.min(limit, 100)),
  });
}
