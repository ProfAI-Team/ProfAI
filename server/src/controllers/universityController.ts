import { Request, Response } from "express";

import {
  getDashboard,
  addSeat,
  removeSeat,
  provisionSso,
} from "../services/universityAdminService";
import { unauthorized, badRequest, forbidden } from "../lib/AppError";
import {
  universitySeatAddSchema,
  universitySsoSchema,
} from "../schemas/b2b";

function tenantForRequest(req: Request): string {
  if (!req.user) throw unauthorized();
  const { role, universityAccountId } = req.user;
  if (role === "SUPER_ADMIN") {
    // Admins can target any tenant via query param ?tenantId=; otherwise
    // they must pass their own. Phase 7 MVP uses the query param only
    // because the admin UI knows which tenant is being inspected.
    const target = (req.query.tenantId as string | undefined) ?? universityAccountId;
    if (!target) throw badRequest("tenantId query param required for SUPER_ADMIN");
    return target;
  }
  if (!universityAccountId) {
    throw forbidden("Your account is not linked to a university tenant");
  }
  return universityAccountId;
}

export const dashboard = async (
  req: Request,
  res: Response
): Promise<void> => {
  const tenantId = tenantForRequest(req);
  const data = await getDashboard(tenantId);
  res.json({ data });
};

export const addSeatController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const tenantId = tenantForRequest(req);
  const parsed = universitySeatAddSchema.safeParse(req.body);
  if (!parsed.success) {
    throw badRequest("Invalid payload", parsed.error.issues);
  }
  await addSeat(tenantId, parsed.data.userEmail);
  res.status(201).json({ data: { ok: true } });
};

export const removeSeatController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const tenantId = tenantForRequest(req);
  await removeSeat(tenantId, req.params.userId as string);
  res.json({ data: { ok: true } });
};

export const ssoController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const tenantId = tenantForRequest(req);
  const parsed = universitySsoSchema.safeParse(req.body);
  if (!parsed.success) {
    throw badRequest("Invalid payload", parsed.error.issues);
  }
  await provisionSso({
    tenantId,
    samlMetadata: parsed.data.samlMetadata,
  });
  res.json({ data: { ok: true } });
};
