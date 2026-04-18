import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import prisma from "../../src/lib/prisma";
import { computeFileHash } from "../../src/services/lectureAudioService";

const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

async function makeUser(suffix: string) {
  return prisma.user.create({
    data: {
      email: `lecture-${suffix}-${Date.now()}-${Math.random()}@test.local`,
      password: "x",
      name: "Lecture Tester",
    },
  });
}

describeIfDb("lectureAudioService", () => {
  const originalInlineFlag = process.env.RUN_INLINE_QUEUE;

  beforeEach(() => {
    process.env.RUN_INLINE_QUEUE = "1";
  });

  afterEach(() => {
    if (originalInlineFlag === undefined) {
      delete process.env.RUN_INLINE_QUEUE;
    } else {
      process.env.RUN_INLINE_QUEUE = originalInlineFlag;
    }
    vi.resetModules();
  });

  it("computeFileHash is deterministic per (userId, fileUrl)", () => {
    const a = computeFileHash("/uploads/a.m4a", "user-1");
    const b = computeFileHash("/uploads/a.m4a", "user-1");
    const c = computeFileHash("/uploads/a.m4a", "user-2");
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  it("enqueueLectureTranscribe returns duplicate when the same fileHash already persisted", async () => {
    const user = await makeUser("dup");

    // Pre-seed a lecture row with the same fileHash our service will
    // compute; enqueue should short-circuit.
    const fileUrl = "/uploads/lecture-a.m4a";
    const fileHash = computeFileHash(fileUrl, user.id);
    await prisma.voiceSession.create({
      data: {
        id: fileHash,
        userId: user.id,
        sourceType: "lecture",
        durationSec: 0,
        transcript: "",
        topics: { fileHash, keyTopics: [], examHints: [] },
        provider: "gemini",
      },
    });

    // Re-import so the service picks up the inline-queue env flag.
    const { enqueueLectureTranscribe } = await import(
      "../../src/services/lectureAudioService"
    );

    const result = await enqueueLectureTranscribe({ userId: user.id, fileUrl });
    expect(result.status).toBe("duplicate");
    expect(result.fileHash).toBe(fileHash);
  });
});
