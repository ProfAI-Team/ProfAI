import { describe, it, expect } from "vitest";

import {
  sortedIds,
  computeNoteHash,
  buildDistributionFromContent,
} from "../../src/services/studyPackService";
import type { StudyPackContent } from "../../src/services/llm/geminiProvider";

describe("sortedIds", () => {
  it("dedupes and sorts", () => {
    expect(sortedIds(["c", "a", "b", "a"])).toEqual(["a", "b", "c"]);
  });

  it("handles empty input", () => {
    expect(sortedIds([])).toEqual([]);
  });

  it("is stable regardless of input order", () => {
    expect(sortedIds(["b", "a", "c"])).toEqual(sortedIds(["c", "a", "b"]));
  });
});

describe("computeNoteHash", () => {
  const a = { id: "id-a", extractedText: "konu A içeriği" };
  const b = { id: "id-b", extractedText: "konu B içeriği" };

  it("is deterministic for the same inputs", () => {
    expect(computeNoteHash([a, b])).toBe(computeNoteHash([a, b]));
  });

  it("changes when note content changes", () => {
    const bAlt = { ...b, extractedText: "farklı içerik" };
    expect(computeNoteHash([a, b])).not.toBe(computeNoteHash([a, bAlt]));
  });

  it("changes when a note id changes even if content is identical", () => {
    const bAltId = { id: "id-b2", extractedText: b.extractedText };
    expect(computeNoteHash([a, b])).not.toBe(computeNoteHash([a, bAltId]));
  });

  it("produces a 64-char hex digest", () => {
    expect(computeNoteHash([a])).toMatch(/^[a-f0-9]{64}$/);
  });
});

function makeContent(types: Array<"MC" | "CLASSIC" | "TF">): StudyPackContent {
  return {
    topicSummaries: [{ topic: "T", content: "c" }],
    practiceQuestions: types.map((t, i) => ({
      question: `Q${i}`,
      type: t,
      topic: "T",
      difficulty: 5,
      answer: "A",
      rationale: "R",
    })),
    profStylePatterns: [],
  };
}

describe("buildDistributionFromContent", () => {
  it("returns zeros when there are no questions", () => {
    expect(
      buildDistributionFromContent({
        topicSummaries: [],
        practiceQuestions: [],
        profStylePatterns: [],
      })
    ).toEqual({ MC: 0, CLASSIC: 0, TF: 0 });
  });

  it("scales counts to percentages", () => {
    const content = makeContent(["MC", "MC", "MC", "MC", "CLASSIC", "TF"]);
    const dist = buildDistributionFromContent(content);
    // 4/6 ≈ 67, 1/6 ≈ 17, 1/6 ≈ 17
    expect(dist.MC).toBe(67);
    expect(dist.CLASSIC).toBe(17);
    expect(dist.TF).toBe(17);
  });

  it("handles all-MC edge case", () => {
    const content = makeContent(["MC", "MC", "MC"]);
    expect(buildDistributionFromContent(content)).toEqual({
      MC: 100,
      CLASSIC: 0,
      TF: 0,
    });
  });
});
