import { describe, it, expect } from "vitest";

import { sanitizeQuestionsForClient } from "../../src/services/mockExamService";
import type { MockExamQuestion } from "../../src/prompts/mock-exam";

describe("sanitizeQuestionsForClient", () => {
  it("strips correctAnswer + rubric so client never sees the key", () => {
    const questions: MockExamQuestion[] = [
      {
        q: "2 + 2 = ?",
        type: "MC",
        options: ["A) 3", "B) 4", "C) 5", "D) 6"],
        correctAnswer: "B) 4",
        topic: "Aritmetik",
        difficulty: 1,
        rationale: "Toplama.",
        rubric: [],
      },
      {
        q: "Python'da list ve tuple farkı?",
        type: "CLASSIC",
        options: [],
        correctAnswer: "Mutability...",
        topic: "Python",
        difficulty: 5,
        rationale: "Temel veri tipi farkı.",
        rubric: ["Mutability açıklandı", "Örnek var"],
      },
    ];

    const sanitized = sanitizeQuestionsForClient(questions);
    expect(sanitized).toHaveLength(2);
    for (const s of sanitized) {
      expect(s).not.toHaveProperty("correctAnswer");
      expect(s).not.toHaveProperty("rubric");
      expect(s).not.toHaveProperty("rationale");
    }
    expect(sanitized[0].options).toEqual(["A) 3", "B) 4", "C) 5", "D) 6"]);
    // Empty options arrays become undefined — the client conditional
    // rendering checks for truthy instead of length.
    expect(sanitized[1].options).toBeUndefined();
  });
});
