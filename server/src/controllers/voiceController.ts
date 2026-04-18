import type { Request, Response } from "express";

import { parseOrRespond } from "../lib/validation";
import { unauthorized } from "../lib/AppError";
import {
  endSession,
  getVoiceUsage,
  listSessionsForUser,
  startSession,
  VOICE_DAILY_SEC_CAP,
} from "../services/voiceTutorService";
import {
  startVoiceSessionSchema,
  endVoiceSessionSchema,
} from "../schemas/multimodal";

export const startVoiceSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) throw unauthorized("Not authenticated.");

  const body = parseOrRespond(startVoiceSessionSchema, req.body ?? {}, res);
  if (body === null) return;

  const result = await startSession({
    userId: req.user.id,
    professorId: body.professorId ?? null,
    topicHint: body.topicHint ?? null,
  });

  if (result.status === "quota_exceeded") {
    res.status(429).json({
      error: {
        code: "VOICE_QUOTA_EXCEEDED",
        message: "Günlük canlı tutor süren doldu. Yarın tekrar dene.",
        usedSec: result.usedSec,
        dailyCapSec: result.dailyCapSec,
      },
    });
    return;
  }

  res.status(201).json({
    status: "ready",
    sessionId: result.sessionId,
    remainingSec: result.remainingSec,
    dailyCapSec: result.dailyCapSec,
    handshake: result.handshake,
  });
};

export const endVoiceSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) throw unauthorized("Not authenticated.");

  const body = parseOrRespond(endVoiceSessionSchema, req.body ?? {}, res);
  if (body === null) return;

  const session = await endSession({
    userId: req.user.id,
    sessionId: body.sessionId,
    professorId: body.professorId ?? null,
    durationSec: body.durationSec,
    transcript: body.transcript,
    topics: body.topics,
    provider: body.provider,
    interruptCount: body.interruptCount,
    fallbackUsed: body.fallbackUsed,
    costUsd: body.costUsd ?? null,
  });

  res.status(201).json({ session });
};

export const getMyVoiceSessions = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) throw unauthorized("Not authenticated.");

  const sessions = await listSessionsForUser(req.user.id);
  res.json({ sessions });
};

export const getMyVoiceUsage = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) throw unauthorized("Not authenticated.");

  const usage = await getVoiceUsage(req.user.id);
  res.json({
    ...usage,
    dailyCapSec: VOICE_DAILY_SEC_CAP,
    remainingSec: Math.max(0, VOICE_DAILY_SEC_CAP - usage.totalSec),
  });
};
