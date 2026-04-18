import { describe, it, expect, beforeEach } from "vitest";

import prisma from "../../src/lib/prisma";
import {
  endSession,
  getVoiceUsage,
  startSession,
  VOICE_DAILY_SEC_CAP,
} from "../../src/services/voiceTutorService";

const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

async function makeUser(suffix: string) {
  return prisma.user.create({
    data: {
      email: `voice-${suffix}-${Date.now()}-${Math.random()}@test.local`,
      password: "x",
      name: "Voice Tester",
    },
  });
}

describeIfDb("voiceTutorService", () => {
  beforeEach(async () => {
    // No cross-test cleanup needed — each test builds its own user, and
    // VoiceSession / VoiceUsage rows cascade off User deletion.
  });

  it("startSession returns ready with the full cap when usage is empty", async () => {
    const user = await makeUser("start-fresh");
    const res = await startSession({ userId: user.id });
    expect(res.status).toBe("ready");
    if (res.status !== "ready") return;
    expect(res.remainingSec).toBe(VOICE_DAILY_SEC_CAP);
    expect(res.handshake.provider).toBe("gemini-live");
  });

  it("endSession persists the row and bumps today's VoiceUsage atomically", async () => {
    const user = await makeUser("end-persist");
    const res = await startSession({ userId: user.id });
    expect(res.status).toBe("ready");
    if (res.status !== "ready") return;

    const session = await endSession({
      userId: user.id,
      sessionId: res.sessionId,
      durationSec: 120,
      transcript: "Test konuşması.",
      topics: [{ topic: "integraller", startSec: 0, endSec: 60 }],
      provider: "gemini-live",
      interruptCount: 1,
      fallbackUsed: false,
    });
    expect(session.durationSec).toBe(120);
    expect(session.interruptCount).toBe(1);

    const usage = await getVoiceUsage(user.id);
    expect(usage.totalSec).toBe(120);
    expect(usage.sessionCount).toBe(1);
  });

  it("endSession is idempotent on sessionId", async () => {
    const user = await makeUser("idempotent");
    const res = await startSession({ userId: user.id });
    if (res.status !== "ready") return;

    const payload = {
      userId: user.id,
      sessionId: res.sessionId,
      durationSec: 90,
      transcript: "",
      topics: [],
      provider: "gemini-live" as const,
      interruptCount: 0,
      fallbackUsed: false,
    };

    const first = await endSession(payload);
    const second = await endSession(payload);
    expect(second.id).toBe(first.id);

    const usage = await getVoiceUsage(user.id);
    // Second call short-circuits — usage only counts once.
    expect(usage.totalSec).toBe(90);
    expect(usage.sessionCount).toBe(1);
  });

  it("quota_exceeded fires when the daily cap has been spent", async () => {
    const user = await makeUser("quota");
    await prisma.voiceUsage.create({
      data: {
        userId: user.id,
        date: (() => {
          const d = new Date();
          d.setUTCHours(0, 0, 0, 0);
          return d;
        })(),
        totalSec: VOICE_DAILY_SEC_CAP,
        sessionCount: 99,
      },
    });
    const res = await startSession({ userId: user.id });
    expect(res.status).toBe("quota_exceeded");
  });

  it("durationSec is clamped to the cap on endSession", async () => {
    const user = await makeUser("clamp");
    const res = await startSession({ userId: user.id });
    if (res.status !== "ready") return;

    const session = await endSession({
      userId: user.id,
      sessionId: res.sessionId,
      durationSec: 99_999, // way above cap
      transcript: "",
      topics: [],
      provider: "gemini-live",
      interruptCount: 0,
      fallbackUsed: false,
    });
    expect(session.durationSec).toBe(VOICE_DAILY_SEC_CAP);
  });
});
