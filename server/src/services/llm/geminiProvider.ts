import fs from "fs/promises";
import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from "../analysisService";
import {
  buildStyleSummaryPrompt,
  type StyleSummaryInput,
} from "../../prompts/style-summary";
import {
  buildStudyPackPrompt,
  type StudyPackPromptInput,
  type TargetDistribution,
} from "../../prompts/study-pack";
import {
  buildMockExamPrompt,
  buildGradeAnswerPrompt,
  type MockExamPromptInput,
  type MockExamContent,
  type MockExamQuestion,
  type GradeAnswerPromptInput,
  type GradeAnswerResult,
} from "../../prompts/mock-exam";
import { recordAICall } from "./aiCallTracker";

const DEFAULT_MODEL = "gemini-2.5-flash";

interface GeminiRawResult {
  questionCount: number;
  questionTypes: {
    "Multiple Choice": number;
    "Classic/Open-ended": number;
    "True/False": number;
  };
  topicDistribution: Array<{ topic: string; percentage: number }>;
  difficultyScore: number;
  summary: string;
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    questionCount: { type: Type.INTEGER },
    questionTypes: {
      type: Type.OBJECT,
      properties: {
        "Multiple Choice": { type: Type.NUMBER },
        "Classic/Open-ended": { type: Type.NUMBER },
        "True/False": { type: Type.NUMBER },
      },
      required: ["Multiple Choice", "Classic/Open-ended", "True/False"],
      propertyOrdering: ["Multiple Choice", "Classic/Open-ended", "True/False"],
    },
    topicDistribution: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          percentage: { type: Type.NUMBER },
        },
        required: ["topic", "percentage"],
        propertyOrdering: ["topic", "percentage"],
      },
    },
    difficultyScore: { type: Type.NUMBER },
    summary: { type: Type.STRING },
  },
  required: [
    "questionCount",
    "questionTypes",
    "topicDistribution",
    "difficultyScore",
    "summary",
  ],
  propertyOrdering: [
    "questionCount",
    "questionTypes",
    "topicDistribution",
    "difficultyScore",
    "summary",
  ],
};

const PROMPT = `Sen bir üniversite sınav analisti asistanısın. Sana verilen sınav dosyasını (PDF veya görüntü) dikkatlice analiz et ve aşağıdaki bilgileri JSON olarak döndür.

Analiz kriterleri:

1. questionCount: Sınavdaki toplam soru sayısı (alt soruları sayma, ana soruları say).

2. questionTypes: Soru tiplerinin yüzdelik dağılımı (0-100 arası TAM SAYI, kesir DEĞİL).
   ÖRNEK DOĞRU FORMAT: { "Multiple Choice": 40, "Classic/Open-ended": 40, "True/False": 20 }
   Toplamları tam 100 olmalı.
   - "Multiple Choice": Çoktan seçmeli sorular (A, B, C, D şıkları olan)
   - "Classic/Open-ended": Klasik/açık uçlu sorular (yazılı cevap, ispat, problem çözme)
   - "True/False": Doğru/yanlış soruları

3. topicDistribution: Sınavda işlenen ana konuların yüzdelik dağılımı.
   - 3 ile 6 arası ALT-KONU çıkar (genel ders adını DEĞİL, daha spesifik konuları yaz)
   - ÖRNEK: "Veri Yapıları" yerine → "Ağaç Yapıları", "Hash Tabloları", "Sıralama Algoritmaları" gibi alt başlıklar
   - Konu adlarını TÜRKÇE yaz
   - percentage değeri 0-100 arası TAM SAYI (kesir DEĞİL). ÖRNEK: { "topic": "Ağaç Yapıları", "percentage": 35 }
   - Tüm percentage değerlerinin toplamı 100 olmalı
   - Hiç konu tespit edemezsen boş array [] döndür

4. difficultyScore: Genel zorluk skoru 0-10 arası ondalıklı sayı.
   - 3.0 = kolay, 5.0 = orta, 7.0 = zor, 9.0 = çok zor
   - Soru karmaşıklığı, ön bilgi gereksinimi, hesaplama yoğunluğu dikkate al

5. summary: 3-4 cümlelik TÜRKÇE özet.
   - Profesörün soru sorma stilini özetle
   - Ağırlıklı konuları belirt
   - Genel zorluk hakkında yorum yap
   - Öğrencilere ne tür hazırlık önerirsin kısaca söyle

Önemli: Sınavın hangi dilde yazıldığını otomatik tespit et. Yanıtı sadece JSON formatında ver, başka açıklama ekleme.`;

let cachedClient: GoogleGenAI | null = null;

export function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({ apiKey });
  }
  return cachedClient;
}

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const MAX_RETRIES = 3;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message;
  for (const code of RETRYABLE_STATUS) {
    if (msg.includes(`"code":${code}`) || msg.includes(`${code} `)) return true;
  }
  return /UNAVAILABLE|RESOURCE_EXHAUSTED|DEADLINE_EXCEEDED/i.test(msg);
}

