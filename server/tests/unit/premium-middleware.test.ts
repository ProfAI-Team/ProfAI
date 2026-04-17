import { describe, it, expect, beforeEach } from "vitest";

import prisma from "../../src/lib/prisma";
import { requirePremium } from "../../src/middleware/premiumMiddleware";
import { PREMIUM_FEATURES } from "../../src/config/premiumFeatures";

const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

function mkHandlerInvocation(userId: string | undefined) {
  const captured: { err?: unknown; nextCalled: boolean } = { nextCalled: false };
  const req = userId ? ({ user: { id: userId } } as any) : ({} as any);
  const res = {} as any;
  const next = (err?: unknown) => {
    if (err) captured.err = err;
    else captured.nextCalled = true;
  };
  return { req, res, next, captured };
}

describeIfDb("requirePremium middleware", () => {
  async function makeUser(tier: "free" | "premium", suffix: string) {
    return prisma.user.create({
      data: {
        email: `prem-${suffix}-${Date.now()}-${Math.random()}@test.local`,
        password: "x",
        name: "Prem Tester",
        subscriptionTier: tier,
      },
    });
  }

  beforeEach(async () => {
    // No-op beforeEach — each test makes its own users with unique emails.
  });

  it("401 UNAUTHORIZED when req.user is absent", async () => {
    const handler = requirePremium("COURSE_ADVISOR");
    const { req, res, next, captured } = mkHandlerInvocation(undefined);
    await handler(req, res, next);
    expect(captured.nextCalled).toBe(false);
    expect(captured.err).toMatchObject({ code: "UNAUTHORIZED", status: 401 });
  });

  it("402 PREMIUM_REQUIRED when user is on the free tier", async () => {
    const user = await makeUser("free", "free");
    const handler = requirePremium("COURSE_ADVISOR");
    const { req, res, next, captured } = mkHandlerInvocation(user.id);
    await handler(req, res, next);
    expect(captured.err).toMatchObject({
      code: "PREMIUM_REQUIRED",
      status: 402,
    });
  });

  it("passes through when user is premium + feature enabled", async () => {
    const user = await makeUser("premium", "paid");
    const handler = requirePremium("COURSE_ADVISOR");
    const { req, res, next, captured } = mkHandlerInvocation(user.id);
    await handler(req, res, next);
    expect(captured.nextCalled).toBe(true);
    expect(captured.err).toBeUndefined();
  });

  it("403 FEATURE_DISABLED when the flag is off, even for premium", async () => {
    const user = await makeUser("premium", "disabled");
    // Temporarily flip the flag.
    const original = PREMIUM_FEATURES.COURSE_ADVISOR.enabled;
    PREMIUM_FEATURES.COURSE_ADVISOR.enabled = false;
    try {
      const handler = requirePremium("COURSE_ADVISOR");
      const { req, res, next, captured } = mkHandlerInvocation(user.id);
      await handler(req, res, next);
      expect(captured.err).toMatchObject({
        code: "FEATURE_DISABLED",
        status: 403,
      });
    } finally {
      PREMIUM_FEATURES.COURSE_ADVISOR.enabled = original;
    }
  });

  it("401 UNAUTHORIZED if the JWT maps to a user that no longer exists", async () => {
    const handler = requirePremium("COURSE_ADVISOR");
    const { req, res, next, captured } = mkHandlerInvocation(
      "00000000-0000-0000-0000-000000000000"
    );
    await handler(req, res, next);
    expect(captured.err).toMatchObject({ code: "UNAUTHORIZED", status: 401 });
  });
});
