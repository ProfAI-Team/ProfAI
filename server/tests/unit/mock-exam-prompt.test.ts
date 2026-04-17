import { describe, it, expect } from "vitest";

import {
  buildMockExamPrompt,
  buildSectionBreakdown,
  computeMockExamTypeMix,
  MAX_MOCK_EXAM_QUESTIONS,
  MIN_MOCK_EXAM_QUESTIONS,
  MIN_MOCK_EXAM_DURATION_MIN,
  MAX_MOCK_EXAM_DURATION_MIN,
  buildGradeAnswerPrompt,
  MOCK_EXAM_VERSION,
} from "../../src/prompts/mock-exam";
import type {
  AggregatedData,
  TopTopic,
} from "../../src/services/professorStyleService";

const aggregated: AggregatedData = {
  questionTypes: {
    "Multiple Choice": 60,
    "Classic/Open-ended": 30,
    "True/False": 10,
  },
  topicDistribution: [{ topic: "Veri Yapıları", percentage: 40 }],
  difficulty: 6.5,
};

const topTopics: TopTopic[] = [
  { topic: "Veri Yapıları", frequency: 40 },
  { topic: "Algoritmalar", frequency: 30 },
];

describe("mock-exam prompt", () => {
  it("freezes the prompt version (cache key depends on it)", () => {
    expect(MOCK_EXAM_VERSION).toBe("mock-exam-v1");
  });

  it("clamps question count into the accepted window", () => {
    const low = buildMockExamPrompt({
      noteText: "hello",
      aggregated,
      topTopics,
      professorDepartment: "Bilgisayar",
      questionCount: 3,
      durationMin: 90,
    });
    expect(low.questionCount).toBe(MIN_MOCK_EXAM_QUESTIONS);

    const high = buildMockExamPrompt({
      noteText: "hello",
      aggregated,
      topTopics,
      professorDepartment: "Bilgisayar",
      questionCount: 99,
      durationMin: 90,
    });
    expect(high.questionCount).toBe(MAX_MOCK_EXAM_QUESTIONS);
  });

  it("clamps duration into the accepted window", () => {
    const low = buildMockExamPrompt({
      noteText: "hello",
      aggregated,
      topTopics,
      professorDepartment: "Bilgisayar",
      questionCount: 20,
      durationMin: 5,
    });
    expect(low.durationMin).toBe(MIN_MOCK_EXAM_DURATION_MIN);

    const high = buildMockExamPrompt({
      noteText: "hello",
      aggregated,
      topTopics,
      professorDepartment: "Bilgisayar",
      questionCount: 20,
      durationMin: 500,
    });
    expect(high.durationMin).toBe(MAX_MOCK_EXAM_DURATION_MIN);
  });

  it("interpolates target distribution and question count into the user prompt", () => {
    const built = buildMockExamPrompt({
      noteText: "hello",
      aggregated,
      topTopics,
      professorDepartment: "Bilgisayar",
      questionCount: 20,
      durationMin: 90,
    });
    expect(built.target).toEqual({ MC: 60, CLASSIC: 30, TF: 10 });
    expect(built.userPrompt).toContain("20 soruluk");
    expect(built.userPrompt).toContain("90 dakikalık");
    expect(built.userPrompt).toContain("Çoktan seçmeli %60");
    expect(built.userPrompt).toContain("Klasik %30");
    expect(built.userPrompt).toContain("Doğru/Yanlış %10");
  });

  it("adds a placeholder instead of an empty note block", () => {
    const built = buildMockExamPrompt({
      noteText: "",
      aggregated,
      topTopics,
      professorDepartment: "Bilgisayar",
      questionCount: 20,
      durationMin: 90,
    });
    expect(built.userPrompt).toContain("öğrenci not yüklemedi");
  });

  it("clips the note block when input exceeds the char cap", () => {
    const bigNote = "x".repeat(200_000);
    const built = buildMockExamPrompt({
      noteText: bigNote,
      aggregated,
      topTopics,
      professorDepartment: "Bilgisayar",
      questionCount: 20,
      durationMin: 90,
    });
    expect(built.userPrompt).toContain("uzunluk sınırı nedeniyle kesildi");
  });
});

describe("computeMockExamTypeMix", () => {
  it("allocates integers that sum to the requested total", () => {
    const mix = computeMockExamTypeMix({ MC: 60, CLASSIC: 30, TF: 10 }, 20);
    expect(mix.MC + mix.CLASSIC + mix.TF).toBe(20);
    expect(mix.MC).toBe(12);
    expect(mix.CLASSIC).toBe(6);
    expect(mix.TF).toBe(2);
  });

  it("handles uneven splits with rounding remainders", () => {
    const mix = computeMockExamTypeMix({ MC: 50, CLASSIC: 40, TF: 10 }, 15);
    expect(mix.MC + mix.CLASSIC + mix.TF).toBe(15);
  });

  it("survives a 0/0/100 edge case (pure TF exam)", () => {
    const mix = computeMockExamTypeMix({ MC: 0, CLASSIC: 0, TF: 100 }, 15);
    expect(mix).toEqual({ MC: 0, CLASSIC: 0, TF: 15 });
  });
});

describe("buildSectionBreakdown", () => {
  it("covers all questions with contiguous sections", () => {
    const sections = buildSectionBreakdown(20, 7);
    expect(sections[0]).toEqual({ title: "Bölüm 1", startIdx: 0, endIdx: 7 });
    expect(sections[sections.length - 1].endIdx).toBe(20);
    for (let i = 1; i < sections.length; i++) {
      expect(sections[i].startIdx).toBe(sections[i - 1].endIdx);
    }
  });

  it("handles a total smaller than one section", () => {
    const sections = buildSectionBreakdown(4, 7);
    expect(sections).toEqual([
      { title: "Bölüm 1", startIdx: 0, endIdx: 4 },
    ]);
  });
});

describe("buildGradeAnswerPrompt", () => {
  it("embeds rubric criteria and the student answer", () => {
    const { userPrompt } = buildGradeAnswerPrompt({
      question: "Hash tablosu çarpışma stratejilerini açıkla.",
      topic: "Hash Tabloları",
      difficulty: 7,
      modelAnswer: "Separate chaining ve open addressing temel yaklaşımlardır.",
      rubric: ["Her iki strateji tanımlanmış", "Trade-off'lar açık"],
      studentAnswer: "Separate chaining: zincir, open addressing: probe.",
    });
    expect(userPrompt).toContain("Hash tablosu çarpışma");
    expect(userPrompt).toContain("1. Her iki strateji tanımlanmış");
    expect(userPrompt).toContain("2. Trade-off'lar açık");
    expect(userPrompt).toContain("Separate chaining: zincir");
  });

  it("signals an empty student answer explicitly", () => {
    const { userPrompt } = buildGradeAnswerPrompt({
      question: "X tanımı.",
      topic: "T",
      difficulty: 5,
      modelAnswer: "model",
      rubric: ["tanım"],
      studentAnswer: "   ",
    });
    expect(userPrompt).toContain("(öğrenci boş bıraktı)");
  });
});
