import { describe, it, expect, beforeEach, afterEach } from "vitest";

import prisma from "../../src/lib/prisma";
import {
  initPayment,
  applyWebhook,
  handleWebhook,
  refundPayment,
} from "../../src/services/paymentService";
import type {
  PaymentProvider,
  PaymentStatus,
} from "../../src/services/payment/types";

const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

function makeStubProvider(overrides: Partial<PaymentProvider> = {}): PaymentProvider {
  return {
    name: "iyzico",
    async init() {
      return {
        externalId: `ext_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        checkoutUrl: "https://sandbox/checkout",
      };
    },
    async parseWebhook(input) {
      const parsed = JSON.parse(input.body) as {
        externalId: string;
        status: PaymentStatus;
      };
      return parsed;
    },
    async refund() {
      return "refunded";
    },
    ...overrides,
  };
}

async function makeUser(email: string) {
  return prisma.user.create({
    data: {
      email,
      password: "x",
      name: "Test",
    },
  });
}

describeIfDb("paymentService", () => {
    beforeEach(() => {
      process.env.RUN_INLINE_QUEUE = "1";
    });
    afterEach(async () => {
      await prisma.payment.deleteMany({});
      await prisma.user.deleteMany({ where: { email: { contains: "@payment" } } });
      delete process.env.RUN_INLINE_QUEUE;
    });

    it("initPayment persists a pending row + carries externalId back", async () => {
      const user = await makeUser(`init-${Date.now()}@payment.test`);
      const provider = makeStubProvider();
      const result = await initPayment(
        {
          userId: user.id,
          kind: "marketplace",
          amountKurus: 2500,
          callbackUrl: "https://profai/cb",
          metadata: { marketplaceItemId: "item-1" },
        },
        provider
      );
      expect(result.payment.status).toBe("pending");
      expect(result.payment.externalId).toBe(result.externalId);
      const fresh = await prisma.payment.findUnique({
        where: { id: result.payment.id },
      });
      expect(fresh?.amount).toBe(2500);
      expect(fresh?.currency).toBe("TRY");
    });

    it("applyWebhook is idempotent when status already matches", async () => {
      const user = await makeUser(`idem-${Date.now()}@payment.test`);
      const provider = makeStubProvider();
      const { externalId } = await initPayment(
        {
          userId: user.id,
          kind: "subscription",
          amountKurus: 4900,
          callbackUrl: "https://profai/cb",
          metadata: { subscriptionPlan: "premium" },
        },
        provider
      );
      const first = await applyWebhook(externalId, "succeeded");
      const second = await applyWebhook(externalId, "succeeded");
      expect(first.alreadyProcessed).toBe(false);
      expect(second.alreadyProcessed).toBe(true);
    });

    it("succeeded subscription payment upgrades the user", async () => {
      const user = await makeUser(`sub-${Date.now()}@payment.test`);
      const provider = makeStubProvider();
      const { externalId } = await initPayment(
        {
          userId: user.id,
          kind: "subscription",
          amountKurus: 7900,
          callbackUrl: "https://profai/cb",
          metadata: { subscriptionPlan: "premium-plus" },
        },
        provider
      );
      await applyWebhook(externalId, "succeeded");
      const fresh = await prisma.user.findUnique({ where: { id: user.id } });
      expect(fresh?.subscriptionTier).toBe("premium-plus");
    });

    it("does not walk backwards from succeeded to pending", async () => {
      const user = await makeUser(`back-${Date.now()}@payment.test`);
      const provider = makeStubProvider();
      const { externalId } = await initPayment(
        {
          userId: user.id,
          kind: "marketplace",
          amountKurus: 1000,
          callbackUrl: "https://profai/cb",
        },
        provider
      );
      await applyWebhook(externalId, "succeeded");
      const res = await applyWebhook(externalId, "pending");
      expect(res.alreadyProcessed).toBe(true);
      expect(res.status).toBe("succeeded");
    });

    it("handleWebhook calls provider.parseWebhook and lands the update", async () => {
      const user = await makeUser(`wh-${Date.now()}@payment.test`);
      const provider = makeStubProvider();
      const { externalId } = await initPayment(
        {
          userId: user.id,
          kind: "tutoring",
          amountKurus: 15000,
          callbackUrl: "https://profai/cb",
        },
        provider
      );
      const result = await handleWebhook(
        {
          body: JSON.stringify({ externalId, status: "failed" }),
          headers: {},
        },
        provider
      );
      expect(result.status).toBe("failed");
    });

    it("refundPayment transitions succeeded → refunded", async () => {
      const user = await makeUser(`rf-${Date.now()}@payment.test`);
      const provider = makeStubProvider();
      const { payment, externalId } = await initPayment(
        {
          userId: user.id,
          kind: "marketplace",
          amountKurus: 4000,
          callbackUrl: "https://profai/cb",
          metadata: { marketplaceItemId: "item-2" },
        },
        provider
      );
      await applyWebhook(externalId, "succeeded");
      const refunded = await refundPayment(
        { paymentId: payment.id },
        provider
      );
      expect(refunded.status).toBe("refunded");
    });

    it("refundPayment rejects a non-succeeded payment", async () => {
      const user = await makeUser(`rfp-${Date.now()}@payment.test`);
      const provider = makeStubProvider();
      const { payment } = await initPayment(
        {
          userId: user.id,
          kind: "marketplace",
          amountKurus: 1000,
          callbackUrl: "https://profai/cb",
        },
        provider
      );
      await expect(
        refundPayment({ paymentId: payment.id }, provider)
      ).rejects.toThrow(/succeeded payments can be refunded/);
    });
});

describe("iyzicoProvider webhook signature", () => {
  beforeEach(() => {
    process.env.IYZICO_API_KEY = "api";
    process.env.IYZICO_SECRET_KEY = "secret-key";
  });
  afterEach(() => {
    delete process.env.IYZICO_API_KEY;
    delete process.env.IYZICO_SECRET_KEY;
  });

  it("rejects a webhook with a mismatched HMAC", async () => {
    const { iyzicoProvider, __iyzicoInternals } = await import(
      "../../src/services/payment/iyzicoProvider"
    );
    const body = JSON.stringify({ reference: "iyz_abc", status: "success" });
    const wrongSig = "not-the-right-signature".padEnd(64, "a");
    await expect(
      iyzicoProvider.parseWebhook({ body, headers: { "x-iyzico-signature": wrongSig } })
    ).rejects.toThrow(/signature mismatch/);
    // Sanity: signing with the right secret matches.
    const correctSig = __iyzicoInternals.hmacSign("secret-key", body);
    const ok = await iyzicoProvider.parseWebhook({
      body,
      headers: { "x-iyzico-signature": correctSig },
    });
    expect(ok.externalId).toBe("iyz_abc");
    expect(ok.status).toBe("succeeded");
  });
});
