import prisma from "../../lib/prisma";

// Approximate Gemini 2.5 Flash Lite pricing (text) as of 2024-12.
// Refine when Google publishes updates.
const PRICING: Record<string, { inputPerM: number; outputPerM: number }> = {
  "gemini-2.5-flash-lite": { inputPerM: 0.075, outputPerM: 0.3 },
  "gemini-2.5-flash": { inputPerM: 0.15, outputPerM: 0.6 },
  "gemini-2.5-pro": { inputPerM: 1.25, outputPerM: 5.0 },
};

function estimateCostUsd(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const prices = PRICING[model] ?? PRICING["gemini-2.5-flash-lite"];
  const input = (inputTokens / 1_000_000) * prices.inputPerM;
  const output = (outputTokens / 1_000_000) * prices.outputPerM;
  return Math.round((input + output) * 1_000_000) / 1_000_000; // 6 decimals
}

export interface RecordCallParams {
  userId?: string | null;
  feature: string;
  provider: "gemini" | "claude" | "openai";
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  cacheHit?: boolean;
  success: boolean;
  errorCode?: string | null;
}

// True unless the operator explicitly opts into paid-tier billing.
// Default is true because our Google AI Studio key runs on free quota.
function isFreeTier(): boolean {
  const val = process.env.GEMINI_FREE_TIER;
  if (val === undefined) return true;
  return val.toLowerCase() !== "false";
}

// Fire-and-forget-style logger; failures are swallowed so telemetry
// never breaks the feature itself.
//
// Note on `costUsd`: always populated using the pricing table — even on
// free tier — so we can project "what would this month cost at paid
// pricing?". The `freeTier` flag on the row disambiguates real spend from
// hypothetical projection at query time.
export async function recordAICall(params: RecordCallParams): Promise<void> {
  try {
    const costUsd = params.success
      ? estimateCostUsd(params.model, params.inputTokens, params.outputTokens)
      : 0;

    await prisma.aICallLog.create({
      data: {
        userId: params.userId ?? null,
        feature: params.feature,
        provider: params.provider,
        model: params.model,
        inputTokens: params.inputTokens,
        outputTokens: params.outputTokens,
        costUsd,
        freeTier: isFreeTier(),
        latencyMs: params.latencyMs,
        cacheHit: params.cacheHit ?? false,
        success: params.success,
        errorCode: params.errorCode ?? null,
      },
    });
  } catch (err) {
    console.error(
      "[aiCallTracker] Failed to record AI call:",
      err instanceof Error ? err.message : err
    );
  }
}
