import { describe, it, expect } from "vitest";

import {
  inferStyle,
  MIN_QUESTIONS_FOR_STYLE,
} from "../../src/services/learningStyleService";

describe("learningStyleService.inferStyle (pure)", () => {
  it("returns null when under the minimum question count", () => {
    const responses = Array.from({ length: MIN_QUESTIONS_FOR_STYLE - 1 }, () => ({
      type: "MC",
      correct: true,
    }));
    const result = inferStyle(responses);
    expect(result.style).toBeNull();
    expect(result.totalAnswered).toBe(MIN_QUESTIONS_FOR_STYLE - 1);
  });

  it("ignores unknown question types", () => {
    const responses = Array.from({ length: 25 }, () => ({
      type: "ESSAY", // unmapped
      correct: true,
    }));
    const result = inferStyle(responses);
    expect(result.totalAnswered).toBe(0);
    expect(result.style).toBeNull();
  });

  it("picks 'reading' when MC/TF dominates kinesthetic by >= 15pp", () => {
    const responses = [
      ...Array.from({ length: 15 }, () => ({ type: "MC", correct: true })),
      ...Array.from({ length: 5 }, () => ({ type: "MC", correct: false })),
      // 20 MC total, accuracy 0.75

      ...Array.from({ length: 3 }, () => ({ type: "SA", correct: true })),
      ...Array.from({ length: 7 }, () => ({ type: "SA", correct: false })),
      // 10 SA total, accuracy 0.30
    ];
    const result = inferStyle(responses);
    expect(result.totalAnswered).toBe(30);
    expect(result.style).toBe("reading");
    expect(result.breakdown.reading.total).toBe(20);
    expect(result.breakdown.kinesthetic.total).toBe(10);
  });

  it("picks 'kinesthetic' when SA dominates MC by >= 15pp", () => {
    const responses = [
      ...Array.from({ length: 5 }, () => ({ type: "MC", correct: true })),
      ...Array.from({ length: 15 }, () => ({ type: "MC", correct: false })),
      // 20 MC, 0.25 accuracy

      ...Array.from({ length: 9 }, () => ({ type: "SA", correct: true })),
      ...Array.from({ length: 1 }, () => ({ type: "SA", correct: false })),
      // 10 SA, 0.90 accuracy
    ];
    const result = inferStyle(responses);
    expect(result.style).toBe("kinesthetic");
  });

  it("returns 'mixed' when two buckets are within 15pp", () => {
    const responses = [
      ...Array.from({ length: 14 }, () => ({ type: "MC", correct: true })),
      ...Array.from({ length: 6 }, () => ({ type: "MC", correct: false })),
      // 20 MC, 0.70

      ...Array.from({ length: 12 }, () => ({ type: "SA", correct: true })),
      ...Array.from({ length: 8 }, () => ({ type: "SA", correct: false })),
      // 20 SA, 0.60

      // Gap = 0.10 < 0.15 → mixed
    ];
    const result = inferStyle(responses);
    expect(result.style).toBe("mixed");
  });

  it("returns the single present bucket when only one has enough samples", () => {
    const responses = [
      ...Array.from({ length: 22 }, () => ({ type: "MC", correct: true })),
      { type: "SA", correct: true }, // only 1 SA — below 3-sample floor
      { type: "SA", correct: false },
    ];
    const result = inferStyle(responses);
    expect(result.style).toBe("reading");
  });
});
