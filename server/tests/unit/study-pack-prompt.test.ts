import { describe, it, expect } from "vitest";

import {
  STUDY_PACK_VERSION,
  MIN_TOPIC_SUMMARIES,
  MIN_PRACTICE_QUESTIONS,
  computeTargetTypeDistribution,
  isDistributionWithinTolerance,
  buildStudyPackPrompt,
} from "../../src/prompts/study-pack";
import type { AggregatedData } from "../../src/services/professorStyleService";

const AGGREGATED: AggregatedData = {
  questionTypes: {
    "Multiple Choice": 60,
    "Classic/Open-ended": 30,
    "True/False": 10,
  },
  topicDistribution: { "Topic A": 50, "Topic B": 50 },
  difficulty: 6.4,
};

describe("STUDY_PACK_VERSION", () => {
  it("is a stable versioned string", () => {
    expect(STUDY_PACK_VERSION).toBe("study-pack-v1");
  });
});

describe("computeTargetTypeDistribution", () => {
  it("normalises to percentages summing near 100", () => {
    const target = computeTargetTypeDistribution(AGGREGATED);
    expect(target).toEqual({ MC: 60, CLASSIC: 30, TF: 10 });
  });

  it("scales raw counts to percentages", () => {
    const target = computeTargetTypeDistribution({
      ...AGGREGATED,
      questionTypes: {
        "Multiple Choice": 120,
        "Classic/Open-ended": 60,
        "True/False": 20,
      },
    });
    expect(target.MC).toBe(60);
    expect(target.CLASSIC).toBe(30);
    expect(target.TF).toBe(10);
  });

  it("falls back to the defaults when no exam data exists", () => {
    const target = computeTargetTypeDistribution({
      ...AGGREGATED,
      questionTypes: {
        "Multiple Choice": 0,
        "Classic/Open-ended": 0,
        "True/False": 0,
      },
    });
    expect(target).toEqual({ MC: 50, CLASSIC: 40, TF: 10 });
  });
});

describe("isDistributionWithinTolerance", () => {
  const target = { MC: 60, CLASSIC: 30, TF: 10 };

  it("accepts an exact match", () => {
    expect(isDistributionWithinTolerance(target, target)).toBe(true);
  });

  it("accepts values within ±10 percentage points", () => {
    expect(
      isDistributionWithinTolerance({ MC: 55, CLASSIC: 35, TF: 10 }, target)
    ).toBe(true);
    expect(
      isDistributionWithinTolerance({ MC: 70, CLASSIC: 20, TF: 10 }, target)
    ).toBe(true);
  });

  it("rejects values drifting past the tolerance", () => {
    expect(
      isDistributionWithinTolerance({ MC: 45, CLASSIC: 40, TF: 15 }, target)
    ).toBe(false);
    expect(
      isDistributionWithinTolerance({ MC: 60, CLASSIC: 5, TF: 35 }, target)
    ).toBe(false);
  });
});

describe("buildStudyPackPrompt", () => {
  const baseInput = {
    noteText: "Bu nottaki konu bir örnek içerir.",
    aggregated: AGGREGATED,
    topTopics: [
      { topic: "Veri Yapıları", frequency: 42 },
      { topic: "Algoritmalar", frequency: 30 },
    ],
    styleSummary: "Bu hoca klasik soru tercih eder.",
    professorDepartment: "Bilgisayar Mühendisliği",
  };

  it("produces system + user + target output", () => {
    const result = buildStudyPackPrompt(baseInput);
    expect(result.systemInstruction).toMatch(/Kaynak dışına çıkma/);
    expect(result.target).toEqual({ MC: 60, CLASSIC: 30, TF: 10 });
    expect(result.userPrompt).toContain("Bilgisayar Mühendisliği");
    expect(result.userPrompt).toContain("Veri Yapıları");
    expect(result.userPrompt).toContain("Bu nottaki konu bir örnek içerir.");
    expect(result.userPrompt).toContain(
      `En az ${MIN_TOPIC_SUMMARIES}`
    );
    expect(result.userPrompt).toContain(`${MIN_PRACTICE_QUESTIONS}-`);
  });

  it("clips long notes to the char cap with an explicit marker", () => {
    const longText = "x".repeat(150_000);
    const { userPrompt } = buildStudyPackPrompt({
      ...baseInput,
      noteText: longText,
    });
    expect(userPrompt).toContain("not devamı uzunluk sınırı nedeniyle kesildi");
    expect(userPrompt.length).toBeLessThan(longText.length);
  });

  it("omits the style-summary section when none is provided", () => {
    const { userPrompt } = buildStudyPackPrompt({
      ...baseInput,
      styleSummary: null,
    });
    expect(userPrompt).not.toMatch(/Hocanın Stili Özeti/);
  });
});
