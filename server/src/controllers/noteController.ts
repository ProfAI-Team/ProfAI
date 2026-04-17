import { Request, Response } from "express";

import prisma from "../lib/prisma";
import {
  ingestNote,
  listNotesForUser,
} from "../services/studentNoteService";

export const uploadNotes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }

    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (files.length === 0) {
      res.status(400).json({ error: "No files uploaded." });
      return;
    }

    const courseIdRaw = req.body?.courseId;
    const courseId =
      typeof courseIdRaw === "string" && courseIdRaw.trim().length > 0
        ? courseIdRaw.trim()
        : null;

    if (courseId) {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course) {
        res.status(404).json({ error: "Course not found." });
        return;
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
  } catch (error) {
    console.error("Upload notes error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getMyNotes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }
    const notes = await listNotesForUser(req.user.id);
    res.json({ notes });
  } catch (error) {
    console.error("List notes error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
