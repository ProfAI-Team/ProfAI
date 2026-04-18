import type { MockExam, MockExamSession, Prisma } from "@prisma/client";

import prisma from "../lib/prisma";
import type { MockExamQuestion } from "../prompts/mock-exam";
import { gradeClassicAnswer } from "./llm/geminiProvider";
import { featureLogger } from "../lib/logger";

const log = featureLogger("mockExamGrading");

// Parallel CLASSIC grading batch size — small enough to stay inside
// Gemini's burst quota (and the mock-exam rate limit), large enough to
// keep a typical 5-classic-question exam under ~15s.
const CLASSIC_BATCH_SIZE = 3;

// Weight rule-based questions proportionally to their declared difficulty —
// harder MC/TF contributes more to the total than easy ones, mirroring
// how actual exams are usually graded.
function questionWeight(q: MockExamQuestion): number {
  return Math.max(1, q.difficulty);
}

export interface StudentAnswer {
  qIdx: number;
  answer: string;
  timeSpentSec?: number;
  flagged?: boolean;
}

export interface QuestionFeedback {
  qIdx: number;
  correct: boolean;
  scoreOutOf100: number;
  feedback: string;
  suggestedTopic?: string;
  rubricHits?: { criterion: string; met: boolean }[];
}

export interface SectionScore {
  title: string;
  startIdx: number;
  endIdx: number;
  avgScore: number;
  questionCount: number;
}

export interface GradeSessionResult {
  score: number; // 0-100, difficulty-weighted
  feedback: QuestionFeedback[];
  sections: SectionScore[];
}

function normaliseAnswer(s: string): string {
  return s.trim().toLocaleLowerCase("tr-TR");
}

function gradeMC(
  question: MockExamQuestion,
  studentAnswer: string
): QuestionFeedback {
  const got = normaliseAnswer(studentAnswer);
  const want = normaliseAnswer(question.correctAnswer);
  // Accept both the full option text ("B) Paris") and just the letter ("B").
  const wantLetter = want.match(/^([a-d])\)/)?.[1] ?? null;
  const gotLetter = got.match(/^([a-d])\)?/)?.[1] ?? null;
  const correct =
    got === want || (wantLetter != null && wantLetter === gotLetter);
  return {
    qIdx: -1,
    correct,
    scoreOutOf100: correct ? 100 : 0,
    feedback: correct
      ? `Doğru cevap.`
      : `Doğru cevap: ${question.correctAnswer}. ${question.rationale}`,
    suggestedTopic: correct ? undefined : question.topic,
  };
}

function gradeTF(
  question: MockExamQuestion,
  studentAnswer: string
): QuestionFeedback {
  const got = normaliseAnswer(studentAnswer);
  const want = normaliseAnswer(question.correctAnswer);
  const map: Record<string, string> = {
    true: "doğru",
    false: "yanlış",
    t: "doğru",
    f: "yanlış",
    d: "doğru",
    y: "yanlış",
  };
  const gotNorm = map[got] ?? got;
  const wantNorm = map[want] ?? want;
  const correct = gotNorm === wantNorm;
  return {
    qIdx: -1,
    correct,
    scoreOutOf100: correct ? 100 : 0,
    feedback: correct
      ? `Doğru cevap.`
      : `Doğru cevap: ${question.correctAnswer}. ${question.rationale}`,
    suggestedTopic: correct ? undefined : question.topic,
  };
}

// Free-pass emptiness gate so we don't burn Gemini grading calls on
// blank submissions.
function emptyClassicFeedback(
  question: MockExamQuestion
): QuestionFeedback {
  return {
    qIdx: -1,
    correct: false,
    scoreOutOf100: 0,
    feedback: "Bu soruya cevap yazmadın. Model cevabı sonuç sayfasından inceleyebilirsin.",
    suggestedTopic: question.topic,
  };
}

function buildSectionScores(
  feedback: QuestionFeedback[],
  sections: { title: string; startIdx: number; endIdx: number }[]
): SectionScore[] {
  return sections.map((s) => {
    const range = feedback.slice(s.startIdx, s.endIdx);
    const count = range.length;
    const sum = range.reduce((acc, f) => acc + f.scoreOutOf100, 0);
    const avgScore = count > 0 ? sum / count : 0;
    return {
      title: s.title,
      startIdx: s.startIdx,
      endIdx: s.endIdx,
      avgScore,
      questionCount: count,
    };
  });
}

