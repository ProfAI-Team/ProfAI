import type { Request, Response } from "express";

import { parseOrRespond } from "../lib/validation";
import {
  postExamReportSchema,
  aggregatedReportQuerySchema,
} from "../schemas/community";
import {
  submitReport,
  getAggregatedReport,
} from "../services/postExamReportService";
import { getHighPerformerStrategy } from "../services/highPerformerInsightService";

export const submitReportController = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res
      .status(401)
      .json({ error: { code: "UNAUTHORIZED", message: "Not authenticated." } });
    return;
  }
  const body = parseOrRespond(postExamReportSchema, req.body ?? {}, res);
  if (body === null) return;

  const result = await submitReport({
    userId: req.user.id,
    professorId: body.professorId,
    courseId: body.courseId,
    examDate: new Date(body.examDate),
    reportedTopics: body.reportedTopics,
    notes: body.notes,
    selfReportedGrade: body.selfReportedGrade,
    selfReportedLetter: body.selfReportedLetter,
  });
  res.status(201).json(result);
};

export const getAggregatedController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const professorId =
    typeof req.params.professorId === "string" ? req.params.professorId : null;
  if (!professorId) {
    res.status(400).json({
      error: { code: "INVALID_ID", message: "Invalid professor id." },
    });
    return;
  }
  const query = parseOrRespond(
    aggregatedReportQuerySchema,
    req.query ?? {},
    res
  );
  if (query === null) return;

  const report = await getAggregatedReport(professorId, {
    windowMonths: query.windowMonths,
  });
  res.json(report);
};

export const getHighPerformerController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const professorId =
    typeof req.params.professorId === "string" ? req.params.professorId : null;
  if (!professorId) {
    res.status(400).json({
      error: { code: "INVALID_ID", message: "Invalid professor id." },
    });
    return;
  }
  const result = await getHighPerformerStrategy(professorId);
  res.json(result);
};
