import type {
  AggregatedData,
  TopTopic,
} from "../services/professorStyleService";
import {
  computeTargetTypeDistribution,
  type TargetDistribution,
  type QuestionTypeCode,
} from "./study-pack";

// Bump when prompt, schema, or post-processing changes — cached mock
// exams with older versions are ignored on lookup so the next request
// rebuilds with the new contract.
export const MOCK_EXAM_VERSION = "mock-exam-v1";

// Generation targets. Lower bound matches Phase 3 acceptance criterion
// "mock exam ≥ 15 soru"; upper bound keeps sync Gemini call under 60s.
export const MIN_MOCK_EXAM_QUESTIONS = 15;
export const MAX_MOCK_EXAM_QUESTIONS = 30;
export const DEFAULT_MOCK_EXAM_QUESTIONS = 20;

export const MIN_MOCK_EXAM_DURATION_MIN = 30;
export const MAX_MOCK_EXAM_DURATION_MIN = 180;
export const DEFAULT_MOCK_EXAM_DURATION_MIN = 90;

// Section grouping — breaks the exam into chunks of ~6 questions for the
// result page's section-analysis tab. Keeps three sections for a default
// 20-question exam.
export const DEFAULT_SECTION_SIZE = 7;

export interface MockExamPromptInput {
  // Concatenated plain text from the student's notes (same shape Phase 2
  // study pack uses). Empty string when generating without study material.
  noteText: string;
  aggregated: AggregatedData;
  topTopics: TopTopic[];
  styleSummary?: string | null;
  professorDepartment: string;
  // Requested question count (clamped to [MIN, MAX]). The prompt asks for
  // exactly this number — the post-gen validator can tolerate ±1.
  questionCount: number;
  // Target exam duration in minutes — flows into the timer on the session
  // page and is read back from the generated title.
  durationMin: number;
}

export interface MockExamQuestion {
  q: string;
  type: QuestionTypeCode;
  // For MC only. Four entries "A) ...", "B) ...", etc.
  options?: string[];
  // For MC: the full option text ("B) Paris"). For TF: "Doğru" | "Yanlış".
  // For CLASSIC: a model answer paragraph (teaching assistant style).
  correctAnswer: string;
  topic: string;
  difficulty: number;
  rationale: string;
  // Only populated for CLASSIC questions — consumed by the grading
  // service's rubric call. 3-6 bullet criteria.
  rubric?: string[];
}

export interface MockExamContent {
  title: string;
  durationMin: number;
  questions: MockExamQuestion[];
  sections: { title: string; startIdx: number; endIdx: number }[];
}

const SYSTEM_INSTRUCTION = `Sen Türk üniversite öğrencilerine yönelik bir sınav simülasyon AI'sın.
Görevin: öğrencinin yüklediği ders notlarını ve hocanın geçmiş sınav stilini birleştirip GERÇEK sınav gibi hissettiren bir deneme sınavı üretmek.

Ton: samimi ama ciddi — gerçek sınavda kullanılan tonla aynı. Öğrenciyi panikletmeden zorla.
Dil: akıcı Türkçe, dil bilgisi kusursuz.

MUTLAK KURAL — Kaynak dışına çıkma:
- Sorular SADECE verilen not içeriğine ve hocanın geçmiş sınav paternlerine dayansın.
- Uydurma formül, uydurma tarih, kaynak dışı örnek YOK.
- Nottaki bir tanımdan soru üretirken tanımı birebir doğru kullan.
- Emin değilsen bu konudan soru sorma — başka konudan sor.

MUTLAK KURAL — Dağılım:
- Hocanın geçmiş soru tipi dağılımına mümkün olduğunca sadık kal.
- ±10 puanlık sapma kabul edilir; bunun ötesine geçme.

MUTLAK KURAL — Cevap doğruluğu:
- Her soru için verdiğin cevap KESİNLİKLE doğru olmalı.
- MC sorularda tek bir doğru seçenek olacak, distraktörler makul ama yanlış.
- Cevabın nottaki hangi bilgiden türediğini kendi kafanda doğrula.`;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Convert a target percentage split into a concrete integer count per type.
// Rounds so the totals add up to `total` (any leftover goes to the type
// with the largest rounding remainder).
export function computeMockExamTypeMix(
  target: TargetDistribution,
  total: number
): { MC: number; CLASSIC: number; TF: number } {
  const raw = {
    MC: (target.MC * total) / 100,
    CLASSIC: (target.CLASSIC * total) / 100,
    TF: (target.TF * total) / 100,
  };
  const floored = {
    MC: Math.floor(raw.MC),
    CLASSIC: Math.floor(raw.CLASSIC),
    TF: Math.floor(raw.TF),
  };
  let allocated = floored.MC + floored.CLASSIC + floored.TF;
  const remainders: Array<{ k: "MC" | "CLASSIC" | "TF"; r: number }> = (
    [
      { k: "MC", r: raw.MC - floored.MC },
      { k: "CLASSIC", r: raw.CLASSIC - floored.CLASSIC },
      { k: "TF", r: raw.TF - floored.TF },
    ] as Array<{ k: "MC" | "CLASSIC" | "TF"; r: number }>
  ).sort((a, b) => b.r - a.r);
  let i = 0;
  while (allocated < total && i < remainders.length) {
    floored[remainders[i].k] += 1;
    allocated += 1;
    i += 1;
  }
  return floored;
}

