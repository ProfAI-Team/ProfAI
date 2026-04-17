import type { Request, Response } from "express";

import { parseOrRespond } from "../lib/validation";
import {
  castApprovalSchema,
  paginationQuerySchema,
} from "../schemas/community";
import {
  castApproval,
  listPending,
  getApprovalStats,
  ApprovalError,
} from "../services/examApprovalService";

export const castApprovalController = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res
      .status(401)
      .json({ error: { code: "UNAUTHORIZED", message: "Not authenticated." } });
    return;
  }
  const body = parseOrRespond(castApprovalSchema, req.body ?? {}, res);
  if (body === null) return;

  const examId = typeof req.params.id === "string" ? req.params.id : null;
  if (!examId) {
    res
      .status(400)
      .json({ error: { code: "INVALID_ID", message: "Invalid exam id." } });
    return;
  }

  try {
    const outcome = await castApproval({
      examId,
      userId: req.user.id,
      approved: body.approved,
      reason: body.reason,
    });
    res.status(201).json(outcome);
  } catch (err) {
    if (err instanceof ApprovalError) {
      const status = err.code === "NOT_FOUND" ? 404 : 403;
      res.status(status).json({
        error: { code: err.code, message: err.message },
      });
      return;
    }
    console.error("castApproval error:", err);
    res
      .status(500)
      .json({ error: { code: "INTERNAL", message: "Unexpected error." } });
  }
};

export const listPendingController = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res
      .status(401)
      .json({ error: { code: "UNAUTHORIZED", message: "Not authenticated." } });
    return;
  }
  const query = parseOrRespond(paginationQuerySchema, req.query ?? {}, res);
  if (query === null) return;
  const result = await listPending(req.user.id, {
    limit: query.limit,
    offset: query.offset,
  });
  res.json(result);
};

export const getApprovalStatsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const examId = typeof req.params.id === "string" ? req.params.id : null;
  if (!examId) {
    res
      .status(400)
      .json({ error: { code: "INVALID_ID", message: "Invalid exam id." } });
    return;
  }
  const stats = await getApprovalStats(examId);
  res.json(stats);
};
