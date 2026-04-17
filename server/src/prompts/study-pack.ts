import type {
  AggregatedData,
  TopTopic,
} from "../services/professorStyleService";

// Bump when the prompt, schema, or post-processing changes — cached study
// packs with older versions are ignored on lookup so the next request
// rebuilds with the new contract.
export const STUDY_PACK_VERSION = "study-pack-v1";

// Generation targets. Topic summaries and practice questions both have a
// floor matching the Phase 2 acceptance criteria.
export const MIN_TOPIC_SUMMARIES = 3;
export const MIN_PRACTICE_QUESTIONS = 5;
export const MAX_PRACTICE_QUESTIONS = 10;

export type QuestionTypeCode = "MC" | "CLASSIC" | "TF";

export interface StudyPackPromptInput {
  // Concatenated plain text from all StudentNotes in the pack (ordered by
  // note id so the hash is stable).
  noteText: string;
  // Rendered aggregated style profile — same shape Phase 1 computes.
  aggregated: AggregatedData;
  // Top topics (already sorted, already frequency-weighted) surfaced in
  // the UI. Used as hints for which topics to prioritize.
  topTopics: TopTopic[];
  // "Hocanın Tarzı" paragraph from Phase 1 — pasted in as context so the
  // study pack stays consistent with what the student already read.
  styleSummary?: string | null;
  // Professor department (used for tone, e.g. math vs. humanities) —
  // never the name (privacy + prompt injection avoidance).
  professorDepartment: string;
}

export interface TargetDistribution {
  MC: number; // 0-100
  CLASSIC: number; // 0-100
  TF: number; // 0-100
}

// Derive the target MC / Classic / TF split from the aggregated exam data.
// Used by the prompt to anchor the generator and by the post-process
// validator to check the ±10% acceptance criterion.
export function computeTargetTypeDistribution(
  aggregated: AggregatedData
): TargetDistribution {
  const qt = aggregated.questionTypes;
  const total =
    qt["Multiple Choice"] + qt["Classic/Open-ended"] + qt["True/False"];
  if (total <= 0) {
    // Fall back to a sensible default — mirrors the computed mean across
    // the seed corpus so an empty profile still produces a varied pack.
    return { MC: 50, CLASSIC: 40, TF: 10 };
  }
  return {
    MC: Math.round((qt["Multiple Choice"] / total) * 100),
    CLASSIC: Math.round((qt["Classic/Open-ended"] / total) * 100),
    TF: Math.round((qt["True/False"] / total) * 100),
  };
}

// ±10 percentage-point tolerance window, per Phase 2 acceptance criteria.
export const DISTRIBUTION_TOLERANCE = 10;

export function isDistributionWithinTolerance(
  actual: TargetDistribution,
  target: TargetDistribution,
  tolerance: number = DISTRIBUTION_TOLERANCE
): boolean {
  return (
    Math.abs(actual.MC - target.MC) <= tolerance &&
    Math.abs(actual.CLASSIC - target.CLASSIC) <= tolerance &&
    Math.abs(actual.TF - target.TF) <= tolerance
  );
}

const SYSTEM_INSTRUCTION = `Sen Türk üniversite öğrencilerine yönelik bir kişisel ders asistanı AI'sın.
Görevin: öğrencinin kendi yüklediği ders notlarını, hocanın sınav stili profiliyle birleştirip yapılandırılmış bir çalışma paketi üretmek.

Ton: samimi ama akademik, güven veren, veri destekli. Pazarlama klişesi yok; "sen" diye hitap et.
Dil: akıcı Türkçe, dil bilgisi kusursuz.

MUTLAK KURAL — Kaynak dışına çıkma:
- Sadece verilen not içeriğine dayan. Uydurma kavram, uydurma formül, kaynak dışı örnek ekleme.
- Emin değilsen "not içeriğinde bu konu işlenmemiş" şeklinde açıkça belirt.
- Tarih, isim, sayısal veri: sadece nottaki haliyle kullan.`;

// Max chars we pass to Gemini. The model reads ~1M tokens but we want to
// keep latency bounded for Phase 2 sync generation. ~100K chars ≈ 25K
// tokens which is plenty for typical course material.
const MAX_NOTE_CHARS = 100_000;

