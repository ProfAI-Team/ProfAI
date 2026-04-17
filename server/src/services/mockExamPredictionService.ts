import type { MockExamQuestion } from "../prompts/mock-exam";
import type { QuestionFeedback } from "./mockExamGradingService";

// --------------------------------------------------------------------
// Performance prediction
// --------------------------------------------------------------------

export interface PredictionBand {
  lowerBound: number;
  upperBound: number;
  confidence: "low" | "medium" | "high";
  reasoning: string;
  // Disclaimer string the UI renders verbatim — Phase 3 spec explicitly
  // calls out "tahmin, kesinlik değil" framing.
  disclaimer: string;
}

export interface PredictInput {
  mockScore: number;
  autoSubmitted: boolean;
  timeSpentSec: number;
  plannedDurationSec: number;
  avgDifficulty?: number | null;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

const DISCLAIMER =
  "Bu tahmin mevcut verilere dayanan geniş bir aralıktır — kesin bir not değildir.";

export function predictExamPerformance(input: PredictInput): PredictionBand {
  const score = clamp(input.mockScore, 0, 100);
  const ratio =
    input.plannedDurationSec > 0
      ? input.timeSpentSec / input.plannedDurationSec
      : 1;

  // Baseline window: roughly ±10 around the mock score.
  let lowerDelta = 10;
  let upperDelta = 8;
  let confidence: PredictionBand["confidence"] = "medium";
  const reasons: string[] = [];

  // Auto-submission means the timer ran out — typically a signal of
  // weaker performance under time pressure.
  if (input.autoSubmitted) {
    lowerDelta += 8;
    upperDelta -= 3;
    confidence = "low";
    reasons.push("süre dolduğu için otomatik gönderildi");
  }

  // Very fast completion (<30% of allotted time) can indicate either
  // mastery or surrender — we can't tell, so widen the window.
  if (ratio < 0.3) {
    lowerDelta += 5;
    upperDelta += 5;
    confidence = "low";
    reasons.push("sınavı çok hızlı bitirdin (süre az kullanıldı)");
  } else if (ratio > 0.85 && !input.autoSubmitted) {
    // Used most of the allotted time but didn't auto-submit — a calm,
    // full attempt. Slightly tighter range.
    lowerDelta = Math.max(lowerDelta - 2, 6);
    upperDelta = Math.max(upperDelta - 1, 5);
    if (confidence === "medium") confidence = "high";
    reasons.push("süreyi dengeli kullandın");
  }

  // Harder-than-average mock exam → real exam likely tracks lower.
  if (input.avgDifficulty != null && input.avgDifficulty >= 7.5) {
    lowerDelta += 3;
    reasons.push("hocanın sınavı genelde zorlu");
  }

  const lowerBound = Math.round(clamp(score - lowerDelta, 0, 100));
  const upperBound = Math.round(clamp(score + upperDelta, 0, 100));

  const reasoning =
    reasons.length > 0
      ? `Tahmin aralığı şu işaretlere göre ayarlandı: ${reasons.join(", ")}.`
      : "Mock sınav skoruna yakın bir aralık verildi.";

  return {
    lowerBound,
    upperBound,
    confidence,
    reasoning,
    disclaimer: DISCLAIMER,
  };
}

// --------------------------------------------------------------------
// Topic gap detection
// --------------------------------------------------------------------

export interface TopicGap {
  topic: string;
  correctCount: number;
  totalCount: number;
  accuracy: number; // 0-1
  avgDifficulty: number;
  priority: number; // higher = needs more attention
}

export function detectTopicGaps(
  questions: MockExamQuestion[],
  feedback: QuestionFeedback[]
): TopicGap[] {
  const byTopic = new Map<
    string,
    { correct: number; total: number; difficultySum: number }
  >();

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const f = feedback[i];
    if (!f) continue;
    const bucket = byTopic.get(q.topic) ?? {
      correct: 0,
      total: 0,
      difficultySum: 0,
    };
    bucket.total += 1;
    bucket.difficultySum += q.difficulty;
    // "Correct" = ≥60/100 so a partially-credited CLASSIC counts as a
    // passable showing rather than a gap.
    if (f.scoreOutOf100 >= 60) bucket.correct += 1;
    byTopic.set(q.topic, bucket);
  }

