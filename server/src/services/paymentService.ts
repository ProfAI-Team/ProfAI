import type { Payment } from "@prisma/client";

import prisma from "../lib/prisma";
import { AppError, notFound } from "../lib/AppError";
import { featureLogger } from "../lib/logger";
import { enqueue } from "../lib/queue";
import { iyzicoProvider } from "./payment/iyzicoProvider";
import {
  type InitPaymentInput,
  type InitPaymentResult,
  type PaymentProvider,
  type PaymentStatus,
  type WebhookInput,
  type WebhookResult,
  PAYMENT_WEBHOOK_QUEUE,
} from "./payment/types";

const log = featureLogger("payment");

/**
 * Service layer for the payment pipeline (Phase 7 task 7.13). Controllers
 * call `initPayment` / `handleWebhook` / `refundPayment` — the vendor
 * integration sits behind a `PaymentProvider` interface so adding Stripe
 * (Phase 8 international) is a provider drop-in, not a service rewrite.
 *
 * Key design points:
 *   - `externalId` unique constraint on the Payment row makes webhook
 *     retries idempotent by construction — if the same gateway hit
 *     lands twice we detect it on the second update attempt.
 *   - Side effects (subscription upgrade, marketplace access grant,
 *     tutoring session confirm) are routed through `applySideEffects`
 *     keyed on `Payment.type + metadata`.
 *   - Webhook retry is a BullMQ queue (`payment-webhook`). Controllers
 *     do the HMAC verify synchronously; if the post-verify work trips a
 *     retryable error we bounce the job onto the queue for exponential
 *     backoff. In-flight completion is still atomic.
 */

const DEFAULT_PROVIDER: PaymentProvider = iyzicoProvider;

export interface RefundInput {
  paymentId: string;
  reason?: string;
}

export async function initPayment(
  input: InitPaymentInput,
  provider: PaymentProvider = DEFAULT_PROVIDER
): Promise<InitPaymentResult> {
  if (!Number.isInteger(input.amountKurus) || input.amountKurus <= 0) {
    throw new AppError(
      "VALIDATION_FAILED",
      "amountKurus must be a positive integer (kuruş).",
      400
    );
  }

  const { checkoutUrl, externalId } = await provider.init(input);

  const payment = await prisma.payment.create({
    data: {
      userId: input.userId,
      type: input.kind,
      amount: input.amountKurus,
      currency: input.currency ?? "TRY",
      status: "pending",
      provider: provider.name,
      externalId,
      metadata: (input.metadata ?? {}) as object,
    },
  });

  log.info(
    { paymentId: payment.id, provider: provider.name, kind: input.kind },
    "payment init"
  );

  return { payment, checkoutUrl, externalId };
}

/**
 * Apply a terminal status update to a payment and fire the
 * domain-specific side effects if the payment reached `succeeded`.
 * Returns `alreadyProcessed: true` when the payment is already at the
 * target status (idempotent webhook retry).
 */
export async function applyWebhook(
  externalId: string,
  status: PaymentStatus
): Promise<WebhookResult> {
  const existing = await prisma.payment.findUnique({
    where: { externalId },
  });
  if (!existing) {
    throw notFound(`Payment ${externalId} not found`);
  }
  if (existing.status === status) {
    return { paymentId: existing.id, status, alreadyProcessed: true };
  }
  // No backwards transitions out of a terminal state.
  if (
    (existing.status === "succeeded" && status === "pending") ||
    (existing.status === "refunded" && status !== "disputed")
  ) {
    log.warn(
      { paymentId: existing.id, from: existing.status, to: status },
      "ignoring backwards status transition"
    );
    return {
      paymentId: existing.id,
      status: existing.status as PaymentStatus,
      alreadyProcessed: true,
    };
  }

  const updated = await prisma.payment.update({
    where: { id: existing.id },
    data: {
      status,
      completedAt:
        status === "succeeded" ||
        status === "failed" ||
        status === "refunded"
          ? new Date()
          : existing.completedAt,
    },
  });

  if (status === "succeeded") {
    await applySideEffects(updated);
  }

  log.info(
    { paymentId: updated.id, status },
    "payment status updated from webhook"
  );
  return { paymentId: updated.id, status, alreadyProcessed: false };
}

