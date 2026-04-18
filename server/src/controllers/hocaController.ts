import { Request, Response } from "express";

import {
  verifyHocaByEmail,
  getHocaDashboard,
  getHocaFeedback,
} from "../services/hocaPortalService";
import prisma from "../lib/prisma";
import { unauthorized, badRequest } from "../lib/AppError";
import { hocaVerifySchema } from "../schemas/b2b";

/**
 * Hoca portal controllers (Phase 7 task 7.17 + 7.16).
 *
 * Professor linkage: the hoca user's email domain matches their
 * university, and a SUPER_ADMIN picks which Professor row(s) belong to
 * them. Phase 7 MVP infers linkage from ProfessorRating history —
 * the hoca's claimed professorIds come from the request. Phase 8 adds
 * a proper HocaProfile table.
 */

async function inferProfessorIds(req: Request): Promise<string[]> {
  const raw = req.query.professorIds;
  if (typeof raw === "string" && raw.length > 0) {
    return raw.split(",").filter(Boolean);
  }
  return [];
}

export const verify = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw unauthorized();
  const parsed = hocaVerifySchema.safeParse(req.body);
  if (!parsed.success) {
    throw badRequest("Invalid payload", parsed.error.issues);
  }
  const matched = await verifyHocaByEmail({
    userId: req.user.id,
    email: parsed.data.universityEmail,
  });
  res.json({ data: matched });
};

export const dashboard = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) throw unauthorized();
  const professorIds = await inferProfessorIds(req);
  const data = await getHocaDashboard(req.user.id, professorIds);
  res.json({ data });
};

export const feedback = async (
  req: Request,
  res: Response
): Promise<void> => {
  const professorIds = await inferProfessorIds(req);
  const data = await getHocaFeedback(professorIds);
  res.json({ data });
};

export const profile = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) throw unauthorized();
  const data = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      university: true,
      department: true,
      role: true,
    },
  });
  res.json({ data });
};
