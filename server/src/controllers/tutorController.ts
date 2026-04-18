import { Request, Response } from "express";

import {
  createTutorProfile,
  getTutorById,
  matchTutors,
  getTutorByUserId,
  completeSession as completeSessionService,
} from "../services/tutorService";
import prisma from "../lib/prisma";
import { unauthorized, notFound, badRequest } from "../lib/AppError";
import {
  createTutorSchema,
  matchTutorSchema,
  bookSessionSchema,
  completeSessionSchema,
} from "../schemas/b2b";

export const apply = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw unauthorized();
  const parsed = createTutorSchema.safeParse(req.body);
  if (!parsed.success) {
    throw badRequest("Invalid tutor profile", parsed.error.issues);
  }
  const tutor = await createTutorProfile({
    userId: req.user.id,
    bio: parsed.data.bio,
    hourlyRate: parsed.data.hourlyRate,
    specializations: parsed.data.specializations,
    availability: parsed.data.availability,
  });
  res.status(201).json({ data: tutor });
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  const tutor = await getTutorById(req.params.id as string);
  if (!tutor) throw notFound("Tutor not found");
  res.json({ data: tutor });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw unauthorized();
  const tutor = await getTutorByUserId(req.user.id);
  res.json({ data: tutor });
};

export const match = async (req: Request, res: Response): Promise<void> => {
  // Public preview: anonymous callers get classic filtering (subject +
  // rating + price); signed-in students layer DNA embedding scoring on
  // top. See tutorService.matchTutors for the rubric split.
  const parsed = matchTutorSchema.safeParse(req.body);
  if (!parsed.success) {
    throw badRequest("Invalid filters", parsed.error.issues);
  }
  const results = await matchTutors({
    studentId: req.user?.id ?? null,
    ...parsed.data,
  });
  res.json({ data: { results } });
};

export const bookSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) throw unauthorized();
  const parsed = bookSessionSchema.safeParse(req.body);
  if (!parsed.success) {
    throw badRequest("Invalid booking payload", parsed.error.issues);
  }
  const tutor = await getTutorById(parsed.data.tutorId);
  if (!tutor || tutor.status !== "active") {
    throw notFound("Tutor not available for booking");
  }
  // Price = hourlyRate * hours.
  const hours = parsed.data.durationMin / 60;
  const price = Math.round(tutor.hourlyRate * hours);
  const session = await prisma.tutoringSession.create({
    data: {
      tutorId: tutor.id,
      studentId: req.user.id,
      scheduledAt: new Date(parsed.data.scheduledAt),
      durationMin: parsed.data.durationMin,
      status: "scheduled",
      price,
    },
  });
  res.status(201).json({ data: session });
};

export const getSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  const session = await prisma.tutoringSession.findUnique({
    where: { id: req.params.id as string },
  });
  if (!session) throw notFound("Session not found");
  res.json({ data: session });
};

export const completeSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = completeSessionSchema.safeParse(req.body);
  if (!parsed.success) {
    throw badRequest("Invalid completion payload", parsed.error.issues);
  }
  await completeSessionService({
    sessionId: req.params.id as string,
    rating: parsed.data.rating,
    feedback: parsed.data.feedback,
  });
  res.json({ data: { ok: true } });
};

export const mySessions = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) throw unauthorized();
  const sessions = await prisma.tutoringSession.findMany({
    where: { studentId: req.user.id },
    orderBy: { scheduledAt: "desc" },
    take: 50,
  });
  res.json({ data: sessions });
};
