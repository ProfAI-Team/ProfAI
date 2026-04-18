import { Request, Response } from "express";

import prisma from "../lib/prisma";
import {
  ingestNote,
  listNotesForUser,
} from "../services/studentNoteService";
import { badRequest, notFound, unauthorized } from "../lib/AppError";

export const uploadNotes = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw unauthorized("Not authenticated.");
  }

  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) {
    throw badRequest("No files uploaded.");
  }

  const courseIdRaw = req.body?.courseId;
  const courseId =
    typeof courseIdRaw === "string" && courseIdRaw.trim().length > 0
      ? courseIdRaw.trim()
      : null;

  if (courseId) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      throw notFound("Course not found.");
    }
  }

  // Optional user-provided titles, parallel array to files (`titles[0]`, …).
  // Multer preserves field order so index alignment is safe.
  const titles = (() => {
    const raw = req.body?.titles;
    if (Array.isArray(raw)) return raw.map((t) => String(t));
    if (typeof raw === "string") return [raw];
    return [];
  })();

  const notes = [];
  const errors = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const title =
      titles[i]?.trim() ||
      file.originalname.replace(/\.[^.]+$/, "") ||
      "Not";

    const result = await ingestNote({
      userId: req.user.id,
      title,
      courseId,
      filePath: file.path,
      fileUrl: `/uploads/${file.filename}`,
      mimeType: file.mimetype,
      originalName: file.originalname,
    });

    if ("error" in result && result.error) {
      errors.push(result);
    } else {
      notes.push(result);
    }
  }

  const status = notes.length === 0 ? 400 : 201;
  res.status(status).json({ notes, errors });
};

export const getMyNotes = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw unauthorized("Not authenticated.");
  }
  const notes = await listNotesForUser(req.user.id);
  res.json({ notes });
};
