import { describe, it, expect, vi } from "vitest";

import { gradeSession } from "../../src/services/mockExamGradingService";
import type { MockExamQuestion } from "../../src/prompts/mock-exam";

const mcQ = (opts: Partial<MockExamQuestion>): MockExamQuestion => ({
  q: "Soru",
  type: "MC",
  options: ["A) 1", "B) 2", "C) 3", "D) 4"],
  correctAnswer: "B) 2",
  topic: "Aritmetik",
  difficulty: 5,
  rationale: "Toplama.",
  rubric: [],
  ...opts,
});

const tfQ = (opts: Partial<MockExamQuestion>): MockExamQuestion => ({
  q: "İfade doğru mu?",
  type: "TF",
  options: [],
  correctAnswer: "Doğru",
  topic: "Mantık",
  difficulty: 3,
  rationale: "Tanım gereği.",
  rubric: [],
  ...opts,
});

const classicQ = (opts: Partial<MockExamQuestion>): MockExamQuestion => ({
  q: "Tanımı açıkla.",
  type: "CLASSIC",
  options: [],
  correctAnswer: "Tanım: X bir Y'dir çünkü...",
  topic: "Teori",
  difficulty: 8,
  rationale: "Temel tanım.",
  rubric: ["Tanım doğru", "Örnek verilmiş"],
  ...opts,
});

describe("gradeSession — rule-based MC/TF", () => {
  it("full credit when MC answer matches the full option text", async () => {
    const result = await gradeSession(
      [mcQ({})],
      [{ qIdx: 0, answer: "B) 2" }],
      [{ title: "B1", startIdx: 0, endIdx: 1 }]
    );
    expect(result.feedback[0].correct).toBe(true);
    expect(result.feedback[0].scoreOutOf100).toBe(100);
    expect(result.score).toBe(100);
  });

  it("accepts MC answer by letter alone", async () => {
    const result = await gradeSession(
      [mcQ({})],
      [{ qIdx: 0, answer: "b" }],
      [{ title: "B1", startIdx: 0, endIdx: 1 }]
    );
    expect(result.feedback[0].correct).toBe(true);
  });

  it("zero on wrong MC and surfaces the topic for gap detection", async () => {
    const result = await gradeSession(
      [mcQ({})],
      [{ qIdx: 0, answer: "C) 3" }],
      [{ title: "B1", startIdx: 0, endIdx: 1 }]
    );
    expect(result.feedback[0].correct).toBe(false);
    expect(result.feedback[0].suggestedTopic).toBe("Aritmetik");
  });

  it("normalises TF variations (T/F/true/false/d/y)", async () => {
    const feedback = await gradeSession(
      [tfQ({}), tfQ({ correctAnswer: "Yanlış" }), tfQ({})],
      [
        { qIdx: 0, answer: "true" },
        { qIdx: 1, answer: "F" },
        { qIdx: 2, answer: "D" },
      ],
      [{ title: "B1", startIdx: 0, endIdx: 3 }]
    );
    expect(feedback.feedback[0].correct).toBe(true);
    expect(feedback.feedback[1].correct).toBe(true);
    expect(feedback.feedback[2].correct).toBe(true);
  });

  it("weights total score by difficulty", async () => {
    const result = await gradeSession(
      [
        mcQ({ difficulty: 1 }), // wrong, weight 1
        mcQ({ difficulty: 9 }), // right, weight 9
      ],
      [
        { qIdx: 0, answer: "A) 1" }, // wrong
        { qIdx: 1, answer: "B) 2" }, // right
      ],
      [{ title: "B1", startIdx: 0, endIdx: 2 }]
    );
    // (0 * 1 + 100 * 9) / (1 + 9) = 90
    expect(result.score).toBe(90);
  });

  it("produces per-section averages", async () => {
    const result = await gradeSession(
      [mcQ({}), mcQ({}), mcQ({})],
      [
        { qIdx: 0, answer: "B) 2" }, // right
        { qIdx: 1, answer: "A) 1" }, // wrong
        { qIdx: 2, answer: "B) 2" }, // right
      ],
      [
        { title: "B1", startIdx: 0, endIdx: 2 },
        { title: "B2", startIdx: 2, endIdx: 3 },
      ]
    );
    expect(result.sections[0].avgScore).toBe(50);
    expect(result.sections[1].avgScore).toBe(100);
  });
});

describe("gradeSession — CLASSIC rubric call", () => {
  it("short-circuits empty classic answers without hitting Gemini", async () => {
    const graderSpy = vi.fn();
    const result = await gradeSession(
      [classicQ({})],
      [{ qIdx: 0, answer: "   " }],
      [{ title: "B1", startIdx: 0, endIdx: 1 }],
      { gradeClassic: graderSpy as never }
    );
    expect(graderSpy).not.toHaveBeenCalled();
    expect(result.feedback[0].scoreOutOf100).toBe(0);
    expect(result.feedback[0].suggestedTopic).toBe("Teori");
  });

  it("calls Gemini once per non-empty CLASSIC and propagates the score", async () => {
    const graderSpy = vi.fn().mockResolvedValue({
      scoreOutOf100: 75,
      feedback: "**Tanım doğru**, örnek zayıf.",
      rubricHits: [
        { criterion: "Tanım doğru", met: true },
        { criterion: "Örnek verilmiş", met: false },
      ],
    });

    const result = await gradeSession(
      [classicQ({}), classicQ({})],
      [
        { qIdx: 0, answer: "X bir Y'dir." },
        { qIdx: 1, answer: "Yanıtım var." },
      ],
      [{ title: "B1", startIdx: 0, endIdx: 2 }],
      { gradeClassic: graderSpy as never }
    );

    expect(graderSpy).toHaveBeenCalledTimes(2);
    expect(result.feedback[0].scoreOutOf100).toBe(75);
    expect(result.feedback[0].correct).toBe(true);
    expect(result.feedback[0].rubricHits?.[0]?.met).toBe(true);
  });

  it("falls back to 50/100 when Gemini grading errors (no user penalty)", async () => {
    const graderSpy = vi.fn().mockRejectedValue(new Error("503"));
    const result = await gradeSession(
      [classicQ({})],
      [{ qIdx: 0, answer: "Bir cevap var." }],
      [{ title: "B1", startIdx: 0, endIdx: 1 }],
      { gradeClassic: graderSpy as never }
    );
    expect(result.feedback[0].scoreOutOf100).toBe(50);
    expect(result.feedback[0].feedback).toContain("Geçici");
  });

  it("batches classic calls at most 3 in parallel", async () => {
    let inflight = 0;
    let peak = 0;
    const graderSpy = vi.fn().mockImplementation(async () => {
      inflight += 1;
      peak = Math.max(peak, inflight);
      await new Promise((r) => setTimeout(r, 5));
      inflight -= 1;
      return {
        scoreOutOf100: 80,
        feedback: "ok",
        rubricHits: [],
      };
    });
    const questions = Array(6).fill(null).map(() => classicQ({}));
    const answers = questions.map((_, i) => ({ qIdx: i, answer: "x" }));
    await gradeSession(
      questions,
      answers,
      [{ title: "B1", startIdx: 0, endIdx: 6 }],
      { gradeClassic: graderSpy as never }
    );
    expect(peak).toBeLessThanOrEqual(3);
  });
});