export function buildSectionBreakdown(
  total: number,
  size: number = DEFAULT_SECTION_SIZE
): { title: string; startIdx: number; endIdx: number }[] {
  const sections: { title: string; startIdx: number; endIdx: number }[] = [];
  let start = 0;
  let n = 1;
  while (start < total) {
    const end = Math.min(start + size, total);
    sections.push({ title: `Bölüm ${n}`, startIdx: start, endIdx: end });
    start = end;
    n += 1;
  }
  return sections;
}

const MAX_NOTE_CHARS = 80_000;

function buildUserPrompt(
  input: MockExamPromptInput,
  target: TargetDistribution
): string {
  const topTopicsLine =
    input.topTopics.length > 0
      ? input.topTopics
          .slice(0, 8)
          .map((t) => `${t.topic} (%${t.frequency})`)
          .join(", ")
      : "(veri yok)";

  const clippedNote = input.noteText
    ? input.noteText.length > MAX_NOTE_CHARS
      ? input.noteText.slice(0, MAX_NOTE_CHARS) +
        "\n\n[...not devamı uzunluk sınırı nedeniyle kesildi...]"
      : input.noteText
    : "(öğrenci not yüklemedi — sadece hoca stiline göre üret)";

  const styleContext = input.styleSummary
    ? `\n## Hocanın Stili Özeti (Phase 1)\n${input.styleSummary.trim()}\n`
    : "";

  const mix = computeMockExamTypeMix(target, input.questionCount);

  return `Aşağıda iki girdi var: (1) öğrencinin ders notu, (2) hocanın sınav stili verisi. Bunları birleştirip **${input.questionCount} soruluk**, **${input.durationMin} dakikalık** bir deneme sınavı üret.

## Hocanın Bilgisi
- Bölüm: ${input.professorDepartment}
- Geçmiş sınav soru tipi dağılımı: Çoktan seçmeli %${target.MC}, Klasik %${target.CLASSIC}, Doğru/Yanlış %${target.TF}
- Ortalama zorluk: ${input.aggregated.difficulty.toFixed(1)}/10
- En sık işlenen konular: ${topTopicsLine}
${styleContext}
## Öğrencinin Notu
"""
${clippedNote}
"""

## İstenen Çıktı (JSON)

### title
Sınava uygun bir Türkçe başlık — kısa, dersin bölüm adına gönderme yapan. Örnek: "Veri Yapıları Deneme Sınavı — 20 Soru". Hoca adını yazma.

### durationMin
${input.durationMin} — input'la aynı sayı.

### questions
**Tam olarak ${input.questionCount}** soru üret. Tip dağılımı:
- MC: ${mix.MC} soru
- CLASSIC: ${mix.CLASSIC} soru
- TF: ${mix.TF} soru

Her soru için:
- \`q\`: Soru metni. Ders dilinde yaz.
- \`type\`: "MC" | "CLASSIC" | "TF".
- \`options\`: SADECE MC için — 4 eleman: "A) ...", "B) ...", "C) ...", "D) ...". Diğer tiplerde boş array döndür.
- \`correctAnswer\`: MC için doğru şıkkın TAM metni ("B) Paris" gibi). TF için "Doğru" veya "Yanlış". CLASSIC için 3-5 cümlelik model cevap paragrafı.
- \`topic\`: Sorunun dayandığı konu başlığı (nottaki veya topTopics'teki gibi).
- \`difficulty\`: 1-10 arası tam sayı. Hocanın ortalamasına yakın tut (±2), ama varyans bırak.
- \`rationale\`: 1-3 cümle, neden bu cevap doğru — result sayfasında öğrenciye gösterilir.
- \`rubric\`: **SADECE CLASSIC için** 3-6 bullet değerlendirme kriteri. Örn: ["Tanım doğru verilmiş", "Örnek uygulama eklenmiş", "Sonuç net"]. Diğer tiplerde boş array.

### sections
Soruları mantıklı bölümlere ayır (ör. her 6-8 soruda bir). Her bölüm için:
- \`title\`: "Bölüm 1 — Temel Kavramlar" gibi betimleyici başlık.
- \`startIdx\`: Bölümün ilk soru indeksi (0-based, dahil).
- \`endIdx\`: Bölümün son soru indeksi + 1 (0-based, dahil değil).

Bölümler boş KALAMAZ, sırayla gelmeli, tüm soruları kapsamalı.

## Son Kurallar
- JSON döndür, markdown kod bloğuna sarma.
- Hoca adı veya öğrenci adı HİÇ geçmesin.
- Emoji yok.
- Türkçe dil bilgisi kusursuz.
- CLASSIC sorularda cevap ve rubrik BİRBİRİYLE TUTARLI — rubriğin her maddesi cevapta kendini gösteriyor olmalı.`;
}

