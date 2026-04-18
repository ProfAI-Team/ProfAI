import { analyzeWithGemini } from "./llm/geminiProvider";
import { featureLogger } from "../lib/logger";

const log = featureLogger("analysisService");

export interface QuestionTypes {
  "Multiple Choice": number;
  "Classic/Open-ended": number;
  "True/False": number;
}

export interface TopicDistribution {
  [topic: string]: number;
}

export interface AnalysisResult {
  questionCount: number;
  questionTypes: QuestionTypes;
  topicDistribution: TopicDistribution;
  difficultyScore: number;
  summary: string;
}

const SAMPLE_TOPICS = [
  "Veri Yapıları",
  "Algoritmalar",
  "Nesne Yönelimli Programlama",
  "Veritabanı Tasarımı",
  "Bilgisayar Ağları",
  "İşletim Sistemleri",
  "Makine Öğrenmesi",
  "Lineer Cebir",
  "Kalkülüs",
  "İstatistik",
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 1): number {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

function generateMockResult(): AnalysisResult {
  const mc = randomInt(20, 60);
  const tf = randomInt(10, Math.min(40, 100 - mc));
  const oe = 100 - mc - tf;

  const numTopics = randomInt(4, 6);
  const shuffled = [...SAMPLE_TOPICS].sort(() => Math.random() - 0.5);
  const selectedTopics = shuffled.slice(0, numTopics);

  const topicDistribution: TopicDistribution = {};
  let remaining = 100;
  for (let i = 0; i < selectedTopics.length; i++) {
    if (i === selectedTopics.length - 1) {
      topicDistribution[selectedTopics[i]] = remaining;
    } else {
      const maxShare = remaining - (selectedTopics.length - i - 1) * 5;
      const share = randomInt(10, Math.min(40, maxShare));
      topicDistribution[selectedTopics[i]] = share;
      remaining -= share;
    }
  }

  const questionCount = randomInt(10, 30);
  const difficultyScore = randomFloat(3.0, 9.0);
  const summary =
    `Bu sınav ${questionCount} sorudan oluşmaktadır ve zorluk skoru ${difficultyScore}/10 olarak değerlendirilmiştir. ` +
    `Sınav öncelikle çoktan seçmeli sorulardan oluşmaktadır. ` +
    `Öğrencilerin temel konulara odaklanması önerilir. ` +
    `(Bu sonuçlar Gemini API erişilemediği için yedek olarak üretilmiştir.)`;

  return {
    questionCount,
    questionTypes: {
      "Multiple Choice": mc,
      "Classic/Open-ended": oe,
      "True/False": tf,
    },
    topicDistribution,
    difficultyScore,
    summary,
  };
}

export async function analyzeExam(
  filePath: string,
  mimeType: string
): Promise<AnalysisResult> {
  if (!process.env.GEMINI_API_KEY) {
    log.warn("GEMINI_API_KEY not set — falling back to mock analysis");
    return generateMockResult();
  }

  try {
    return await analyzeWithGemini(filePath, mimeType);
  } catch (error) {
    log.error({ err: error }, "Gemini analysis failed, using mock fallback");
    return generateMockResult();
  }
}