function buildUserPrompt(
  input: StudyPackPromptInput,
  target: TargetDistribution
): string {
  const topTopicsLine =
    input.topTopics.length > 0
      ? input.topTopics
          .slice(0, 6)
          .map((t) => `${t.topic} (%${t.frequency})`)
          .join(", ")
      : "(veri yok)";

  const styleContext = input.styleSummary
    ? `\n## Hocanın Stili Özeti (Phase 1 çıktısı)\n${input.styleSummary.trim()}\n`
    : "";

  const clippedNote =
    input.noteText.length > MAX_NOTE_CHARS
      ? input.noteText.slice(0, MAX_NOTE_CHARS) +
        "\n\n[...not devamı uzunluk sınırı nedeniyle kesildi...]"
      : input.noteText;

  return `Aşağıda iki girdi var: (1) öğrencinin kendi ders notu, (2) hocanın sınav stili hakkında agregasyon verisi. Bunları birleştirip bir çalışma paketi üret.

## Hocanın Bilgisi
- Bölüm: ${input.professorDepartment}
- Soru tipi dağılımı (geçmiş sınavlar): Çoktan seçmeli %${target.MC}, Klasik %${target.CLASSIC}, Doğru/Yanlış %${target.TF}
- Ortalama zorluk: ${input.aggregated.difficulty.toFixed(1)}/10
- En sık işlenen konular: ${topTopicsLine}
${styleContext}
## Öğrencinin Notu
"""
${clippedNote}
"""

## İstenen Çıktı (JSON)

### topicSummaries
Nottaki konuları mantıklı başlıklara böl ve her biri için bir özet yaz. **En az ${MIN_TOPIC_SUMMARIES}** konu özeti olsun.
- \`topic\`: Kısa, net konu başlığı (3-7 kelime).
- \`content\`: Markdown destekli özet. Kritik tanımlar **kalın**, formüller \`backtick\` içinde. 120-250 kelime.
- Kaynak dışına çıkma. Nottaki kavramları açıkla; eksik yer varsa "nota göre" diye başla.

### practiceQuestions
**${MIN_PRACTICE_QUESTIONS}-${MAX_PRACTICE_QUESTIONS}** adet pratik soru üret. Soru tipleri hocanın dağılımına SADIK kalsın:
- Yaklaşık %${target.MC} tipi "MC" (Multiple Choice)
- Yaklaşık %${target.CLASSIC} tipi "CLASSIC" (Klasik/açık uçlu)
- Yaklaşık %${target.TF} tipi "TF" (Doğru/Yanlış)
Hocanın dağılımı ±10 puan içinde olmalı — **tam sayıya yuvarla, toplama 100 zorunlu değil** ama oran tutmalı.

Her soru için:
- \`question\`: Soru metni.
- \`type\`: "MC" | "CLASSIC" | "TF".
- \`topic\`: Sorunun hangi topicSummary başlığıyla ilişkili olduğu.
- \`difficulty\`: 1-10 arası tam sayı (hocanın ortalamasına yakın tut, ±2).
- \`answer\`: Doğru cevap (MC için seçeneklerden biri, CLASSIC için model cevap paragrafı, TF için "Doğru"/"Yanlış").
- \`rationale\`: 1-3 cümlelik gerekçe — neden bu cevap, öğrenci nereye odaklanmalı.

MC soruları için cevap içinde seçenekleri "A)", "B)", "C)", "D)" formatında sun.

### profStylePatterns
Öğrenciye "bu hoca nasıl sorar" hatırlatıcısı — 2-5 kısa bullet. Hocanın geçmiş sınav verisine ve öğrencinin notuna dayanan gerçek paternler.
Örnekler: "son 3 sınavda Laplace dönüşümü bonus soruydu", "formül ezberinden çok ispat istiyor", "bir klasik soru hep ünite sonu tanımından çıkıyor".
Jenerik tavsiye (ör. "çok çalış") yazma.

## Son Kurallar
- JSON döndür, markdown kod bloğuna sarma.
- Hoca adını HİÇ kullanma. "Bu hoca" / "bu öğretim üyesi" de. Sadece veriye referans ver.
- Emoji kullanma.
- Türkçe dil bilgisi kusursuz.`;
}

export function buildStudyPackPrompt(input: StudyPackPromptInput): {
  systemInstruction: string;
  userPrompt: string;
  target: TargetDistribution;
} {
  const target = computeTargetTypeDistribution(input.aggregated);
  return {
    systemInstruction: SYSTEM_INSTRUCTION,
    userPrompt: buildUserPrompt(input, target),
    target,
  };
}
