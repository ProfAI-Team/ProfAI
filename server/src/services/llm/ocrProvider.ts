import { Type } from "@google/genai";

import { getClient } from "./geminiProvider";
import { recordAICall } from "./aiCallTracker";
import { featureLogger } from "../../lib/logger";

// Phase 6 task 6.10 — Gemini multimodal OCR primary provider. Runs
// `gemini-2.5-flash` (not flash-lite; multimodal vision quality wins
// matter here) with a structured response schema that returns both
// plain text and a list of LaTeX-rendered formulas with per-formula
// confidence. Callers apply their own fallback (Tesseract / Vision)
// via the providerRegistry when this throws.

const DEFAULT_OCR_MODEL = "gemini-2.5-flash";
const log = featureLogger("ocrProvider");

export interface OCRFormula {
  latex: string;
  confidence: number; // 0..1
  bbox?: { x: number; y: number; w: number; h: number };
}

export interface OCRRawResult {
  text: string;
  formulas: OCRFormula[];
  confidence: number; // 0..1 overall
  language: string;
}

const ocrResponseSchema = {
  type: Type.OBJECT,
  properties: {
    text: { type: Type.STRING },
    formulas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          latex: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
        },
        required: ["latex", "confidence"],
        propertyOrdering: ["latex", "confidence"],
      },
    },
    confidence: { type: Type.NUMBER },
    language: { type: Type.STRING },
  },
  required: ["text", "formulas", "confidence", "language"],
  propertyOrdering: ["text", "formulas", "confidence", "language"],
};

const OCR_PROMPT = `Sen bir el yazısı / basılı defter sayfası metin çıkarma asistanısın. Sana verilen görüntüyü dikkatlice incele ve JSON olarak döndür:

1. text: Görseldeki TÜM metni satır satır, doğal okuma sırasına göre çıkar. Türkçe karakterleri koru.
2. formulas: Matematik/fizik/kimya formüllerini LaTeX formatında çıkar. Her formül için:
   - latex: LaTeX string (örn. "x^2 + 2x - 3 = 0" veya "\\int_0^1 f(x) dx")
   - confidence: 0-1 arası emin olduğun derece (0.7+ ise normal, 0.5 altı şüpheli)
   Hiç formül yoksa boş array [] döndür. LaTeX parantezlerini doğru kaçır.
3. confidence: 0-1 arası genel güven skoru — sayfanın ne kadar okunabilir olduğu.
4. language: Ana dil kodu ("tr" veya "en").

Önemli:
- Kısaltmaları, başlıkları, madde işaretlerini koru.
- El yazısı okunaksızsa "[okunamıyor]" yaz, uydurma yapma.
- JSON dışında ek açıklama ekleme.`;

export interface OcrWithGeminiOptions {
  userId?: string | null;
}

export async function ocrWithGemini(
  buffer: Buffer,
  mimeType: string,
  options: OcrWithGeminiOptions = {}
): Promise<{ raw: OCRRawResult; model: string; latencyMs: number }> {
  const client = getClient();
  const model = process.env.OCR_MODEL || DEFAULT_OCR_MODEL;
  const startedAt = Date.now();

  if (!/^image\//.test(mimeType) && mimeType !== "application/pdf") {
    throw new Error(`Unsupported OCR mime type: ${mimeType}`);
  }

  const base64Data = buffer.toString("base64");

  try {
    const response = await client.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType, data: base64Data } },
            { text: OCR_PROMPT },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: ocrResponseSchema,
        temperature: 0.1,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Gemini returned empty OCR response");

    const parsed = JSON.parse(text) as OCRRawResult;
    const latencyMs = Date.now() - startedAt;

    const usage = response.usageMetadata;
    await recordAICall({
      userId: options.userId,
      feature: "ocr-multimodal",
      provider: "gemini",
      model,
      inputTokens: usage?.promptTokenCount ?? 0,
      outputTokens: usage?.candidatesTokenCount ?? 0,
      latencyMs,
      success: true,
    });

    return { raw: parsed, model, latencyMs };
  } catch (err) {
    log.warn(
      { err, mimeType, bufferBytes: buffer.byteLength },
      "Gemini OCR call failed"
    );
    await recordAICall({
      userId: options.userId,
      feature: "ocr-multimodal",
      provider: "gemini",
      model,
      inputTokens: 0,
      outputTokens: 0,
      latencyMs: Date.now() - startedAt,
      success: false,
      errorCode: err instanceof Error ? err.message.slice(0, 100) : "unknown",
    });
    throw err;
  }
}
