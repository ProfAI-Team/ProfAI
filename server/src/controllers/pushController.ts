import type { Request, Response } from "express";

import { badRequest, notFound, unauthorized } from "../lib/AppError";
import { parseOrRespond } from "../lib/validation";
import {
  getVapidPublicKey,
  isPushConfigured,
  listDevicesForUser,
  registerDevice,
  sendPush,
  setOptIn,
  unregisterDevice,
} from "../services/pushNotificationService";
import { pushOptInSchema, registerPushDeviceSchema } from "../schemas/multimodal";

export const getConfig = async (_req: Request, res: Response): Promise<void> => {
  res.json({
    configured: isPushConfigured(),
    vapidPublicKey: getVapidPublicKey(),
  });
};

export const registerMyDevice = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) throw unauthorized("Not authenticated.");

  const body = parseOrRespond(registerPushDeviceSchema, req.body ?? {}, res);
  if (body === null) return;

  await registerDevice({
    userId: req.user.id,
    endpoint: body.endpoint,
    p256dhKey: body.keys.p256dh,
    authKey: body.keys.auth,
    userAgent: body.userAgent,
  });
  res.status(201).json({ status: "registered" });
};

export const deleteMyDevice = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) throw unauthorized("Not authenticated.");
  const id = typeof req.params.id === "string" ? req.params.id : null;
  if (!id) throw badRequest("Invalid device id.");
  const ok = await unregisterDevice(req.user.id, id);
  if (!ok) throw notFound("Device not found.");
  res.status(204).send();
};

export const listMyDevices = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) throw unauthorized("Not authenticated.");
  const devices = await listDevicesForUser(req.user.id);
  res.json({ devices });
};

export const setMyOptIn = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) throw unauthorized("Not authenticated.");
  const body = parseOrRespond(pushOptInSchema, req.body ?? {}, res);
  if (body === null) return;
  await setOptIn(req.user.id, body.optIn);
  res.json({ optIn: body.optIn });
};

// Dev-only test endpoint — guarded behind NODE_ENV so prod never
// exposes an arbitrary push trigger.
export const testPush = async (req: Request, res: Response): Promise<void> => {
  if (process.env.NODE_ENV === "production") {
    throw notFound("Not available.");
  }
  if (!req.user) throw unauthorized("Not authenticated.");
  const result = await sendPush(req.user.id, {
    title: "ProfAI — test bildirimi",
    body: "Bildirimler çalışıyor. İyi çalışmalar.",
    url: "/me/reviews",
    tag: "test",
  });
  res.json(result);
};
