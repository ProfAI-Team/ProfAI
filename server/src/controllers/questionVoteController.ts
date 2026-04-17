import type { Request, Response } from "express";

import { parseOrRespond } from "../lib/validation";
import {
  voteQuestionSchema,
  verifiedPoolQuerySchema,
  markCameOnExamSchema,
} from "../schemas/community";
import {
  voteQuestion,
  markCameOnExam,
  getQuestionStats,
  getUserVote,
  getVerifiedPool,
} from "../services/questionVoteService";

export const castVoteController = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res
      .status(401)
      .json({ error: { code: "UNAUTHORIZED", message: "Not authenticated." } });
    return;
  }
  const body = parseOrRespond(voteQuestionSchema, req.body ?? {}, res);
  if (body === null) return;
  const questionId = typeof req.params.id === "string" ? req.params.id : null;
  if (!questionId) {
    res
      .status(400)
      .json({ error: { code: "INVALID_ID", message: "Invalid question id." } });
    return;
  }
  const res2 = await voteQuestion({
    questionId,
    userId: req.user.id,
    direction: body.direction as -1 | 0 | 1,
    cameOnExam: body.cameOnExam,
  });
  res.status(201).json(res2);
};

export const markCameOnExamController = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res
      .status(401)
      .json({ error: { code: "UNAUTHORIZED", message: "Not authenticated." } });
    return;
  }
  const body = parseOrRespond(markCameOnExamSchema, req.body ?? {}, res);
  if (body === null) return;
  const questionId = typeof req.params.id === "string" ? req.params.id : null;
  if (!questionId) {
    res
      .status(400)
      .json({ error: { code: "INVALID_ID", message: "Invalid question id." } });
    return;
  }
  const result = await markCameOnExam({
    questionId,
    userId: req.user.id,
    cameOnExam: body.cameOnExam,
  });
  res.status(201).json(result);
};

export const getStatsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const questionId = typeof req.params.id === "string" ? req.params.id : null;
  if (!questionId) {
    res
      .status(400)
      .json({ error: { code: "INVALID_ID", message: "Invalid question id." } });
    return;
  }
  const stats = await getQuestionStats(questionId);
  if (!req.user) {
    res.json({ ...stats, myVote: null });
    return;
  }
  const my = await getUserVote({ questionId, userId: req.user.id });
  res.json({ ...stats, myVote: my });
};

export const verifiedPoolController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const query = parseOrRespond(verifiedPoolQuerySchema, req.query ?? {}, res);
  if (query === null) return;
  const pool = await getVerifiedPool({
    limit: query.limit,
    offset: query.offset,
  });
  res.json(pool);
};
