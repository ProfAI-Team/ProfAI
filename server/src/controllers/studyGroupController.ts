import type { Request, Response } from "express";

import { parseOrRespond } from "../lib/validation";
import {
  joinMatchmakingSchema,
  submitLinkSchema,
} from "../schemas/community";
import {
  joinMatchmaking,
  submitExternalLink,
  listForUser,
  listSuggestionsForProfessor,
  StudyGroupError,
} from "../services/studyGroupService";

export const joinMatchmakingController = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res
      .status(401)
      .json({ error: { code: "UNAUTHORIZED", message: "Not authenticated." } });
    return;
  }
  const body = parseOrRespond(joinMatchmakingSchema, req.body ?? {}, res);
  if (body === null) return;
  const examDate = body.examDate ? new Date(body.examDate) : null;
  const result = await joinMatchmaking({
    userId: req.user.id,
    professorId: body.professorId,
    courseId: body.courseId,
    examDate,
  });
  res.status(201).json(result);
};

export const submitLinkController = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res
      .status(401)
      .json({ error: { code: "UNAUTHORIZED", message: "Not authenticated." } });
    return;
  }
  const body = parseOrRespond(submitLinkSchema, req.body ?? {}, res);
  if (body === null) return;
  const groupId = typeof req.params.id === "string" ? req.params.id : null;
  if (!groupId) {
    res
      .status(400)
      .json({ error: { code: "INVALID_ID", message: "Invalid group id." } });
    return;
  }
  try {
    const result = await submitExternalLink({
      groupId,
      userId: req.user.id,
      url: body.url,
    });
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof StudyGroupError) {
      const status =
        err.code === "NOT_FOUND"
          ? 404
          : err.code === "LINK_NOT_ALLOWED"
          ? 400
          : 403;
      res.status(status).json({
        error: { code: err.code, message: err.message },
      });
      return;
    }
    console.error("submitLink error:", err);
    res
      .status(500)
      .json({ error: { code: "INTERNAL", message: "Unexpected error." } });
  }
};

export const listMineController = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res
      .status(401)
      .json({ error: { code: "UNAUTHORIZED", message: "Not authenticated." } });
    return;
  }
  const rows = await listForUser(req.user.id);
  res.json({ groups: rows });
};

export const listSuggestionsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res
      .status(401)
      .json({ error: { code: "UNAUTHORIZED", message: "Not authenticated." } });
    return;
  }
  const professorId =
    typeof req.params.professorId === "string" ? req.params.professorId : null;
  if (!professorId) {
    res.status(400).json({
      error: { code: "INVALID_ID", message: "Invalid professor id." },
    });
    return;
  }
  const suggestions = await listSuggestionsForProfessor({
    professorId,
    userId: req.user.id,
  });
  res.json({ suggestions });
};
