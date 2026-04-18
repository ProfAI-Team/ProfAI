import { z } from "zod";

// Phase 6 task 6.15 — Zod schemas for the multimodal + voice + push
// REST surface. JSON bodies run through `parseOrRespond` so the global
// error middleware surfaces `{ error: { code: "VALIDATION_FAILED", … } }`
// uniformly.

export const startVoiceSessionSchema = z.object({
  professorId: z.string().uuid().optional().nullable(),
  topicHint: z.string().max(200).optional().nullable(),
});

export const endVoiceSessionSchema = z.object({
  sessionId: z.string().uuid(),
  durationSec: z.number().int().min(0).max(30 * 60),
  transcript: z.string().max(50_000),
  topics: z
    .array(
      z.object({
        topic: z.string().max(200),
        startSec: z.number().int().min(0),
        endSec: z.number().int().min(0),
      })
    )
    .max(100),
  provider: z.enum(["gemini-live", "claude", "openai-realtime"]),
  interruptCount: z.number().int().min(0).max(100).default(0),
  fallbackUsed: z.boolean().default(false),
  costUsd: z.number().min(0).max(10).optional().nullable(),
  professorId: z.string().uuid().optional().nullable(),
});

export const lectureUploadBodySchema = z.object({
  durationHintSec: z.number().int().min(0).optional(),
  professorId: z.string().uuid().optional(),
});

export const registerPushDeviceSchema = z.object({
  endpoint: z.string().url().max(500),
  keys: z.object({
    p256dh: z.string().max(200),
    auth: z.string().max(200),
  }),
  userAgent: z.string().max(500).optional(),
});

export const pushOptInSchema = z.object({
  optIn: z.boolean(),
});