export async function analyzeWithGemini(
  filePath: string,
  mimeType: string
): Promise<AnalysisResult> {
  const client = getClient();
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  const fileBuffer = await fs.readFile(filePath);
  const base64Data = fileBuffer.toString("base64");

  let lastError: unknown;
  let response: Awaited<ReturnType<typeof client.models.generateContent>> | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      response = await client.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType, data: base64Data } },
              { text: PROMPT },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.2,
        },
      });
      break;
    } catch (error) {
      lastError = error;
      if (attempt === MAX_RETRIES || !isRetryable(error)) throw error;
      const backoffMs = 1000 * Math.pow(2, attempt);
      console.warn(
        `[geminiProvider] Attempt ${attempt + 1} failed (retryable), waiting ${backoffMs}ms:`,
        error instanceof Error ? error.message.slice(0, 120) : error
      );
      await sleep(backoffMs);
    }
  }

  if (!response) {
    throw lastError instanceof Error ? lastError : new Error("Gemini failed after retries");
  }

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned empty response");
  }

  const raw: GeminiRawResult = JSON.parse(text);

  return {
    questionCount: raw.questionCount,
    questionTypes: normalizePercentageMap(raw.questionTypes) as AnalysisResult["questionTypes"],
    topicDistribution: normalizeTopicDistribution(raw.topicDistribution),
    difficultyScore: raw.difficultyScore,
    summary: raw.summary,
  };
}

function normalizePercentageMap<T extends Record<string, number>>(input: T): T {
  const values = Object.values(input).filter((v) => typeof v === "number");
  if (values.length === 0) return input;
  const sum = values.reduce((a, b) => a + b, 0);
  // If model returned fractions (0-1), scale to 0-100
  const scale = sum > 0 && sum <= 2 ? 100 : 1;
  const result: Record<string, number> = {};
  for (const [k, v] of Object.entries(input)) {
    result[k] = typeof v === "number" ? Math.round(v * scale) : v;
  }
  return result as T;
}

function normalizeTopicDistribution(
  items: Array<{ topic: string; percentage: number }>
): Record<string, number> {
  const valid = items.filter(
    (it) => it && typeof it.topic === "string" && typeof it.percentage === "number"
  );
  if (valid.length === 0) return {};
  const sum = valid.reduce((a, it) => a + it.percentage, 0);
  const scale = sum > 0 && sum <= 2 ? 100 : 1;
  const result: Record<string, number> = {};
  for (const it of valid) {
    result[it.topic] = Math.round(it.percentage * scale);
  }
  return result;
}

export interface GenerateStyleSummaryOptions {
  userId?: string | null;
}

export interface GenerateStyleSummaryResult {
  text: string;
  model: string;
}

/**
 * Generates the human-readable "Hocanın Tarzı" summary from aggregated
 * exam data. Uses plain-text output (no structured schema) to keep the
 * result natural. Logs every attempt to AICallLog for cost + quality
 * telemetry.
 */
export async function generateStyleSummary(
  input: StyleSummaryInput,
  options: GenerateStyleSummaryOptions = {}
): Promise<GenerateStyleSummaryResult> {
  const client = getClient();
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const { systemInstruction, userPrompt } = buildStyleSummaryPrompt(input);

  const startedAt = Date.now();
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        config: {
          systemInstruction,
          temperature: 0.4,
          responseMimeType: "text/plain",
        },
      });

      const text = response.text?.trim();
      if (!text) throw new Error("Gemini returned empty style summary");

      const usage = response.usageMetadata;
      await recordAICall({
        userId: options.userId,
        feature: "style-summary",
        provider: "gemini",
        model,
        inputTokens: usage?.promptTokenCount ?? 0,
        outputTokens: usage?.candidatesTokenCount ?? 0,
        latencyMs: Date.now() - startedAt,
        success: true,
      });

      return { text, model };
    } catch (error) {
      lastError = error;
      if (attempt === MAX_RETRIES || !isRetryable(error)) {
        await recordAICall({
          userId: options.userId,
          feature: "style-summary",
          provider: "gemini",
          model,
          inputTokens: 0,
          outputTokens: 0,
          latencyMs: Date.now() - startedAt,
          success: false,
          errorCode: error instanceof Error ? error.message.slice(0, 100) : "unknown",
        });
        throw error;
      }
      const backoffMs = 1000 * Math.pow(2, attempt);
      console.warn(
        `[geminiProvider:style-summary] Attempt ${attempt + 1} failed (retryable), waiting ${backoffMs}ms:`,
        error instanceof Error ? error.message.slice(0, 120) : error
      );
      await sleep(backoffMs);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Gemini style summary failed after retries");
}

