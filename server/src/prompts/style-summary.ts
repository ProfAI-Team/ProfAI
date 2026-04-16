import type {
  AggregatedData,
  EvolutionPoint,
  StyleMetrics,
  TopTopic,
} from "../services/professorStyleService";

// Bump this when the prompt or post-processing changes so cached profiles
// get rebuilt on the next request.
export const STYLE_SUMMARY_VERSION = "style-summary-v1";

export interface StyleSummaryInput {
  aggregated: AggregatedData;
  topTopics: TopTopic[];
  evolution: EvolutionPoint[];
  metrics: StyleMetrics;
}

const SYSTEM_INSTRUCTION = `Sen Türk üniversite öğrencilerine yönelik bir akademik analiz AI'sın.
Görevin, bir profesörün geçmiş sınavlarının agregasyon verisinden o hocanın öğretim tarzını özetlemektir.
Ton: samimi ama akademik, güven veren, veri destekli.
Dil: akıcı Türkçe, dil bilgisi kusursuz.
KURAL: sadece verilen veriye dayan — uydurma, tahmin ekleme.`;

function buildUserPrompt(input: StyleSummaryInput): string {
  const qt = input.aggregated.questionTypes;
  const topicList = input.topTopics
    .slice(0, 5)
    .map((t) => `${t.topic} (%${t.frequency})`)
    .join(", ");

  const evolutionSummary =
    input.evolution.length >= 2
      ? `${input.evolution[0].year}'dan ${input.evolution[input.evolution.length - 1].year}'a: ${input.evolution.length} dönem veri.`
      : "Tek dönem veri.";

  return `Aşağıdaki veriye dayanarak **3-4 cümle**, **60-100 kelime** uzunluğunda "Hocanın Tarzı" özeti yaz.

## Veri
- Toplam analiz edilmiş sınav: ${input.metrics.totalExams}
- Ortalama zorluk skoru: ${input.metrics.avgDifficulty}/10
- Ortalama soru sayısı: ${input.metrics.avgQuestionCount}
- Baskın soru tipi: ${input.metrics.dominantType ?? "yok"}
- Soru tipi dağılımı: Çoktan seçmeli %${qt["Multiple Choice"]}, Klasik %${qt["Classic/Open-ended"]}, Doğru/Yanlış %${qt["True/False"]}
- En sık işlenen konular: ${topicList}
- Zamansal profil: ${evolutionSummary}

## Kurallar
- Hoca adını KULLANMA; "bu profesör" veya "bu öğretim üyesi" gibi genel ifade kullan.
- Yüzdelik verileri anlamlı cümlelere çevir (ör. "sınavların yaklaşık yarısı çoktan seçmeli").
- Baskın konulardan 1-2'sini somut şekilde belirt.
- Zorluk skorunu doğal bir yorumla değerlendir (3 = kolay, 5 = orta, 7 = zor, 9 = çok zor).
- Son cümlede öğrenciye **pratik bir çalışma tavsiyesi** ver.
- JSON değil — sadece düz metin döndür.
- Markdown başlığı, madde işareti veya emoji kullanma.

Özet:`;
}

export function buildStyleSummaryPrompt(input: StyleSummaryInput): {
  systemInstruction: string;
  userPrompt: string;
} {
  return {
    systemInstruction: SYSTEM_INSTRUCTION,
    userPrompt: buildUserPrompt(input),
  };
}
