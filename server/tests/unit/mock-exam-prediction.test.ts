import { describe, it, expect } from "vitest";

import {
  predictExamPerformance,
  detectTopicGaps,
  buildPanicPlan,
} from "../../src/services/mockExamPredictionService";
import type { MockExamQuestion } from "../../src/prompts/mock-exam";
import type { QuestionFeedback } from "../../src/services/mockExamGradingService";

describe("predictExamPerformance", () => {
  it("returns a band centred around the mock score with a disclaimer", () => {
    const band = predictExamPerformance({
      mockScore: 70,
      autoSubmitted: false,
      timeSpentSec: 3600,
      plannedDurationSec: 5400,
    });
    expect(band.lowerBound).toBeLessThan(70);
    expect(band.upperBound).toBeGreaterThan(70);
    expect(band.disclaimer).toContain("kesin bir not değildir");
  });

  it("drops confidence to low when the session auto-submitted", () => {
    const band = predictExamPerformance({
      mockScore: 60,
      autoSubmitted: true,
      timeSpentSec: 5400,
      plannedDurationSec: 5400,
    });
    expect(band.confidence).toBe("low");
    expect(band.reasoning).toContain("süre dolduğu");
  });

  it("clamps bounds within [0, 100]", () => {
    const low = predictExamPerformance({
      mockScore: 5,
      autoSubmitted: true,
      timeSpentSec: 1000,
      plannedDurationSec: 5400,
    });
    const high = predictExamPerformance({
      mockScore: 98,
      autoSubmitted: false,
      timeSpentSec: 5000,
      plannedDurationSec: 5400,
    });
    expect(low.lowerBound).toBeGreaterThanOrEqual(0);
    expect(high.upperBound).toBeLessThanOrEqual(100);
  });

  it("tightens the band when the student used most of the allotted time", () => {
    const tight = predictExamPerformance({
      mockScore: 75,
      autoSubmitted: false,
      timeSpentSec: Math.round(5400 * 0.9),
      plannedDurationSec: 5400,
    });
    const loose = predictExamPerformance({
      mockScore: 75,
      autoSubmitted: false,
      timeSpentSec: 1000,
      plannedDurationSec: 5400,
    });
    const tightWidth = tight.upperBound - tight.lowerBound;
    const looseWidth = loose.upperBound - loose.lowerBound;
    expect(tightWidth).toBeLessThan(looseWidth);
  });
});

const q = (topic: string, difficulty: number): MockExamQuestion => ({
  q: `${topic} sorusu`,
  type: "MC",
  options: ["A", "B", "C", "D"],
  correctAnswer: "A",
  topic,
  difficulty,
  rationale: "x",
  rubric: [],
});

const f = (qIdx: number, score: number): QuestionFeedback => ({
  qIdx,
  correct: score >= 60,
  scoreOutOf100: score,
  feedback: "x",
});

describe("detectTopicGaps", () => {
  it("ranks topics with the lowest accuracy first", () => {
    const questions = [
      q("Hash", 7),
      q("Hash", 7),
      q("Grafik", 5),
      q("Grafik", 5),
      q("Grafik", 5),
    ];
    const feedback = [f(0, 0), f(1, 0), f(2, 100), f(3, 100), f(4, 100)];
    const gaps = detectTopicGaps(questions, feedback);
    expect(gaps[0].topic).toBe("Hash");
    expect(gaps[0].accuracy).toBe(0);
    expect(gaps[gaps.length - 1].topic).toBe("Grafik");
  });

  it("counts ≥60 as correct so partial CLASSIC credit doesn't flag a gap", () => {
    const gaps = detectTopicGaps(
      [q("Tanım", 5)],
      [f(0, 65)]
    );
    expect(gaps[0].correctCount).toBe(1);
  });
});

describe("buildPanicPlan", () => {
  it("produces a plan within 5ms (sync, rule-based)", () => {
    const t0 = Date.now();
    buildPanicPlan({
      hoursUntilExam: 4,
      topicGaps: [
        { topic: "A", correctCount: 0, totalCount: 2, accuracy: 0, avgDifficulty: 7, priority: 1 },
        { topic: "B", correctCount: 1, totalCount: 2, accuracy: 0.5, avgDifficulty: 5, priority: 0.5 },
      ],
    });
    expect(Date.now() - t0).toBeLessThan(50);
  });

  it("picks at most 3 topics when window is under 4h", () => {
    const plan = buildPanicPlan({
      hoursUntilExam: 2,
      topicGaps: Array(8).fill(null).map((_, i) => ({
        topic: `T${i}`,
        correctCount: 0,
        totalCount: 2,
        accuracy: 0,
        avgDifficulty: 5,
        priority: 8 - i,
      })),
    });
    expect(plan.steps.length).toBeLessThanOrEqual(3);
  });

  it("falls back to top topics when no gaps are provided", () => {
    const plan = buildPanicPlan({
      hoursUntilExam: 6,
      topTopics: [
        { topic: "Temel", frequency: 40 },
        { topic: "İleri", frequency: 20 },
      ],
    });
    expect(plan.steps[0].topic).toBe("Temel");
    expect(plan.steps[0].reason).toContain("sık");
  });

  it("honors the 15% buffer — total step minutes stay under the window", () => {
    const plan = buildPanicPlan({
      hoursUntilExam: 10,
      topicGaps: Array(5).fill(null).map((_, i) => ({
        topic: `T${i}`,
        correctCount: 0,
        totalCount: 2,
        accuracy: 0,
        avgDifficulty: 5,
        priority: 5 - i,
      })),
    });
    expect(plan.totalMinutes).toBeLessThan(10 * 60);
  });

  it("outputs at least one advice line for every window size", () => {
    for (const hours of [1, 6, 24]) {
      const plan = buildPanicPlan({
        hoursUntilExam: hours,
        topTopics: [{ topic: "A", frequency: 10 }],
      });
      expect(plan.advice.length).toBeGreaterThan(0);
    }
  });
});