// --------------------------------------------------------------------
// Study pack (Phase 2)
// --------------------------------------------------------------------

export interface StudyPackTopicSummary {
  topic: string;
  content: string;
}

export interface StudyPackPracticeQuestion {
  question: string;
  type: "MC" | "CLASSIC" | "TF";
  topic: string;
  difficulty: number;
  answer: string;
  rationale: string;
}

export interface StudyPackContent {
  topicSummaries: StudyPackTopicSummary[];
  practiceQuestions: StudyPackPracticeQuestion[];
  profStylePatterns: string[];
}

const studyPackResponseSchema = {
  type: Type.OBJECT,
  properties: {
    topicSummaries: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          content: { type: Type.STRING },
        },
        required: ["topic", "content"],
        propertyOrdering: ["topic", "content"],
      },
    },
    practiceQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["MC", "CLASSIC", "TF"] },
          topic: { type: Type.STRING },
          difficulty: { type: Type.INTEGER },
          answer: { type: Type.STRING },
          rationale: { type: Type.STRING },
        },
        required: [
          "question",
          "type",
          "topic",
          "difficulty",
          "answer",
          "rationale",
        ],
        propertyOrdering: [
          "question",
          "type",
          "topic",
          "difficulty",
          "answer",
          "rationale",
        ],
      },
    },
    profStylePatterns: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ["topicSummaries", "practiceQuestions", "profStylePatterns"],
  propertyOrdering: [
    "topicSummaries",
    "practiceQuestions",
    "profStylePatterns",
  ],
};

export interface GenerateStudyPackOptions {
  userId?: string | null;
}

export interface GenerateStudyPackResult {
  content: StudyPackContent;
  model: string;
  target: TargetDistribution;
}

/**
 * Runs the structured study-pack generation. Always logs to AICallLog
 * with `feature: "study-pack"`. The caller handles caching — this
 * function is stateless and always calls Gemini.
 */
export async function generateStudyPack(
  input: StudyPackPromptInput,
  options: GenerateStudyPackOptions = {}
): Promise<GenerateStudyPackResult> {
  const client = getClient();
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const { systemInstruction, userPrompt, target } = buildStudyPackPrompt(input);

  const startedAt = Date.now();
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        config: {
          systemInstruction,
          temperature: 0.5,
          responseMimeType: "application/json",
          responseSchema: studyPackResponseSchema,
        },
      });

      const text = response.text;
      if (!text) throw new Error("Gemini returned empty study pack");

      const parsed = JSON.parse(text) as StudyPackContent;

      const usage = response.usageMetadata;
      await recordAICall({
        userId: options.userId,
        feature: "study-pack",
        provider: "gemini",
        model,
        inputTokens: usage?.promptTokenCount ?? 0,
        outputTokens: usage?.candidatesTokenCount ?? 0,
        latencyMs: Date.now() - startedAt,
        success: true,
      });

      return { content: parsed, model, target };
    } catch (error) {
      lastError = error;
      if (attempt === MAX_RETRIES || !isRetryable(error)) {
        await recordAICall({
          userId: options.userId,
          feature: "study-pack",
          provider: "gemini",
          model,
          inputTokens: 0,
          outputTokens: 0,
          latencyMs: Date.now() - startedAt,
          success: false,
          errorCode: error instanceof Error ? error.message.slice(0, 100) : "unknown",
        });
        throw error;
      }
      const backoffMs = 1000 * Math.pow(2, attempt);
      console.warn(
        `[geminiProvider:study-pack] Attempt ${attempt + 1} failed (retryable), waiting ${backoffMs}ms:`,
        error instanceof Error ? error.message.slice(0, 120) : error
      );
      await sleep(backoffMs);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Gemini study pack failed after retries");
}

// --------------------------------------------------------------------
// Mock exam (Phase 3)
// --------------------------------------------------------------------

const mockExamResponseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    durationMin: { type: Type.INTEGER },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          q: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["MC", "CLASSIC", "TF"] },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          correctAnswer: { type: Type.STRING },
          topic: { type: Type.STRING },
          difficulty: { type: Type.INTEGER },
          rationale: { type: Type.STRING },
          rubric: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: [
          "q",
          "type",
          "options",
          "correctAnswer",
          "topic",
          "difficulty",
          "rationale",
          "rubric",
        ],
        propertyOrdering: [
          "q",
          "type",
          "options",
          "correctAnswer",
          "topic",
          "difficulty",
          "rationale",
          "rubric",
        ],
      },
    },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          startIdx: { type: Type.INTEGER },
          endIdx: { type: Type.INTEGER },
        },
        required: ["title", "startIdx", "endIdx"],
        propertyOrdering: ["title", "startIdx", "endIdx"],
      },
    },
  },
  required: ["title", "durationMin", "questions", "sections"],
  propertyOrdering: ["title", "durationMin", "questions", "sections"],
};

