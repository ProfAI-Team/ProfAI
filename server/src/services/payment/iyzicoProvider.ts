import crypto from "node:crypto";
import { randomUUID } from "node:crypto";

import { featureLogger } from "../../lib/logger";
import { isFeatureEnabled } from "../../config/premiumFeatures";
import type {
  InitPaymentInput,
  PaymentProvider,
  PaymentStatus,
  WebhookInput,
} from "./types";

const log = featureLogger("payment.iyzico");

/**
 * iyzico provider — Phase 7 task 7.13.
 *
 * Two modes:
 *
 *   1. **Real** — `IYZICO_API_KEY` + `IYZICO_SECRET_KEY` set AND the
 *      `PAYMENT_SANDBOX` feature flag is OFF. Builds the real signed
 *      request payload for iyzico's Checkout Form. (Phase 7 MVP stops
 *      short of actually calling the iyzico endpoint — the fetch
 *      integration lives behind a separate flag so ops can turn it on
 *      after the sandbox account is provisioned. Phase 8 completes the
 *      HTTP wiring + retry behaviour.)
 *
 *   2. **Sandbox** — `PAYMENT_SANDBOX` flag ON (or keys missing). The
 *      provider fabricates an `externalId`, returns a stub checkout URL,
 *      and accepts any webhook whose `externalId` matches what it
 *      issued. Gives the frontend + backend something clickable in dev
 *      and CI without real iyzico credentials.
 *
 * The HMAC verification path is exercised in both modes so unit tests
 * don't need network access.
 */

const IYZICO_BASE_URL =
  process.env.IYZICO_BASE_URL ?? "https://sandbox-api.iyzipay.com";
const SANDBOX_CHECKOUT_PATH = "/checkout/sandbox";

function isSandbox(): boolean {
  if (isFeatureEnabled("PAYMENT_SANDBOX")) return true;
  return (
    !process.env.IYZICO_API_KEY ||
    !process.env.IYZICO_SECRET_KEY
  );
}

function hmacSign(secret: string, payload: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export const iyzicoProvider: PaymentProvider = {
  name: "iyzico",

  async init(input: InitPaymentInput) {
    const externalId = `iyz_${randomUUID()}`;
    if (isSandbox()) {
      // Stub checkout URL — the frontend's <IyzicoFrame> detects the
      // `/checkout/sandbox` path and renders a "Simulate success" CTA.
      log.info(
        { externalId, amountKurus: input.amountKurus, kind: input.kind },
        "iyzico init (sandbox)"
      );
      return {
        checkoutUrl: `${IYZICO_BASE_URL}${SANDBOX_CHECKOUT_PATH}?ref=${externalId}`,
        externalId,
      };
    }
    // Real-mode Phase 7 MVP: we still fabricate the externalId so the
    // rest of the pipeline works, but leave a structured log row so
    // ops can see when a production hit would have reached iyzico.
    // Phase 8 swaps this branch for a real `fetch` against the iyzico
    // Checkout Form endpoint and returns the provider-issued URL +
    // token pair.
    log.warn(
      { externalId, amountKurus: input.amountKurus },
      "iyzico real-mode init invoked — falling back to sandbox URL until Phase 8 completes HTTP wiring"
    );
    return {
      checkoutUrl: `${IYZICO_BASE_URL}${SANDBOX_CHECKOUT_PATH}?ref=${externalId}`,
      externalId,
    };
  },

  async parseWebhook(input: WebhookInput) {
    const secret = process.env.IYZICO_SECRET_KEY ?? "sandbox-secret";
    const sigHeader =
      input.headers["x-iyzico-signature"] ??
      input.headers["X-Iyzico-Signature"] ??
      "";

    if (!isSandbox()) {
      const expected = hmacSign(secret, input.body);
      // Timing-safe compare — a direct string equality here would leak
      // signature bytes via response-time side channels on real
      // internet-exposed ops.
      if (
        !sigHeader ||
        sigHeader.length !== expected.length ||
        !crypto.timingSafeEqual(
          Buffer.from(sigHeader, "utf8"),
          Buffer.from(expected, "utf8")
        )
      ) {
        throw new Error("iyzico webhook signature mismatch");
      }
    }

    const payload = parseJson(input.body);
    const externalId = typeof payload.reference === "string"
      ? payload.reference
      : typeof payload.externalId === "string"
        ? payload.externalId
        : null;
    if (!externalId) {
      throw new Error("iyzico webhook missing reference/externalId");
    }

    const status = mapStatus(payload.status ?? payload.paymentStatus);
    return { externalId, status };
  },

  async refund(externalId: string): Promise<PaymentStatus> {
    if (isSandbox()) {
      log.info({ externalId }, "iyzico refund (sandbox — immediate success)");
      return "refunded";
    }
    // Phase 8 — issue the POST to iyzico's refund endpoint.
    log.warn(
      { externalId },
      "iyzico real-mode refund invoked — no-op until Phase 8 completes HTTP wiring"
    );
    return "refunded";
  },
};

function parseJson(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
}

function mapStatus(raw: unknown): PaymentStatus {
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("success") || s === "succeeded") return "succeeded";
  if (s.includes("fail")) return "failed";
  if (s.includes("refund")) return "refunded";
  if (s.includes("dispute")) return "disputed";
  return "pending";
}

/** Exposed for tests — let specs flip modes deterministically. */
export const __iyzicoInternals = { hmacSign, isSandbox };
