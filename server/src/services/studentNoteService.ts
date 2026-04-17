import fs from "fs/promises";

import prisma from "../lib/prisma";
import {
  extractText,
  UnsupportedMimeTypeError,
} from "../lib/textExtract";

export const MIN_WORDCOUNT_FOR_STUDY_PACK = 500;

export interface UploadedNoteInput {
  userId: string;
  title: string;
  courseId?: string | null;
  filePath: string; // absolute path on disk
  fileUrl: string; // public `/uploads/...` URL
  mimeType: string;
  originalName: string;
}

export interface UploadedNoteResult {
  id: string;
  title: string;
  wordCount: number;
  fileUrl: string;
  warning?: "insufficient_content";
  error?: never;
}

export interface FailedNoteResult {
  originalName: string;
  error: "EXTRACTION_UNSUPPORTED" | "EXTRACTION_FAILED" | "DB_FAILED";
  message: string;
}

export async function ingestNote(
  input: UploadedNoteInput
): Promise<UploadedNoteResult | FailedNoteResult> {
  let buffer: Buffer;
  try {
    buffer = await fs.readFile(input.filePath);
  } catch (err) {
    return {
      originalName: input.originalName,
      error: "EXTRACTION_FAILED",
      message: err instanceof Error ? err.message : "Failed to read upload",
    };
  }

  let extracted;
  try {
    extracted = await extractText(buffer, input.mimeType);
  } catch (err) {
    if (err instanceof UnsupportedMimeTypeError) {
      return {
        originalName: input.originalName,
        error: "EXTRACTION_UNSUPPORTED",
        message: err.message,
      };
    }
    return {
      originalName: input.originalName,
      error: "EXTRACTION_FAILED",
      message: err instanceof Error ? err.message : "Extraction failed",
    };
  }

  try {
    const note = await prisma.studentNote.create({
      data: {
        userId: input.userId,
        courseId: input.courseId ?? null,
        title: input.title,
        fileUrl: input.fileUrl,
        mimeType: input.mimeType,
        extractedText: extracted.text,
        wordCount: extracted.wordCount,
      },
    });

    const result: UploadedNoteResult = {
      id: note.id,
      title: note.title,
      wordCount: note.wordCount,
      fileUrl: note.fileUrl,
    };
    if (note.wordCount < MIN_WORDCOUNT_FOR_STUDY_PACK) {
      result.warning = "insufficient_content";
    }
    return result;
  } catch (err) {
    return {
      originalName: input.originalName,
      error: "DB_FAILED",
      message: err instanceof Error ? err.message : "DB write failed",
    };
  }
}

export async function listNotesForUser(userId: string) {
  return prisma.studentNote.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      courseId: true,
      fileUrl: true,
      mimeType: true,
      wordCount: true,
      createdAt: true,
    },
  });
}

export async function getNoteForUser(id: string, userId: string) {
  return prisma.studentNote.findFirst({ where: { id, userId } });
}