export interface GenerateMockExamOptions {
  userId?: string | null;
}

export interface GenerateMockExamResult {
  content: MockExamContent;
  model: string;
  target: TargetDistribution;
  questionCount: number;
  durationMin: number;
}

export async function generateMockExam(
  input: MockExamPromptInput,
  options: GenerateMockExamOptions = {}
): Promise<GenerateMockExamResult> {
  const client = getClient();
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const { systemInstruction, userPrompt, target, questionCount, durationMin } =
    buildMockExamPrompt(input);

  const startedAt = Date.now();
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        config: {
          systemInstruction,
          temperature: 0.6,
          responseMimeType: "application/json",
          responseSchema: mockExamResponseSchema,
        },
      });

      const text = response.text;
      if (!text) throw new Error("Gemini returned empty mock exam");

      const parsed = JSON.parse(text) as MockExamContent;

      const usage = response.usageMetadata;
      await recordAICall({
        userId: options.userId,
        feature: "mock-exam",
        provider: "gemini",
        model,
        inputTokens: usage?.promptTokenCount ?? 0,
        outputTokens: usage?.candidatesTokenCount ?? 0,
        latencyMs: Date.now() - startedAt,
        success: true,
      });

      return { content: parsed, model, target, questionCount, durationMin };
    } catch (error) {
      lastError = error;
      if (attempt === MAX_RETRIES || !isRetryable(error)) {
        await recordAICall({
          userId: options.userId,
          feature: "mock-exam",
          provider: "gemini",
          model,
          inputTokens: 0,
          outputTokens: 0,
          latencyMs: Date.now() - startedAt,
          success: false,
          errorCode:
            error instanceof Error ? error.message.slice(0, 100) : "unknown",
        });
        throw error;
      }
      const backoffMs = 1000 * Math.pow(2, attempt);
      console.warn(
        `[geminiProvider:mock-exam] Attempt ${attempt + 1} failed (retryable), waiting ${backoffMs}ms:`,
        error instanceof Error ? error.message.slice(0, 120) : error
      );
      await sleep(backoffMs);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Gemini mock exam failed after retries");
}

// --------------------------------------------------------------------
// Grade answer (CLASSIC only — MC/TF is rule-based)
// --------------------------------------------------------------------

const gradeAnswerResponseSchema = {
  type: Type.OBJECT,
  properties: {
    scoreOutOf100: { type: Type.INTEGER },
    feedback: { type: Type.STRING },
    rubricHits: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          criterion: { type: Type.STRING },
          met: { type: Type.BOOLEAN },
        },
        required: ["criterion", "met"],
        propertyOrdering: ["criterion", "met"],
      },
    },
  },
  required: ["scoreOutOf100", "feedback", "rubricHits"],
  propertyOrdering: ["scoreOutOf100", "feedback", "rubricHits"],
};

export interface GradeAnswerOptions {
  userId?: string | null;
}

export async function gradeClassicAnswer(
  input: GradeAnswerPromptInput,
  options: GradeAnswerOptions = {}
): Promise<GradeAnswerResult> {
  const client = getClient();
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const { systemInstruction, userPrompt } = buildGradeAnswerPrompt(input);

  const startedAt = Date.now();
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        config: {
          systemInstruction,
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: gradeAnswerResponseSchema,
        },
      });

      const text = response.text;
      if (!text) throw new Error("Gemini returned empty grading response");

      const parsed = JSON.parse(text) as GradeAnswerResult;

      const usage = response.usageMetadata;
      await recordAICall({
        userId: options.userId,
        feature: "mock-exam-grade",
        provider: "gemini",
        model,
        inputTokens: usage?.promptTokenCount ?? 0,
        outputTokens: usage?.candidatesTokenCount ?? 0,
        latencyMs: Date.now() - startedAt,
        success: true,
      });

      return parsed;
    } catch (error) {
      lastError = error;
      if (attempt === MAX_RETRIES || !isRetryable(error)) {
        await recordAICall({
          userId: options.userId,
          feature: "mock-exam-grade",
          provider: "gemini",
          model,
          inputTokens: 0,
          outputTokens: 0,
          latencyMs: Date.now() - startedAt,
          success: false,
          errorCode:
            error instanceof Error ? error.message.slice(0, 100) : "unknown",
        });
        throw error;
      }
      const backoffMs = 1000 * Math.pow(2, attempt);
      console.warn(
        `[geminiProvider:mock-exam-grade] Attempt ${attempt + 1} failed (retryable), waiting ${backoffMs}ms:`,
        error instanceof Error ? error.message.slice(0, 120) : error
      );
      await sleep(backoffMs);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Gemini grading failed after retries");
}

export type { MockExamQuestion };