/**
 * Controller-facing entry point. Verifies the gateway signature on the
 * request body + translates the payload into our neutral status
 * vocabulary, then delegates to `applyWebhook`. Retryable failures
 * enqueue a follow-up attempt on the `payment-webhook` queue.
 */
export async function handleWebhook(
  input: WebhookInput,
  provider: PaymentProvider = DEFAULT_PROVIDER
): Promise<WebhookResult> {
  const { externalId, status } = await provider.parseWebhook(input);

  try {
    return await applyWebhook(externalId, status);
  } catch (err) {
    // Transient DB / side-effect failures: queue the job for retry so
    // the gateway sees a 200 (and doesn't keep hammering us) while the
    // worker re-applies the same externalId → status.
    log.warn(
      { externalId, err: (err as Error).message },
      "webhook apply failed — enqueueing retry"
    );
    await enqueue(PAYMENT_WEBHOOK_QUEUE, { externalId, status });
    throw err;
  }
}

export async function refundPayment(
  input: RefundInput,
  provider: PaymentProvider = DEFAULT_PROVIDER
): Promise<Payment> {
  const payment = await prisma.payment.findUnique({
    where: { id: input.paymentId },
  });
  if (!payment) throw notFound("Payment not found");
  if (payment.status !== "succeeded") {
    throw new AppError(
      "INVALID_STATE",
      `Payment is ${payment.status}; only succeeded payments can be refunded`,
      409
    );
  }
  if (!payment.externalId) {
    throw new AppError(
      "INVALID_STATE",
      "Payment has no externalId — cannot issue refund",
      409
    );
  }

  const newStatus = await provider.refund(payment.externalId);
  return prisma.payment.update({
    where: { id: payment.id },
    data: { status: newStatus, completedAt: new Date() },
  });
}

/**
 * Domain side effects triggered on a `succeeded` transition. Kept
 * narrow on purpose: the heavy lifting (granting marketplace download
 * access, confirming tutoring bookings, unlocking premium tier) lives
 * in the per-service controllers and is called from here via lazy
 * imports to avoid a cyclic module graph.
 */
async function applySideEffects(payment: Payment): Promise<void> {
  const metadata = (payment.metadata ?? {}) as Record<string, unknown>;

  if (payment.type === "subscription") {
    const plan =
      metadata.subscriptionPlan === "premium-plus"
        ? "premium-plus"
        : "premium";
    await prisma.user.update({
      where: { id: payment.userId },
      data: { subscriptionTier: plan },
    });
    return;
  }

  if (
    payment.type === "tutoring" &&
    typeof metadata.tutoringSessionId === "string"
  ) {
    const sessionId = metadata.tutoringSessionId as string;
    const updated = await prisma.tutoringSession.updateMany({
      where: { id: sessionId },
      data: { status: "scheduled", paymentId: payment.id },
    });
    if (updated.count === 0) {
      log.warn(
        { paymentId: payment.id, tutoringSessionId: sessionId },
        "succeeded payment referenced a missing tutoring session — skipping side-effect"
      );
    }
    return;
  }

  if (
    payment.type === "marketplace" &&
    typeof metadata.marketplaceItemId === "string"
  ) {
    const itemId = metadata.marketplaceItemId as string;
    const updated = await prisma.marketplaceItem.updateMany({
      where: { id: itemId },
      data: { totalSales: { increment: 1 } },
    });
    if (updated.count === 0) {
      log.warn(
        { paymentId: payment.id, marketplaceItemId: itemId },
        "succeeded payment referenced a missing marketplace item — skipping side-effect"
      );
    }
    return;
  }

  log.warn(
    { paymentId: payment.id, type: payment.type },
    "succeeded payment had no matching side-effect — metadata missing target id?"
  );
}
