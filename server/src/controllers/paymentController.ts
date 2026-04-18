import { Request, Response } from "express";

import {
  initPayment,
  handleWebhook,
  refundPayment,
} from "../services/paymentService";
import prisma from "../lib/prisma";
import { unauthorized, badRequest, notFound } from "../lib/AppError";
import { initPaymentSchema } from "../schemas/b2b";

export const init = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw unauthorized();
  const parsed = initPaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    throw badRequest("Invalid payment payload", parsed.error.issues);
  }
  const result = await initPayment({
    userId: req.user.id,
    ...parsed.data,
  });
  res.status(201).json({ data: result });
};

export const iyzicoWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  // req.body arrives as a parsed object; we re-serialize it for the HMAC
  // check. Prod behind a reverse proxy should use express.raw for this
  // path to preserve exact byte order — Phase 8 hardening.
  const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
  const headerMap: Record<string, string> = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (typeof v === "string") headerMap[k] = v;
  }
  const result = await handleWebhook({ body, headers: headerMap });
  res.json({ data: result });
};

export const myPayments = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) throw unauthorized();
  const rows = await prisma.payment.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json({ data: rows });
};

export const refund = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = req.params.id as string | undefined;
  if (!id) throw badRequest("Missing payment id");
  const updated = await refundPayment({ paymentId: id });
  res.json({ data: updated });
};
