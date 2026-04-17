import { Request, Response } from "express";

import { parseOrRespond } from "../lib/validation";
import { generateStudyPackSchema } from "../schemas/study-pack";
import {
  generateStudyPack,
  getStudyPack,
  listMyStudyPacks,
} from "../services/studyPackService";

export const generate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated." });
      return;
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
  } catch (error) {
    console.error("Generate study pack error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    if (typeof id !== "string" || !id) {
      res.status(400).json({ error: "Invalid study pack id." });
      return;
    }
    const pack = await getStudyPack(id, req.user.id);
    if (!pack) {
      res.status(404).json({ error: "Study pack not found." });
      return;
    }
    res.json({ pack });
  } catch (error) {
    console.error("Get study pack error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const listMine = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }
    const page = parseInt((req.query.page as string) ?? "1", 10) || 1;
    const limit = parseInt((req.query.limit as string) ?? "20", 10) || 20;
    const result = await listMyStudyPacks(req.user.id, page, limit);
    res.json(result);
  } catch (error) {
    console.error("List study packs error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
