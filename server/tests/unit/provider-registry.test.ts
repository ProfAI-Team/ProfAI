import { describe, it, expect, vi } from "vitest";

import { withFallback, isProviderRetryable } from "../../src/services/llm/providerRegistry";

describe("providerRegistry", () => {
  it("returns the primary result when it succeeds", async () => {
    const primary = vi.fn().mockResolvedValue("hi");
    const fallback = vi.fn();
    const res = await withFallback(primary, fallback, {
      feature: "test",
      primary: "gemini",
    });
    expect(res).toEqual({ data: "hi", provider: "gemini", fallbackUsed: false });
    expect(fallback).not.toHaveBeenCalled();
  });

  it("falls back on retryable primary error", async () => {
    const primary = vi.fn().mockRejectedValue(
      new Error("503 service unavailable")
    );
    const fallback = vi.fn().mockResolvedValue("claude-says-hi");
    const res = await withFallback(primary, fallback, {
      feature: "test",
      primary: "gemini",
      fallback: "claude",
    });
    expect(res.data).toBe("claude-says-hi");
    expect(res.fallbackUsed).toBe(true);
    expect(res.provider).toBe("claude");
  });

  it("rethrows primary error when fallback is not configured", async () => {
    const primary = vi.fn().mockRejectedValue(
      new Error("UNAVAILABLE transient")
    );
    await expect(
      withFallback(primary, null, { feature: "test", primary: "gemini" })
    ).rejects.toThrow(/UNAVAILABLE/);
  });

  it("rethrows primary error when it is not retryable", async () => {
    const primary = vi.fn().mockRejectedValue(new Error("400 bad request"));
    const fallback = vi.fn();
    await expect(
      withFallback(primary, fallback, {
        feature: "test",
        primary: "gemini",
        fallback: "claude",
      })
    ).rejects.toThrow(/400/);
    expect(fallback).not.toHaveBeenCalled();
  });

  it("surfaces the original error if fallback also fails", async () => {
    const primary = vi.fn().mockRejectedValue(new Error("503 primary down"));
    const fallback = vi.fn().mockRejectedValue(new Error("fallback dead"));
    await expect(
      withFallback(primary, fallback, {
        feature: "test",
        primary: "gemini",
        fallback: "claude",
      })
    ).rejects.toThrow(/503 primary down/);
  });

  it("isProviderRetryable tags timeouts + status codes", () => {
    expect(isProviderRetryable(new Error("503 Service Unavailable"))).toBe(true);
    expect(isProviderRetryable(new Error("DEADLINE_EXCEEDED"))).toBe(true);
    expect(isProviderRetryable(new Error("socket timeout"))).toBe(true);
    expect(isProviderRetryable(new Error("401 Unauthorized"))).toBe(false);
    expect(isProviderRetryable("not an error")).toBe(false);
  });
});
