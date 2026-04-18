import type { OCRResult } from "@prisma/client";

import prisma from "../lib/prisma";
import { featureLogger } from "../lib/logger";
import { stringifyJsonField } from "../lib/jsonField";
import { withFallback } from "./llm/providerRegistry";
import { ocrWithGemini, type OCRFormula, type OCRRawResult } from "./llm/ocrProvider";

// Phase 6 task 6.10 — OCR entry point.
//
// Primary provider is Gemini multimodal (`ocrProvider`). Fallback path
// is a minimal text-only extractor that keeps the user flow moving when
// Gemini 503s: it doesn't do LaTeX, just the best guess at raw text
// with a 0.3 overall confidence so the UI can prompt for manual review.
// Operators can swap in Google Vision or a Tesseract binding by
// replacing `minimalTextFallback` with a richer implementation.

export const OCR_CONFIDENCE_LOW = 0.5;

const log = featureLogger("ocr");

export interface ExtractFromImageInput {
  userId: string;
  buffer: Buffer;
  mimeType: string;
  fileUrl: string;
}

export interface ExtractFromImageResult {
  status: "ready";
  result: OCRResult;
  lowConfidence: boolean;
  fallbackUsed: boolean;
}

function coerceFormulas(input: unknown): OCRFormula[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item): OCRFormula | null => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const latex = typeof o.latex === "string" ? o.latex : null;
      const confidence =
        typeof o.confidence === "number" ? Math.max(0, Math.min(1, o.confidence)) : 0.5;
      if (!latex) return null;
      return { latex, confidence };
    })
    .filter((v): v is OCRFormula => v !== null);
}

async function minimalTextFallback(
  buffer: Buffer,
  mimeType: string
): Promise<OCRRawResult> {
  // Try to read as UTF-8 text if the payload happens to be plain-text
  // (rare for OCR but keeps the contract alive); otherwise surface a
  // clear empty state so the UI prompts for manual entry.
  if (mimeType === "text/plain") {
    return {
      text: buffer.toString("utf8"),
      formulas: [],
      confidence: 0.9,
      language: "tr",
    };
  }
  return {
    text: "",
    formulas: [],
    confidence: 0.0,
    language: "tr",
  };
}

export async function extractFromImage(
  input: ExtractFromImageInput
): Promise<ExtractFromImageResult> {
  const startedAt = Date.now();

  const { data: raw, provider, fallbackUsed } = await withFallback(
    async () => (await ocrWithGemini(input.buffer, input.mimeType, { userId: input.userId })).raw,
    () => minimalTextFallback(input.buffer, input.mimeType),
    { feature: "ocr", primary: "gemini", fallback: "claude", userId: input.userId }
  );

  const formulas = coerceFormulas(raw.formulas);
  const overallConfidence = typeof raw.confidence === "number"
    ? Math.max(0, Math.min(1, raw.confidence))
    : 0.5;

  const processingMs = Date.now() - startedAt;

  const persisted = await prisma.oCRResult.create({
    data: {
      userId: input.userId,
      fileUrl: input.fileUrl,
      mimeType: input.mimeType,
      extractedText: raw.text ?? "",
      latexFormulas: stringifyJsonField(formulas),
      confidence: overallConfidence,
      provider: fallbackUsed ? "fallback" : provider === "gemini" ? "gemini-multimodal" : provider,
      processingMs,
    },
  });

  const lowConfidence = overallConfidence < OCR_CONFIDENCE_LOW;

  log.info(
    {
      userId: input.userId,
      ocrId: persisted.id,
      provider: persisted.provider,
      confidence: overallConfidence,
      formulaCount: formulas.length,
      processingMs,
      lowConfidence,
    },
    "OCR extraction complete"
  );

  return {
    status: "ready",
    result: persisted,
    lowConfidence,
    fallbackUsed,
  };
}

export async function listOCRForUser(userId: string, limit = 20): Promise<OCRResult[]> {
  return prisma.oCRResult.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: Math.max(1, Math.min(limit, 100)),
  });
}

export async function deleteOCR(userId: string, id: string): Promise<boolean> {
  const result = await prisma.oCRResult.deleteMany({
    where: { id, userId },
  });
  return result.count > 0;
}