  const gaps: TopicGap[] = [];
  for (const [topic, b] of byTopic) {
    const accuracy = b.total > 0 ? b.correct / b.total : 0;
    const avgDifficulty = b.total > 0 ? b.difficultySum / b.total : 0;
    // Higher priority when accuracy is low AND topic is hard AND there
    // are more questions on it (more signal, not a fluke).
    const priority =
      (1 - accuracy) * (avgDifficulty / 10) * Math.log2(1 + b.total);
    gaps.push({
      topic,
      correctCount: b.correct,
      totalCount: b.total,
      accuracy,
      avgDifficulty,
      priority,
    });
  }

  return gaps.sort((a, b) => b.priority - a.priority);
}

// --------------------------------------------------------------------
// Panic mode
// --------------------------------------------------------------------

export interface PanicPlanInput {
  hoursUntilExam: number;
  // Gaps from a recent mock exam session. When absent, the caller will
  // seed from the professor's top topics (handled in the controller).
  topicGaps?: TopicGap[];
  // Fallback — used only when topicGaps is empty. Each entry is a topic
  // frequency from the style profile.
  topTopics?: { topic: string; frequency: number }[];
  // Reserved for future Gemini-upgraded reasoning; unused today so the
  // plan comes back in <1ms.
  professorDepartment?: string;
}

export interface PanicPlanStep {
  topic: string;
  minutes: number;
  reason: string;
  suggestion: string;
}

export interface PanicPlan {
  totalMinutes: number;
  hoursUntilExam: number;
  steps: PanicPlanStep[];
  // Advice lines the UI renders above the steps — short, supportive,
  // never alarmist.
  advice: string[];
}

const MIN_MINUTES_PER_TOPIC = 10;

function minutesPerTopicSlot(totalMinutes: number, slots: number): number {
  if (slots <= 0) return 0;
  const raw = totalMinutes / slots;
  return Math.max(MIN_MINUTES_PER_TOPIC, Math.floor(raw));
}

export function buildPanicPlan(input: PanicPlanInput): PanicPlan {
  const hours = Math.max(0.5, Math.min(input.hoursUntilExam, 72));
  // Keep 15% of the time for mixed review / break / meals — not all of
  // it gets allocated into topic-study slots.
  const allocatableMinutes = Math.floor(hours * 60 * 0.85);

  let candidateTopics: Array<{ topic: string; priority: number; accuracy?: number }> =
    [];

  if (input.topicGaps && input.topicGaps.length > 0) {
    candidateTopics = input.topicGaps.map((g) => ({
      topic: g.topic,
      priority: g.priority,
      accuracy: g.accuracy,
    }));
  } else if (input.topTopics && input.topTopics.length > 0) {
    const maxFreq = Math.max(...input.topTopics.map((t) => t.frequency), 1);
    candidateTopics = input.topTopics.map((t) => ({
      topic: t.topic,
      priority: t.frequency / maxFreq,
    }));
  }

  // Cap the number of topics so short windows stay focused — you can't
  // meaningfully cover 10 topics in 2 hours.
  const maxSlots = hours < 4 ? 3 : hours < 12 ? 5 : 7;
  const picked = candidateTopics.slice(0, maxSlots);

  const perSlot = minutesPerTopicSlot(allocatableMinutes, picked.length);
  const steps: PanicPlanStep[] = picked.map((p, idx) => ({
    topic: p.topic,
    minutes: perSlot,
    reason:
      p.accuracy != null
        ? `Bu konuda doğruluk oranın %${Math.round(p.accuracy * 100)} — önce burayı sağlamlaştır.`
        : `Bu konu hocanın sınavlarında en sık görülenler arasında.`,
    suggestion:
      idx === 0
        ? "Tanımları + bir çözülmüş örnekle başla."
        : "Bir önceki konudan hızlıca geç, notların özetine dön.",
  }));

  const totalMinutes = steps.reduce((sum, s) => sum + s.minutes, 0);

  const advice: string[] = [];
  if (hours < 3) {
    advice.push("Panik yok — kısa süre kaldı, en zayıf 1-2 konuya odaklan.");
    advice.push("Yeni konu açmak yerine çözülmüş sorulara bak.");
  } else if (hours < 12) {
    advice.push("Uyuma süresini kısaltma; 6-7 saat uyku ezberden önemli.");
    advice.push("Her konu arası kısa mola — telefon yok.");
  } else {
    advice.push("Vaktin var; her gün ders başı en zor konuyla başla.");
    advice.push("Günde en az 7 saat uyku planla.");
  }

  return {
    totalMinutes,
    hoursUntilExam: hours,
    steps,
    advice,
  };
}
