import { describe, it, expect } from "vitest";

import { scoreCompatibility } from "../../src/services/courseAdvisorService";

describe("courseAdvisorService.scoreCompatibility (pure)", () => {
  it("rewards style + difficulty + topic matches together (full score)", () => {
    const result = scoreCompatibility({
      userLearningStyle: "reading",
      professorDominantType: "Multiple Choice",
      userPreferredDifficulty: "medium",
      professorDifficultyBucket: "medium",
      userStrengthTopics: ["scrum", "agile", "kanban", "sprint", "roles"],
      professorTopTopics: ["scrum", "agile", "kanban", "sprint", "roles"],
    });
    expect(result.score).toBe(100);
    expect(result.reasons).toContain("style-match");
    expect(result.reasons).toContain("difficulty-match");
    expect(result.reasons.some((r) => r.startsWith("topic-overlap:"))).toBe(true);
    expect(result.warnings).toEqual([]);
  });

  it("warns on style mismatch (MC prof vs kinesthetic learner)", () => {
    const result = scoreCompatibility({
      userLearningStyle: "kinesthetic",
      professorDominantType: "Multiple Choice",
      userPreferredDifficulty: null,
      professorDifficultyBucket: "medium",
      userStrengthTopics: [],
      professorTopTopics: ["scrum"],
    });
    expect(result.warnings).toContain("style-mismatch");
    expect(result.reasons).not.toContain("style-match");
  });

  it("gives style credit to mixed learners regardless of professor type", () => {
    const mc = scoreCompatibility({
      userLearningStyle: "mixed",
      professorDominantType: "Multiple Choice",
      userPreferredDifficulty: null,
      professorDifficultyBucket: null,
      userStrengthTopics: [],
      professorTopTopics: [],
    });
    const sa = scoreCompatibility({
      userLearningStyle: "mixed",
      professorDominantType: "Classic/Open-ended",
      userPreferredDifficulty: null,
      professorDifficultyBucket: null,
      userStrengthTopics: [],
      professorTopTopics: [],
    });
    expect(mc.reasons).toContain("style-match");
    expect(sa.reasons).toContain("style-match");
  });

  it("caps topic overlap at MAX_TOPIC_OVERLAP_POINTS", () => {
    const strengths = Array.from({ length: 20 }, (_, i) => `topic-${i}`);
    const result = scoreCompatibility({
      userLearningStyle: null,
      professorDominantType: null,
      userPreferredDifficulty: null,
      professorDifficultyBucket: null,
      userStrengthTopics: strengths,
      professorTopTopics: strengths,
    });
    // 20 matches × 10 = 200, but capped at 50.
    expect(result.score).toBe(50);
  });

  it("warns on hard professor when the user didn't pick hard", () => {
    const result = scoreCompatibility({
      userLearningStyle: null,
      professorDominantType: null,
      userPreferredDifficulty: "easy",
      professorDifficultyBucket: "hard",
      userStrengthTopics: [],
      professorTopTopics: [],
    });
    expect(result.warnings).toContain("difficulty-hard");
  });

  it("is case-insensitive on topic overlap", () => {
    const result = scoreCompatibility({
      userLearningStyle: null,
      professorDominantType: null,
      userPreferredDifficulty: null,
      professorDifficultyBucket: null,
      userStrengthTopics: ["Scrum"],
      professorTopTopics: ["scrum"],
    });
    expect(result.reasons).toContain("topic-overlap:1");
  });

  it("warns when the user has no identified strengths yet", () => {
    const result = scoreCompatibility({
      userLearningStyle: null,
      professorDominantType: null,
      userPreferredDifficulty: null,
      professorDifficultyBucket: null,
      userStrengthTopics: [],
      professorTopTopics: ["scrum"],
    });
    expect(result.warnings).toContain("no-strengths");
  });
});
