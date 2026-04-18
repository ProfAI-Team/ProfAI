import { createHash } from "node:crypto";

import type { VoiceSession } from "@prisma/client";
import { Type } from "@google/genai";

import prisma from "../lib/prisma";
import { enqueue, registerWorker } from "../lib/queue";
import { stringifyJsonField } from "../lib/jsonField";
import { featureLogger } from "../lib/logger";
import { getClient } from "./llm/geminiProvider";
import { recordAICall } from "./llm/aiCallTracker";

// Phase 6 task 6.12 — offline lecture audio transcription.
//
// Pipeline: client uploads audio (MP3/M4A/WAV, ≤200MB) → controller
// hands it to `enqueueLectureTranscribe` → BullMQ worker pulls the job
// → Gemini 2.5 multimodal transcribes + extracts key topics + exam
// hints ("hocanın bu sınavda çıkar dediği cümleler") → persists as a
// VoiceSession row with sourceType = "lecture".
//
// Idempotency: jobs are keyed on sha256(audioUrl + userId). Re-uploading
// the same audio doesn't re-process.

export const QUEUE_NAME = "lecture-transcribe";
export const LECTURE_DEFAULT_MODEL = "gemini-2.5-flash";
const log = featureLogger("lectureAudio");

const lectureResponseSchema = {
  type: Type.OBJECT,
  properties: {
    transcript: { type: Type.STRING },
    keyTopics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          timestampSec: { type: Type.INTEGER },
          quote: { type: Type.STRING },
        },
        required: ["topic", "timestampSec"],
        propertyOrdering: ["topic", "timestampSec", "quote"],
      },
    },
    examHints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    durationSec: { type: Type.INTEGER },
  },
  required: ["transcript", "keyTopics", "examHints", "durationSec"],
  propertyOrdering: ["transcript", "keyTopics", "examHints", "durationSec"],
};

const LECTURE_PROMPT = `Bu ders kaydını analiz et ve JSON olarak döndür:
1. transcript: Konuşmacının söylediği TÜM içeriği düz metin olarak yaz.
2. keyTopics: Kaydın içinde öne çıkan ana konuları listele. Her öğe için:
   - topic (TR)
   - timestampSec (kayıt içinde başlangıç saniyesi)
   - quote (opsiyonel: o konuyu işaret eden kısa alıntı)
   En az 3, en fazla 10 öğe.
3. examHints: Hocanın "bu sınavda çıkar / önemli / üzerinden geçin" tarzında söylediği net cümleleri değişmeden yaz. Yoksa boş array.
4. durationSec: Kaydın toplam süresi (tahmini).

Uydurma yapma; hoca sıkılmış, yarım kalmış cümleleri olduğu gibi transkribe et.`;

export interface LectureJobPayload {
  userId: string;
  fileUrl: string;
  fileHash: string;
  durationHintSec?: number | null;
  professorId?: string | null;
}

export function computeFileHash(fileUrl: string, userId: string): string {
  return createHash("sha256").update(`${userId}::${fileUrl}`).digest("hex");
}

export async function enqueueLectureTranscribe(
  input: Omit<LectureJobPayload, "fileHash">
): Promise<{ status: "queued" | "duplicate"; fileHash: string }> {
  const fileHash = computeFileHash(input.fileUrl, input.userId);

  const already = await prisma.voiceSession.findFirst({
    where: {
      userId: input.userId,
      sourceType: "lecture",
      topics: { path: ["fileHash"], equals: fileHash } as never,
    },
  });
  if (already) {
    return { status: "duplicate", fileHash };
  }

  await enqueue<LectureJobPayload>(QUEUE_NAME, { ...input, fileHash }, {
    jobId: `lecture:${fileHash}`, // BullMQ dedupes on jobId
  });

  log.info({ userId: input.userId, fileHash }, "lecture transcribe queued");
  return { status: "queued", fileHash };
}

export interface TranscribedPayload {
  transcript: string;
  keyTopics: Array<{ topic: string; timestampSec: number; quote?: string }>;
  examHints: string[];
  durationSec: number;
}

async function transcribeWithGemini(
  input: LectureJobPayload
): Promise<{ data: TranscribedPayload; model: string; latencyMs: number }> {
  const client = getClient();
  const model = process.env.LECTURE_MODEL || LECTURE_DEFAULT_MODEL;
  const startedAt = Date.now();

  // Gemini accepts audio via fileUri + mimeType. We re-serve the
  // uploaded file from our own /uploads mount; in prod the file would
  // live on S3/R2 and the URL would be signed.
  const response = await client.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [
          { text: LECTURE_PROMPT },
          { fileData: { fileUri: input.fileUrl, mimeType: "audio/mpeg" } },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: lectureResponseSchema,
      temperature: 0.2,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Gemini returned empty lecture transcript");
  const parsed = JSON.parse(text) as TranscribedPayload;
  const latencyMs = Date.now() - startedAt;

  const usage = response.usageMetadata;
  await recordAICall({
    userId: input.userId,
    feature: "lecture-transcribe",
    provider: "gemini",
    model,
    inputTokens: usage?.promptTokenCount ?? 0,
    outputTokens: usage?.candidatesTokenCount ?? 0,
    latencyMs,
    success: true,
  });

  return { data: parsed, model, latencyMs };
}

export async function handleLectureJob(
  payload: LectureJobPayload
): Promise<VoiceSession> {
  const { data, latencyMs } = await transcribeWithGemini(payload);

  const sessionId = payload.fileHash;
  // Topics row stores both the structured summary data and the
  // idempotency fileHash so subsequent enqueue attempts can short-
  // circuit without running the prompt again.
  const topics = [
    ...data.keyTopics.map((t) => ({
      topic: t.topic,
      startSec: t.timestampSec,
      endSec: t.timestampSec,
      quote: t.quote,
    })),
  ];

  const persisted = await prisma.voiceSession.create({
    data: {
      id: sessionId,
      userId: payload.userId,
      professorId: payload.professorId ?? null,
      sourceType: "lecture",
      durationSec: Math.max(0, data.durationSec),
      transcript: data.transcript,
      topics: stringifyJsonField({
        fileHash: payload.fileHash,
        keyTopics: topics,
        examHints: data.examHints,
      }),
      provider: "gemini",
      interruptCount: 0,
      fallbackUsed: false,
    },
  });

  log.info(
    {
      userId: payload.userId,
      sessionId,
      durationSec: data.durationSec,
      keyTopicCount: topics.length,
      examHintCount: data.examHints.length,
      latencyMs,
    },
    "lecture transcript persisted"
  );

  return persisted;
}

export function registerLectureWorker(): void {
  registerWorker<LectureJobPayload>(QUEUE_NAME, handleLectureJob);
}

export async function getLectureById(
  id: string,
  userId: string
): Promise<VoiceSession | null> {
  return prisma.voiceSession.findFirst({
    where: { id, userId, sourceType: "lecture" },
  });
}

export async function listLecturesForUser(
  userId: string,
  limit = 20
): Promise<VoiceSession[]> {
  return prisma.voiceSession.findMany({
    where: { userId, sourceType: "lecture" },
    orderBy: { createdAt: "desc" },
    take: Math.max(1, Math.min(limit, 100)),
  });
}