function weightedTotalScore(
  feedback: QuestionFeedback[],
  questions: MockExamQuestion[]
): number {
  if (questions.length === 0) return 0;
  let totalWeight = 0;
  let weightedSum = 0;
  for (let i = 0; i < questions.length; i++) {
    const w = questionWeight(questions[i]);
    totalWeight += w;
    weightedSum += (feedback[i]?.scoreOutOf100 ?? 0) * w;
  }
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

function* chunks<T>(arr: T[], size: number): Generator<T[]> {
  for (let i = 0; i < arr.length; i += size) {
    yield arr.slice(i, i + size);
  }
}

export interface GradeSessionOptions {
  userId?: string | null;
  // Inject for unit tests so Gemini isn't hit — signature matches
  // gradeClassicAnswer so the prod path is a straight pass-through.
  gradeClassic?: typeof gradeClassicAnswer;
}

export async function gradeSession(
  questions: MockExamQuestion[],
  answers: StudentAnswer[],
  sections: { title: string; startIdx: number; endIdx: number }[],
  options: GradeSessionOptions = {}
): Promise<GradeSessionResult> {
  const classicGrader = options.gradeClassic ?? gradeClassicAnswer;
  const byIdx = new Map<number, StudentAnswer>();
  for (const a of answers) byIdx.set(a.qIdx, a);

  const feedback: QuestionFeedback[] = new Array(questions.length);
  const classicJobs: Array<{ qIdx: number; q: MockExamQuestion; answer: string }> =
    [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const a = byIdx.get(i);
    const studentAnswer = a?.answer ?? "";
    if (q.type === "MC") {
      feedback[i] = { ...gradeMC(q, studentAnswer), qIdx: i };
    } else if (q.type === "TF") {
      feedback[i] = { ...gradeTF(q, studentAnswer), qIdx: i };
    } else if (q.type === "CLASSIC") {
      if (!studentAnswer.trim()) {
        feedback[i] = { ...emptyClassicFeedback(q), qIdx: i };
      } else {
        classicJobs.push({ qIdx: i, q, answer: studentAnswer });
      }
    } else {
      feedback[i] = {
        qIdx: i,
        correct: false,
        scoreOutOf100: 0,
        feedback: "Soru tipi tanınmıyor.",
      };
    }
  }

  for (const batch of chunks(classicJobs, CLASSIC_BATCH_SIZE)) {
    const results = await Promise.all(
      batch.map(async (job) => {
        try {
          const r = await classicGrader(
            {
              question: job.q.q,
              topic: job.q.topic,
              difficulty: job.q.difficulty,
              modelAnswer: job.q.correctAnswer,
              rubric: job.q.rubric && job.q.rubric.length > 0 ? job.q.rubric : [
                "Konu doğru tanımlanmış",
                "Mantıklı bir gerekçe sunulmuş",
                "Sonuç net ifade edilmiş",
              ],
              studentAnswer: job.answer,
            },
            { userId: options.userId }
          );
          return { job, result: r };
        } catch (err) {
          log.error({ err, qIdx: job.qIdx }, "CLASSIC grading failed; returning null");
          return { job, result: null as Awaited<ReturnType<typeof classicGrader>> | null };
        }
      })
    );

    for (const { job, result } of results) {
      if (result) {
        feedback[job.qIdx] = {
          qIdx: job.qIdx,
          correct: result.scoreOutOf100 >= 60,
          scoreOutOf100: result.scoreOutOf100,
          feedback: result.feedback,
          suggestedTopic: result.scoreOutOf100 < 60 ? job.q.topic : undefined,
          rubricHits: result.rubricHits,
        };
      } else {
        // Gemini errored after retries — give the student a neutral 50
        // instead of 0 so a transient outage doesn't tank their grade.
        feedback[job.qIdx] = {
          qIdx: job.qIdx,
          correct: false,
          scoreOutOf100: 50,
          feedback:
            "Bu soruya AI puanlamasına şu an ulaşılamadı. Geçici bir 50/100 verildi, cevabın sonuçta kaydedildi.",
          suggestedTopic: job.q.topic,
        };
      }
    }
  }

  const score = weightedTotalScore(feedback, questions);
  const sectionScores = buildSectionScores(feedback, sections);

  return { score, feedback, sections: sectionScores };
}

/**
 * Persists grading output + timing back to MockExamSession. Separate from
 * gradeSession so tests can validate the math without a live DB.
 */
export async function saveGradedSession(
  sessionId: string,
  grading: GradeSessionResult,
  completedAt: Date,
  timeSpentSec: number,
  autoSubmitted: boolean
): Promise<MockExamSession> {
  return prisma.mockExamSession.update({
    where: { id: sessionId },
    data: {
      score: grading.score,
      feedback: grading.feedback as unknown as Prisma.InputJsonValue,
      completedAt,
      timeSpentSec,
      autoSubmitted,
    },
  });
}

// Convenience for the controller layer — fetch + grade + persist in one
// call so the endpoint stays thin.
export async function gradeAndPersist(
  session: MockExamSession,
  mockExam: MockExam,
  options: { autoSubmitted: boolean; completedAt?: Date; userId: string }
): Promise<{ session: MockExamSession; grading: GradeSessionResult }> {
  const questions = mockExam.questions as unknown as MockExamQuestion[];
  const sections = (mockExam.sectionBreakdown as unknown as {
    title: string;
    startIdx: number;
    endIdx: number;
  }[]) ?? [
    { title: "Bölüm 1", startIdx: 0, endIdx: questions.length },
  ];
  const answers = session.answers as unknown as StudentAnswer[];

  const completedAt = options.completedAt ?? new Date();
  const timeSpentSec = Math.max(
    0,
    Math.round((completedAt.getTime() - session.startedAt.getTime()) / 1000)
  );
  const grading = await gradeSession(questions, answers, sections, {
    userId: options.userId,
  });
  const updated = await saveGradedSession(
    session.id,
    grading,
    completedAt,
    timeSpentSec,
    options.autoSubmitted
  );
  return { session: updated, grading };
}
