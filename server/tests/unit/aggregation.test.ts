import { describe, it, expect } from "vitest";
import type { ExamAnalysis } from "@prisma/client";

import { computeAggregation } from "../../src/services/professorStyleService";

// Small helper so the fixtures stay readable.
function makeAnalysis(
  overrides: Partial<{
    questionCount: number;
    questionTypes: Record<string, number>;
    topicDistribution: Record<string, number>;
    difficultyScore: number;
  }>
): ExamAnalysis {
  return {
    id: "fake-id",
    examId: "fake-exam",
    questionCount: overrides.questionCount ?? 10,
    questionTypes: (overrides.questionTypes ?? {
      "Multiple Choice": 100,
      "Classic/Open-ended": 0,
      "True/False": 0,
    }) as unknown as ExamAnalysis["questionTypes"],
    topicDistribution: (overrides.topicDistribution ?? {
      "Topic A": 100,
    }) as unknown as ExamAnalysis["topicDistribution"],
    difficultyScore: overrides.difficultyScore ?? 5,
    summary: "x",
    createdAt: new Date(),
  };
}

describe("computeAggregation", () => {
  it("returns null when there are no analyses at all", () => {
    expect(computeAggregation([])).toBeNull();
    expect(
      computeAggregation([{ id: "e1", year: 2024, analysis: null }])
    ).toBeNull();
  });

  it("treats a single analysis as its own aggregate", () => {
    const result = computeAggregation([
      {
        id: "e1",
        year: 2024,
        analysis: makeAnalysis({
          questionCount: 20,
          questionTypes: {
            "Multiple Choice": 60,
            "Classic/Open-ended": 30,
            "True/False": 10,
          },
          topicDistribution: { Algoritma: 70, OOP: 30 },
          difficultyScore: 6.5,
        }),
      },
    ]);

    expect(result).not.toBeNull();
    expect(result!.aggregated.questionTypes).toEqual({
      "Multiple Choice": 60,
      "Classic/Open-ended": 30,
      "True/False": 10,
    });
    expect(result!.metrics.totalExams).toBe(1);
    expect(result!.metrics.avgDifficulty).toBe(6.5);
    expect(result!.metrics.dominantType).toBe("Multiple Choice");
    expect(result!.topTopics[0]).toEqual({ topic: "Algoritma", frequency: 70 });
    expect(result!.evolution).toHaveLength(1);
    expect(result!.evolution[0].year).toBe(2024);
  });

  it("weights aggregation by questionCount — longer exams pull more", () => {
    // Two exams: one 30-question all MC, one 10-question all open-ended.
    // Weighted average should skew toward MC (30/40 = 75%).
    const result = computeAggregation([
      {
        id: "e1",
        year: 2024,
        analysis: makeAnalysis({
          questionCount: 30,
          questionTypes: {
            "Multiple Choice": 100,
            "Classic/Open-ended": 0,
            "True/False": 0,
          },
          topicDistribution: { Algoritma: 100 },
        }),
      },
      {
        id: "e2",
        year: 2024,
        analysis: makeAnalysis({
          questionCount: 10,
          questionTypes: {
            "Multiple Choice": 0,
            "Classic/Open-ended": 100,
            "True/False": 0,
          },
          topicDistribution: { OOP: 100 },
        }),
      },
    ]);

    expect(result!.aggregated.questionTypes["Multiple Choice"]).toBe(75);
    expect(result!.aggregated.questionTypes["Classic/Open-ended"]).toBe(25);
    expect(result!.aggregated.topicDistribution["Algoritma"]).toBe(75);
    expect(result!.aggregated.topicDistribution["OOP"]).toBe(25);
    expect(result!.metrics.dominantType).toBe("Multiple Choice");
  });

  it("groups evolution points by year and sorts ascending", () => {
    const mk = (year: number) => ({
      id: `e-${year}`,
      year,
      analysis: makeAnalysis({ questionCount: 10 }),
    });

    const result = computeAggregation([mk(2026), mk(2022), mk(2024), mk(2022)]);

    expect(result!.evolution.map((e) => e.year)).toEqual([2022, 2024, 2026]);
    expect(result!.evolution[0].examCount).toBe(2); // 2022 has two exams
    expect(result!.evolution[1].examCount).toBe(1);
    expect(result!.evolution[2].examCount).toBe(1);
  });

  it("truncates topTopics to the first 10 after sorting by frequency", () => {
    const dist: Record<string, number> = {};
    for (let i = 0; i < 15; i++) dist[`Topic ${i}`] = 15 - i;

    const result = computeAggregation([
      {
        id: "e1",
        year: 2024,
        analysis: makeAnalysis({ topicDistribution: dist }),
      },
    ]);

    expect(result!.topTopics).toHaveLength(10);
    expect(result!.topTopics[0].topic).toBe("Topic 0");
    expect(result!.topTopics[9].topic).toBe("Topic 9");
  });

  it("reports dominantType = null when every type is zero", () => {
    const result = computeAggregation([
      {
        id: "e1",
        year: 2024,
        analysis: makeAnalysis({
          questionTypes: {
            "Multiple Choice": 0,
            "Classic/Open-ended": 0,
            "True/False": 0,
          },
        }),
      },
    ]);
    expect(result!.metrics.dominantType).toBeNull();
  });

  it("ignores exams with no analysis while counting the analyzed ones", () => {
    const result = computeAggregation([
      {
        id: "e1",
        year: 2024,
        analysis: makeAnalysis({ questionCount: 10 }),
      },
      { id: "e2", year: 2024, analysis: null },
      {
        id: "e3",
        year: 2025,
        analysis: makeAnalysis({ questionCount: 20 }),
      },
    ]);

    expect(result!.examSourceCount).toBe(2);
    expect(result!.metrics.totalExams).toBe(2);
    expect(result!.evolution.map((e) => e.year)).toEqual([2024, 2025]);
  });
});
