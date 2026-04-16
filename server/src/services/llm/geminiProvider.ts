import fs from "fs/promises";
import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from "../analysisService";

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

function getClient(): GoogleGenAI {
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
