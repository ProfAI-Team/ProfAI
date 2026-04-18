import { Request, Response } from "express";

import { parseOrRespond } from "../lib/validation";
import { generateStudyPackSchema } from "../schemas/study-pack";
import {
  generateStudyPack,
  getStudyPack,
  listMyStudyPacks,
} from "../services/studyPackService";
import { badRequest, notFound, unauthorized } from "../lib/AppError";

export const generate = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw unauthorized("Not authenticated.");
  }

  const body = parseOrRespond(generateStudyPackSchema, req.body ?? {}, res);
  if (body === null) return;

  const result = await generateStudyPack({
    userId: req.user.id,
    professorId: body.professorId,
    noteIds: body.noteIds,
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
    distributionWithinTolerance: result.distributionWithinTolerance,
    pack: result.pack,
  });
};

export const getById = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw unauthorized("Not authenticated.");
  }
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  if (typeof id !== "string" || !id) {
    throw badRequest("Invalid study pack id.");
  }
  const pack = await getStudyPack(id, req.user.id);
  if (!pack) {
    throw notFound("Study pack not found.");
  }
  res.json({ pack });
};

export const listMine = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw unauthorized("Not authenticated.");
  }
  const page = parseInt((req.query.page as string) ?? "1", 10) || 1;
  const limit = parseInt((req.query.limit as string) ?? "20", 10) || 20;
  const result = await listMyStudyPacks(req.user.id, page, limit);
  res.json(result);
};