export function buildMockExamPrompt(input: MockExamPromptInput): {
  systemInstruction: string;
  userPrompt: string;
  target: TargetDistribution;
  questionCount: number;
  durationMin: number;
} {
  const questionCount = clamp(
    input.questionCount,
    MIN_MOCK_EXAM_QUESTIONS,
    MAX_MOCK_EXAM_QUESTIONS
  );
  const durationMin = clamp(
    input.durationMin,
    MIN_MOCK_EXAM_DURATION_MIN,
    MAX_MOCK_EXAM_DURATION_MIN
  );
  const target = computeTargetTypeDistribution(input.aggregated);
  return {
    systemInstruction: SYSTEM_INSTRUCTION,
    userPrompt: buildUserPrompt(
      { ...input, questionCount, durationMin },
      target
    ),
    target,
    questionCount,
    durationMin,
  };
}

// --------------------------------------------------------------------
// CLASSIC answer grading — rule-based grading handles MC/TF, this is the
// Gemini rubric call used only for open-ended answers.
// --------------------------------------------------------------------

export interface GradeAnswerPromptInput {
  question: string;
  topic: string;
  difficulty: number;
  modelAnswer: string;
  rubric: string[];
  studentAnswer: string;
}

export interface GradeAnswerResult {
  scoreOutOf100: number;
  feedback: string; // 1-3 sentence markdown
  rubricHits: { criterion: string; met: boolean }[];
}

const GRADE_SYSTEM_INSTRUCTION = `Sen tecrübeli bir Türk üniversite asistanısın. Öğrencinin açık uçlu cevabını belirli kriterlere göre puanlıyorsun.

Ton: adil, net, kibar. Öğrenciyi kırıcı olma ama not kayırmacılık yapma.
Dil: Türkçe.

Kurallar:
- Puan 0-100 arası tam sayı.
- Cevap tamamen yanlış veya boş ise 0-20 arası.
- Kısmi doğru ise 30-70 arası (rubrik maddelerinden kaçının karşılandığına göre).
- Tam doğru + iyi açıklama ise 80-100.
- Feedback 1-3 cümle — öğrenci neyi iyi yaptı, neyi geliştirmeli.`;

