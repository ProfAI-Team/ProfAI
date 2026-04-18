import type { Request, Response } from "express";

import { badRequest, notFound, unauthorized } from "../lib/AppError";
import {
  enqueueLectureTranscribe,
  getLectureById,
  listLecturesForUser,
} from "../services/lectureAudioService";
import { parseOrRespond } from "../lib/validation";
import { lectureUploadBodySchema } from "../schemas/multimodal";

export const uploadLecture = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) throw unauthorized("Not authenticated.");
  if (!req.file) throw badRequest("No audio uploaded.");

  const body = parseOrRespond(lectureUploadBodySchema, req.body ?? {}, res);
  if (body === null) return;

  const fileUrl = `/uploads/${req.file.filename}`;
  const result = await enqueueLectureTranscribe({
    userId: req.user.id,
    fileUrl,
    durationHintSec: body.durationHintSec ?? null,
    professorId: body.professorId ?? null,
  });

  res.status(result.status === "duplicate" ? 200 : 202).json({
    status: result.status,
    fileHash: result.fileHash,
    message:
      result.status === "duplicate"
        ? "Bu ses dosyası daha önce işlenmiş."
        : "Ders kaydı işleme kuyruğunda. Hazır olunca listeyi yenile.",
  });
};

export const getLecture = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) throw unauthorized("Not authenticated.");
  const id = typeof req.params.id === "string" ? req.params.id : null;
  if (!id) throw badRequest("Invalid lecture id.");

  const lecture = await getLectureById(id, req.user.id);
  if (!lecture) throw notFound("Lecture not found.");
  res.json({ lecture });
};

export const listMyLectures = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) throw unauthorized("Not authenticated.");
  const lectures = await listLecturesForUser(req.user.id);
  res.json({ lectures });
};
