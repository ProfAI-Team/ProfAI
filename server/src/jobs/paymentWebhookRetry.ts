import { registerWorker } from "../lib/queue";
import { featureLogger } from "../lib/logger";
import { applyWebhook } from "../services/paymentService";
import {
  PAYMENT_WEBHOOK_QUEUE,
  type PaymentStatus,
} from "../services/payment/types";

const log = featureLogger("paymentWebhookRetry");

interface JobData {
  externalId: string;
  status: PaymentStatus;
}

/**
 * Phase 7 task 7.13 + 7.18 — retry worker for webhook side-effects.
 * `handleWebhook` in paymentService already verified the signature
 * before the enqueue, so this worker trusts the payload. It only
 * re-runs `applyWebhook`, which is idempotent by externalId.
 *
 * BullMQ defaults to 3 attempts with exponential backoff — matching the
 * payment-webhook retry target (spec risk: "failed webhook → BullMQ
 * queue `payment-webhook`, backoff 1s/5s/30s").
 */
export function registerPaymentWebhookWorker(): void {
  registerWorker<JobData>(PAYMENT_WEBHOOK_QUEUE, async (data) => {
    await applyWebhook(data.externalId, data.status);
    log.info(
      { externalId: data.externalId, status: data.status },
      "webhook retry applied"
    );
  });
}
