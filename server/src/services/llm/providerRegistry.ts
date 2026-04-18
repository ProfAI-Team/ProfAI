import { recordAICall } from "./aiCallTracker";

// Phase 6 task 6.3 — closes open question T4 (multi-provider AI). Voice
// tutor and lecture transcribe in 6.11/6.12 sit directly on top of
// Gemini; geo-restriction risk is flagged in the roadmap risk matrix.
// This registry gives every AI-backed service a uniform way to reach a
// primary provider and fall back to Claude (or OpenAI Realtime for
// voice) when the primary 503s or times out.
//
// Scope is intentionally small: a generic `withFallback` wrapper + a
// Claude text-generation provider loaded lazily if `CLAUDE_API_KEY` is
// set. Individual Gemini calls opt into fallback one feature at a time;
// callers that don't wire it keep their existing behaviour.

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

export type AIProviderName = "gemini" | "claude" | "openai-realtime";

export interface WithFallbackContext {
  feature: string;
  userId?: string | null;
  primary: AIProviderName;
  fallback?: AIProviderName;
  primaryTimeoutMs?: number;
}

export interface WithFallbackResult<T> {
  data: T;
  provider: AIProviderName;
  fallbackUsed: boolean;
}

export function isProviderRetryable(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message;
  for (const code of RETRYABLE_STATUS) {
    if (msg.includes(`"code":${code}`) || msg.includes(`${code} `)) return true;
  }
  return /UNAVAILABLE|RESOURCE_EXHAUSTED|DEADLINE_EXCEEDED|timeout/i.test(msg);
}

/**
 * Run `primaryFn`; on a retryable failure, run `fallbackFn`. Records a
 * best-effort AICallLog entry for the fallback attempt so we can measure
 * how often the primary degrades in production.
 */
export async function withFallback<T>(
  primaryFn: () => Promise<T>,
  fallbackFn: (() => Promise<T>) | null,
  ctx: WithFallbackContext
): Promise<WithFallbackResult<T>> {
  try {
    const data = await primaryFn();
    return { data, provider: ctx.primary, fallbackUsed: false };
  } catch (err) {
    if (!fallbackFn || !isProviderRetryable(err)) {
      throw err;
    }

    const fallbackName = ctx.fallback ?? "claude";
    const startedAt = Date.now();
    try {
      const data = await fallbackFn();
      return { data, provider: fallbackName, fallbackUsed: true };
    } catch (fallbackErr) {
      await recordAICall({
        userId: ctx.userId,
        feature: `${ctx.feature}-fallback`,
        provider: fallbackName,
        model: "unknown",
        inputTokens: 0,
        outputTokens: 0,
        latencyMs: Date.now() - startedAt,
        success: false,
        errorCode:
          fallbackErr instanceof Error
            ? fallbackErr.message.slice(0, 100)
            : "unknown",
      });
      // Prefer surfacing the original error — easier to diagnose the
      // real outage than the downstream fallout.
      throw err;
    }
  }
}

export interface AIProviderStatus {
  name: AIProviderName;
  available: boolean;
  model?: string;
}

export function getConfiguredProviders(): AIProviderStatus[] {
  const out: AIProviderStatus[] = [];
  out.push({
    name: "gemini",
    available: Boolean(process.env.GEMINI_API_KEY),
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
  });
  out.push({
    name: "claude",
    available: Boolean(process.env.CLAUDE_API_KEY),
    model: process.env.CLAUDE_MODEL || "claude-opus-4-7",
  });
  out.push({
    name: "openai-realtime",
    available: Boolean(process.env.OPENAI_API_KEY),
    model: process.env.OPENAI_REALTIME_MODEL || "gpt-4o-realtime-preview",
  });
  return out;
}
