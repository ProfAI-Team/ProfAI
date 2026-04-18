import type { Request, Response } from "express";
import fs from "node:fs/promises";

import { badRequest, unauthorized } from "../lib/AppError";
import { searchByImage } from "../services/multimodalSearchService";

export const search = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw unauthorized("Not authenticated.");
  if (!req.file) throw badRequest("No image uploaded.");

  const buffer = await fs.readFile(req.file.path);
  const result = await searchByImage({
    userId: req.user.id,
    buffer,
    mimeType: req.file.mimetype,
    limit: Number.parseInt(
      typeof req.query.limit === "string" ? req.query.limit : "10",
      10
    ),
  });
  res.json(result);
};
