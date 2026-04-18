import webpush, { type PushSubscription } from "web-push";

import prisma from "../lib/prisma";
import { featureLogger } from "../lib/logger";

// Phase 6 task 6.14 — Web push delivery backbone.
//
// VAPID keys live in env (`VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` /
// `VAPID_SUBJECT`). When the private key is absent (dev without
// push configured), every delivery resolves as a no-op + logs a warn
// — that keeps the spaced-repetition scheduler from exploding on
// boot while developers work on other tasks.

const log = featureLogger("push");

let configured = false;

export function configurePush(): void {
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:noreply@profai.local";
  if (!pub || !priv) {
    configured = false;
    return;
  }
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
}

configurePush();

export function isPushConfigured(): boolean {
  return configured;
}

export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY ?? null;
}

export interface RegisterDeviceInput {
  userId: string;
  endpoint: string;
  p256dhKey: string;
  authKey: string;
  userAgent?: string | null;
}

export async function registerDevice(input: RegisterDeviceInput): Promise<void> {
  await prisma.pushDevice.upsert({
    where: { endpoint: input.endpoint },
    update: {
      userId: input.userId,
      p256dhKey: input.p256dhKey,
      authKey: input.authKey,
      userAgent: input.userAgent ?? null,
      lastSeenAt: new Date(),
    },
    create: {
      userId: input.userId,
      endpoint: input.endpoint,
      p256dhKey: input.p256dhKey,
      authKey: input.authKey,
      userAgent: input.userAgent ?? null,
    },
  });
  log.info({ userId: input.userId }, "push device registered");
}

export async function unregisterDevice(userId: string, id: string): Promise<boolean> {
  const res = await prisma.pushDevice.deleteMany({
    where: { id, userId },
  });
  return res.count > 0;
}

export async function listDevicesForUser(userId: string): Promise<
  Array<{ id: string; endpoint: string; userAgent: string | null; lastSeenAt: Date }>
> {
  return prisma.pushDevice.findMany({
    where: { userId },
    select: { id: true, endpoint: true, userAgent: true, lastSeenAt: true },
    orderBy: { lastSeenAt: "desc" },
  });
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export interface DeliveryResult {
  attempted: number;
  delivered: number;
  pruned: number;
}

export async function sendPush(
  userId: string,
  payload: PushPayload
): Promise<DeliveryResult> {
  if (!configured) {
    log.warn(
      { userId },
      "push not configured — skipping delivery (set VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY)"
    );
    return { attempted: 0, delivered: 0, pruned: 0 };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pushOptIn: true },
  });
  if (!user || !user.pushOptIn) {
    return { attempted: 0, delivered: 0, pruned: 0 };
  }

  const devices = await prisma.pushDevice.findMany({ where: { userId } });
  if (devices.length === 0) {
    return { attempted: 0, delivered: 0, pruned: 0 };
  }

  let delivered = 0;
  let pruned = 0;

  await Promise.all(
    devices.map(async (device) => {
      const subscription: PushSubscription = {
        endpoint: device.endpoint,
        keys: {
          p256dh: device.p256dhKey,
          auth: device.authKey,
        },
      };
      try {
        await webpush.sendNotification(subscription, JSON.stringify(payload), {
          TTL: 60 * 60, // 1 hour — reviews are time-sensitive but not immediate
        });
        delivered += 1;
      } catch (err) {
        // web-push raises an error with statusCode 410 when the
        // subscription is permanently dead.
        const statusCode =
          err && typeof err === "object" && "statusCode" in err
            ? (err as { statusCode?: number }).statusCode
            : undefined;
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushDevice
            .delete({ where: { id: device.id } })
            .catch(() => undefined);
          pruned += 1;
          log.info({ userId, deviceId: device.id }, "pruned dead push device");
        } else {
          log.error(
            { err, userId, deviceId: device.id, statusCode },
            "push delivery failed"
          );
        }
      }
    })
  );

  return { attempted: devices.length, delivered, pruned };
}

export async function setOptIn(userId: string, optIn: boolean): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { pushOptIn: optIn },
  });
  log.info({ userId, optIn }, "push opt-in toggled");
}
