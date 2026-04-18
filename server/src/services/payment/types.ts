import type { Payment } from "@prisma/client";

/**
 * Provider-agnostic payment contract (Phase 7 task 7.13).
 *
 * iyzico is the primary TR payment gateway; a Stripe provider slot is
 * reserved for international billing (Phase 8). Both implementations
 * share the `PaymentProvider` interface so the service layer doesn't
 * have to know which vendor finally settled the transaction.
 *
 * Pricing is in kuruş (TRY smallest unit) throughout — integer arithmetic
 * keeps us away from float rounding bugs on commission calculations.
 */

export type PaymentKind =
  | "subscription"
  | "marketplace"
  | "tutoring";

export type PaymentStatus =
  | "pending"
  | "succeeded"
  | "failed"
  | "refunded"
  | "disputed";

export interface PaymentMetadata {
  /** The domain record the payment funds. Exactly one of the fields below is set. */
  marketplaceItemId?: string;
  tutoringSessionId?: string;
  subscriptionPlan?: "premium" | "premium-plus";
  threeDsStatus?: "pending" | "success" | "failed";
  [extra: string]: unknown;
}

export interface InitPaymentInput {
  userId: string;
  kind: PaymentKind;
  /** Display/charge amount in kuruş. */
  amountKurus: number;
  currency?: "TRY";
  metadata?: PaymentMetadata;
  /** Absolute URL the gateway redirects to after 3DS completion. */
  callbackUrl: string;
}

export interface InitPaymentResult {
  payment: Payment;
  /** URL the client redirects the user into (iyzico hosted checkout iframe). */
  checkoutUrl: string;
  /** Provider-side transaction id. Also lands on `Payment.externalId`. */
  externalId: string;
}

export interface WebhookInput {
  /** Raw JSON body as delivered by the gateway. */
  body: string;
  headers: Record<string, string>;
}

export interface WebhookResult {
  paymentId: string;
  status: PaymentStatus;
  alreadyProcessed: boolean;
}

export interface PaymentProvider {
  name: "iyzico" | "stripe";
  init(input: InitPaymentInput): Promise<{
    checkoutUrl: string;
    externalId: string;
  }>;
  /**
   * Verify the webhook signature + translate the payload into a
   * provider-neutral status update. Providers throw when the signature
   * does not match.
   */
  parseWebhook(
    input: WebhookInput
  ): Promise<{ externalId: string; status: PaymentStatus }>;
  /** Issue a refund. Some providers make this async — the return status reflects current state. */
  refund(externalId: string): Promise<PaymentStatus>;
}

export const PAYMENT_WEBHOOK_QUEUE = "payment-webhook";