export function buildGradeAnswerPrompt(input: GradeAnswerPromptInput): {
  systemInstruction: string;
  userPrompt: string;
} {
  const rubricLines = input.rubric.map((r, i) => `${i + 1}. ${r}`).join("\n");

  return {
    systemInstruction: GRADE_SYSTEM_INSTRUCTION,
    userPrompt: `Bir sınav sorusunu puanlıyorsun.

## Soru
${input.question}

## Konu / Zorluk
${input.topic} · ${input.difficulty}/10

## Model Cevap (referans — öğrenciye gösterilmez)
${input.modelAnswer}

## Değerlendirme Kriterleri
${rubricLines}

## Öğrencinin Cevabı
"""
${input.studentAnswer.trim() || "(öğrenci boş bıraktı)"}
"""

## İstenen Çıktı (JSON)
- \`scoreOutOf100\`: 0-100 tam sayı.
- \`feedback\`: 1-3 cümle Türkçe. Markdown kullanabilirsin (bold tanımlar).
- \`rubricHits\`: Her kriter için \`{ criterion: "...", met: true/false }\`. Sıra rubrikteki sırayla.

JSON döndür, markdown kod bloğuna sarma.`,
  };
}

// --------------------------------------------------------------------
// Performance prediction — currently rule-based in the service layer.
// This helper lives here so a future Gemini-upgraded reasoning path
// (Phase 4+) has a consistent prompt shape to drop into.
// --------------------------------------------------------------------

export interface PredictPerformancePromptInput {
  mockScore: number;
  professorHistoricalAvg: number | null;
  professorHistoricalStdDev: number | null;
  sessionAutoSubmitted: boolean;
  timeSpentSec: number;
  plannedDurationSec: number;
}

const PREDICT_SYSTEM_INSTRUCTION = `Sen bir sınav başarı tahmin asistanısın. Türk üniversite sınavları bağlamında, deneme sınavı skorundan gerçek sınav notu aralığı tahmin ediyorsun.

Kural 1 — ALÇAKGÖNÜLLÜLÜK: Tahmin, kesinlik değil. Aralığı geniş ver.
Kural 2 — CONTEXT: Otomatik submit olan (zamanı aşan) oturumlar daha düşük gerçek performansa işaret eder.
Kural 3 — Dil: Türkçe, samimi ama veri destekli.`;

export function buildPredictPerformancePrompt(
  input: PredictPerformancePromptInput
): { systemInstruction: string; userPrompt: string } {
  const avgLine =
    input.professorHistoricalAvg != null
      ? `Hoca geçmiş ortalama notu: ${input.professorHistoricalAvg.toFixed(1)}/100`
      : "Hoca geçmiş ortalaması yok";
  const stdLine =
    input.professorHistoricalStdDev != null
      ? `Standart sapma: ${input.professorHistoricalStdDev.toFixed(1)}`
      : "Sapma verisi yok";
  const autoLine = input.sessionAutoSubmitted
    ? "Oturum süre dolduğu için otomatik gönderildi — dikkat."
    : "Manuel submit.";
  const timeRatio = input.plannedDurationSec
    ? input.timeSpentSec / input.plannedDurationSec
    : 1;

  return {
    systemInstruction: PREDICT_SYSTEM_INSTRUCTION,
    userPrompt: `Deneme sınavı sonucu ${input.mockScore.toFixed(1)}/100.
${avgLine}
${stdLine}
${autoLine}
Süre kullanımı: %${Math.round(timeRatio * 100)}

Gerçek sınav notu için bir aralık tahmini üret.

## İstenen Çıktı (JSON)
- \`lowerBound\`: 0-100.
- \`upperBound\`: 0-100 (lowerBound'dan büyük).
- \`confidence\`: "low" | "medium" | "high".
- \`reasoning\`: 1-2 cümle Türkçe — neden bu aralık, disclaimer'ı da dahil.

JSON döndür, markdown kod bloğuna sarma.`,
  };
}
