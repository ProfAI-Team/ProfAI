import type { Request, Response } from "express";
import fs from "node:fs/promises";

import { badRequest, notFound, unauthorized } from "../lib/AppError";
import {
  deleteOCR,
  extractFromImage,
  listOCRForUser,
} from "../services/ocrService";

// Accepts a single multipart file under field name "image". The route
// wires Multer disk storage so `req.file.path` is present. We read the
// file into memory for Gemini + persist the same URL back on the row.

export const uploadOCR = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw unauthorized("Not authenticated.");
  if (!req.file) throw badRequest("No image uploaded.");

  const buffer = await fs.readFile(req.file.path);
  const fileUrl = `/uploads/${req.file.filename}`;

  const result = await extractFromImage({
    userId: req.user.id,
    buffer,
    mimeType: req.file.mimetype,
    fileUrl,
  });

  res.status(201).json({
    status: "ready",
    result: result.result,
    lowConfidence: result.lowConfidence,
    fallbackUsed: result.fallbackUsed,
  });
};

export const getMyOCR = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw unauthorized("Not authenticated.");
  const limit = Number.parseInt(
    typeof req.query.limit === "string" ? req.query.limit : "20",
    10
  );
  const results = await listOCRForUser(req.user.id, limit);
  res.json({ results });
};

export const deleteMyOCR = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) throw unauthorized("Not authenticated.");
  const id = typeof req.params.id === "string" ? req.params.id : null;
  if (!id) throw badRequest("Invalid OCR id.");
  const ok = await deleteOCR(req.user.id, id);
  if (!ok) throw notFound("OCR result not found.");
  res.status(204).send();
};
