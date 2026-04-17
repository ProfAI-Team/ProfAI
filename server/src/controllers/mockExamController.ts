import { Request, Response } from "express";

import prisma from "../lib/prisma";
import {
  generateMockExam,
  getMockExam,
  sanitizeQuestionsForClient,
} from "../services/mockExamService";
import {
  gradeAndPersist,
  type StudentAnswer,
} from "../services/mockExamGradingService";
import {
  predictExamPerformance,
  detectTopicGaps,
  buildPanicPlan,
} from "../services/mockExamPredictionService";
import type { MockExamQuestion } from "../prompts/mock-exam";
import { getOrBuildStyleProfile } from "../services/professorStyleService";

// Strips answer key + rubric so the session client never sees them.
function sanitizeExam(exam: Awaited<ReturnType<typeof getMockExam>>) {
  if (!exam) return exam;
  return {
    ...exam,
    questions: sanitizeQuestionsForClient(
      exam.questions as unknown as MockExamQuestion[]
    ),
  };
}

export const generate = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }

    const { professorId, studyPackId, noteIds, questionCount, durationMin } =
      req.body ?? {};
    if (typeof professorId !== "string" || !professorId) {
      res.status(400).json({ error: "professorId is required." });
      return;
    }
    if (studyPackId != null && typeof studyPackId !== "string") {
      res.status(400).json({ error: "studyPackId must be a string." });
      return;
    }
    if (
      noteIds != null &&
      (!Array.isArray(noteIds) || !noteIds.every((id) => typeof id === "string"))
    ) {
      res.status(400).json({ error: "noteIds must be an array of strings." });
      return;
    }

    const result = await generateMockExam({
      userId: req.user.id,
      professorId,
      studyPackId: studyPackId ?? null,
      noteIds: noteIds ?? [],
      questionCount:
        typeof questionCount === "number" ? questionCount : undefined,
      durationMin: typeof durationMin === "number" ? durationMin : undefined,
    });

    if (result.status === "insufficient_data") {
      res.status(400).json({
        status: "insufficient_data",
        reason: result.reason,
        message: result.message,
      });
      return;
    }

    res.status(result.cacheHit ? 200 : 201).json({
      status: "ready",
      cacheHit: result.cacheHit,
      exam: sanitizeExam(result.exam),
    });
  } catch (error) {
    console.error("Generate mock exam error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }
    const id = typeof req.params.id === "string" ? req.params.id : null;
    if (!id) {
      res.status(400).json({ error: "Invalid exam id." });
      return;
    }
    const exam = await getMockExam(id, req.user.id);
    if (!exam) {
      res.status(404).json({ error: "Mock exam not found." });
      return;
    }
    res.json({ exam: sanitizeExam(exam) });
  } catch (error) {
    console.error("Get mock exam error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const submit = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }
    const id = typeof req.params.id === "string" ? req.params.id : null;
    if (!id) {
      res.status(400).json({ error: "Invalid exam id." });
      return;
    }

    const body = req.body ?? {};
    const answers: unknown = body.answers;
    const autoSubmitted = Boolean(body.autoSubmitted);
    if (!Array.isArray(answers)) {
      res.status(400).json({ error: "answers must be an array." });
      return;
    }
    const normalisedAnswers: StudentAnswer[] = [];
    for (const a of answers as Array<Record<string, unknown>>) {
      if (typeof a !== "object" || a == null) continue;
      if (typeof a.qIdx !== "number") continue;
      normalisedAnswers.push({
        qIdx: a.qIdx,
        answer: typeof a.answer === "string" ? a.answer : "",
        timeSpentSec:
          typeof a.timeSpentSec === "number" ? a.timeSpentSec : undefined,
        flagged: typeof a.flagged === "boolean" ? a.flagged : undefined,
      });
    }

    const exam = await getMockExam(id, req.user.id);
    if (!exam) {
      res.status(404).json({ error: "Mock exam not found." });
      return;
    }

    // Create the session row with the raw answers; gradeAndPersist will
    // score + update in place. We keep the round-trip single so clients
    // don't have to poll for grading completion.
    const session = await prisma.mockExamSession.create({
      data: {
        mockExamId: exam.id,
        userId: req.user.id,
        answers: normalisedAnswers as unknown as object,
      },
    });

    const { session: graded, grading } = await gradeAndPersist(
      session,
      exam,
      {
        autoSubmitted,
        userId: req.user.id,
      }
    );

    const questions = exam.questions as unknown as MockExamQuestion[];
    const topicGaps = detectTopicGaps(questions, grading.feedback);
    const prediction = predictExamPerformance({
      mockScore: grading.score,
      autoSubmitted,
      timeSpentSec: graded.timeSpentSec ?? 0,
      plannedDurationSec: exam.durationMin * 60,
    });

    // Persist prediction + topic gaps so the result endpoint doesn't have
    // to recompute. Keeping them in JSON columns mirrors how feedback
    // lives inside the session row.
    await prisma.mockExamSession.update({
      where: { id: graded.id },
      data: {
        prediction: prediction as unknown as object,
        topicGaps: topicGaps as unknown as object,
      },
    });

    res.status(201).json({
      sessionId: graded.id,
      score: grading.score,
      sections: grading.sections,
      feedback: grading.feedback,
      prediction,
      topicGaps,
    });
  } catch (error) {
    console.error("Submit mock exam error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getResult = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }
    const sessionId =
      typeof req.params.sessionId === "string" ? req.params.sessionId : null;
    if (!sessionId) {
      res.status(400).json({ error: "Invalid session id." });
      return;
    }
    const session = await prisma.mockExamSession.findFirst({
      where: { id: sessionId, userId: req.user.id },
      include: { mockExam: true },
    });
    if (!session) {
      res.status(404).json({ error: "Session not found." });
      return;
    }

    // Reconstruct the section-score list from stored feedback (grading
    // service doesn't persist sections separately — section avg is cheap
    // to recompute from feedback).
    res.json({
      session: {
        id: session.id,
        score: session.score,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        timeSpentSec: session.timeSpentSec,
        autoSubmitted: session.autoSubmitted,
        feedback: session.feedback,
        prediction: session.prediction,
        topicGaps: session.topicGaps,
      },
      exam: sanitizeExam(session.mockExam),
    });
  } catch (error) {
    console.error("Get mock exam result error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const panicPlan = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }
    const { hoursUntilExam, professorId, mockExamSessionId } = req.body ?? {};
    if (typeof hoursUntilExam !== "number" || hoursUntilExam <= 0) {
      res.status(400).json({ error: "hoursUntilExam must be a positive number." });
      return;
    }
    if (typeof professorId !== "string" || !professorId) {
      res.status(400).json({ error: "professorId is required." });
      return;
    }

    let topicGaps: Awaited<ReturnType<typeof detectTopicGaps>> | undefined;

    if (typeof mockExamSessionId === "string" && mockExamSessionId) {
      const session = await prisma.mockExamSession.findFirst({
        where: { id: mockExamSessionId, userId: req.user.id },
      });
      if (session?.topicGaps) {
        topicGaps = session.topicGaps as unknown as typeof topicGaps;
      }
    }

    let topTopics: { topic: string; frequency: number }[] | undefined;
    if (!topicGaps || topicGaps.length === 0) {
      const style = await getOrBuildStyleProfile(professorId);
      if (style.status === "ready") {
        topTopics = style.profile.topTopics as unknown as typeof topTopics;
      }
    }

    const plan = buildPanicPlan({
      hoursUntilExam,
      topicGaps,
      topTopics,
    });

    res.json(plan);
  } catch (error) {
    console.error("Panic plan error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
