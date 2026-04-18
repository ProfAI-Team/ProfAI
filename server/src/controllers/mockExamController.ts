import { Request, Response } from "express";

import prisma from "../lib/prisma";
import { parseOrRespond } from "../lib/validation";
import {
  generateMockExamSchema,
  submitMockExamSchema,
  panicPlanSchema,
} from "../schemas/mock-exam";
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
import { badRequest, notFound, unauthorized } from "../lib/AppError";

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
  if (!req.user) {
    throw unauthorized("Not authenticated.");
  }

  const body = parseOrRespond(generateMockExamSchema, req.body ?? {}, res);
  if (body === null) return;

  const result = await generateMockExam({
    userId: req.user.id,
    professorId: body.professorId,
    studyPackId: body.studyPackId ?? null,
    noteIds: body.noteIds ?? [],
    questionCount: body.questionCount,
    durationMin: body.durationMin,
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
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw unauthorized("Not authenticated.");
  }
  const id = typeof req.params.id === "string" ? req.params.id : null;
  if (!id) {
    throw badRequest("Invalid exam id.");
  }
  const exam = await getMockExam(id, req.user.id);
  if (!exam) {
    throw notFound("Mock exam not found.");
  }
  res.json({ exam: sanitizeExam(exam) });
};

export const submit = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw unauthorized("Not authenticated.");
  }
  const id = typeof req.params.id === "string" ? req.params.id : null;
  if (!id) {
    throw badRequest("Invalid exam id.");
  }

  const body = parseOrRespond(submitMockExamSchema, req.body ?? {}, res);
  if (body === null) return;

  const normalisedAnswers: StudentAnswer[] = body.answers.map((a) => ({
    qIdx: a.qIdx,
    answer: a.answer,
    timeSpentSec: a.timeSpentSec,
    flagged: a.flagged,
  }));

  const exam = await getMockExam(id, req.user.id);
  if (!exam) {
    throw notFound("Mock exam not found.");
  }

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
      autoSubmitted: body.autoSubmitted,
      userId: req.user.id,
    }
  );

  const questions = exam.questions as unknown as MockExamQuestion[];
  const topicGaps = detectTopicGaps(questions, grading.feedback);
  const prediction = predictExamPerformance({
    mockScore: grading.score,
    autoSubmitted: body.autoSubmitted,
    timeSpentSec: graded.timeSpentSec ?? 0,
    plannedDurationSec: exam.durationMin * 60,
  });

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
};

export const getResult = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw unauthorized("Not authenticated.");
  }
  const sessionId =
    typeof req.params.sessionId === "string" ? req.params.sessionId : null;
  if (!sessionId) {
    throw badRequest("Invalid session id.");
  }
  const session = await prisma.mockExamSession.findFirst({
    where: { id: sessionId, userId: req.user.id },
    include: { mockExam: true },
  });
  if (!session) {
    throw notFound("Session not found.");
  }

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
};

export const panicPlan = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw unauthorized("Not authenticated.");
  }
  const body = parseOrRespond(panicPlanSchema, req.body ?? {}, res);
  if (body === null) return;

  let topicGaps: Awaited<ReturnType<typeof detectTopicGaps>> | undefined;

  if (body.mockExamSessionId) {
    const session = await prisma.mockExamSession.findFirst({
      where: { id: body.mockExamSessionId, userId: req.user.id },
    });
    if (session?.topicGaps) {
      topicGaps = session.topicGaps as unknown as typeof topicGaps;
    }
  }

  let topTopics: { topic: string; frequency: number }[] | undefined;
  if (!topicGaps || topicGaps.length === 0) {
    const style = await getOrBuildStyleProfile(body.professorId);
    if (style.status === "ready") {
      topTopics = style.profile.topTopics as unknown as typeof topTopics;
    }
  }

  const plan = buildPanicPlan({
    hoursUntilExam: body.hoursUntilExam,
    topicGaps,
    topTopics,
  });

  res.json(plan);
};
