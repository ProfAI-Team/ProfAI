import { Request, Response } from "express";
import { z } from "zod";

import { badRequest, unauthorized } from "../lib/AppError";
import { purgeUserData } from "../services/accountService";

/**
 * Phase 7 task 7.4 — self-serve data deletion controller.
 */

const bodySchema = z.object({
  password: z.string().min(1),
});

export const deleteMyData = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) throw unauthorized();

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    throw badRequest("Password confirmation required", parsed.error.issues);
  }

  const report = await purgeUserData({
    userId: req.user.id,
    passwordPlainText: parsed.data.password,
  });
  // Blow away the token so the client UI can switch to landing
  // immediately even before the client app's logout() fires.
  res.status(200).json({
    data: {
      message: "Your account and all related data have been removed.",
      report,
    },
  });
};
