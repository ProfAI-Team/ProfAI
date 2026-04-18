import { describe, it, expect } from "vitest";

import prisma from "../../src/lib/prisma";
import {
  listDevicesForUser,
  registerDevice,
  sendPush,
  setOptIn,
  unregisterDevice,
} from "../../src/services/pushNotificationService";

const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

async function makeUser(suffix: string) {
  return prisma.user.create({
    data: {
      email: `push-${suffix}-${Date.now()}-${Math.random()}@test.local`,
      password: "x",
      name: "Push Tester",
    },
  });
}

describeIfDb("pushNotificationService", () => {
  it("registerDevice upserts by endpoint; second call updates the row", async () => {
    const user = await makeUser("register");
    const endpoint = `https://push.example.com/u/${user.id}`;

    await registerDevice({
      userId: user.id,
      endpoint,
      p256dhKey: "p1",
      authKey: "a1",
      userAgent: "first-ua",
    });
    await registerDevice({
      userId: user.id,
      endpoint,
      p256dhKey: "p1",
      authKey: "a1",
      userAgent: "second-ua",
    });

    const devices = await listDevicesForUser(user.id);
    expect(devices).toHaveLength(1);
    expect(devices[0].userAgent).toBe("second-ua");
  });

  it("unregisterDevice only deletes devices owned by the caller", async () => {
    const owner = await makeUser("owner");
    const stranger = await makeUser("stranger");
    await registerDevice({
      userId: owner.id,
      endpoint: `https://push.example.com/u2/${owner.id}`,
      p256dhKey: "p",
      authKey: "a",
    });
    const [device] = await listDevicesForUser(owner.id);

    const okForStranger = await unregisterDevice(stranger.id, device.id);
    expect(okForStranger).toBe(false);

    const okForOwner = await unregisterDevice(owner.id, device.id);
    expect(okForOwner).toBe(true);

    expect(await listDevicesForUser(owner.id)).toHaveLength(0);
  });

  it("sendPush is a no-op when push is not configured (dev default)", async () => {
    const user = await makeUser("noconfig");
    await setOptIn(user.id, true);
    await registerDevice({
      userId: user.id,
      endpoint: `https://push.example.com/u3/${user.id}`,
      p256dhKey: "p",
      authKey: "a",
    });

    // No VAPID env set in test — configurePush left configured=false.
    const result = await sendPush(user.id, {
      title: "t",
      body: "b",
    });
    expect(result).toEqual({ attempted: 0, delivered: 0, pruned: 0 });
  });

  it("sendPush respects pushOptIn=false", async () => {
    const user = await makeUser("optedout");
    await setOptIn(user.id, false);
    const result = await sendPush(user.id, { title: "t", body: "b" });
    expect(result.attempted).toBe(0);
  });
});
