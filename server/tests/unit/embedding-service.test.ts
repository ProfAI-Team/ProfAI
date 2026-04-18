import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("../../src/services/llm/geminiProvider", () => ({
  getClient: vi.fn(),
}));

vi.mock("../../src/services/llm/aiCallTracker", () => ({
  recordAICall: vi.fn(async () => {}),
}));

import { getClient } from "../../src/services/llm/geminiProvider";
import { recordAICall } from "../../src/services/llm/aiCallTracker";
import {
  embedText,
  toPgVectorLiteral,
} from "../../src/services/llm/embeddingService";

describe("embeddingService", () => {
  const origKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    process.env.GEMINI_API_KEY = "test-key";
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (origKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = origKey;
  });

  it("returns the 768-dim vector from a successful call", async () => {
    const vector = new Array(768).fill(0).map((_, i) => i / 1000);
    const embedContent = vi.fn(async () => ({
      embeddings: [{ values: vector }],
    }));
    (getClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      models: { embedContent },
    });

    const result = await embedText("linear regression", {
      userId: "u1",
      feature: "marketplace-search",
    });

    expect(result).toEqual(vector);
    expect(embedContent).toHaveBeenCalledWith(
      expect.objectContaining({ contents: "linear regression" })
    );
    expect(recordAICall).toHaveBeenCalledWith(
      expect.objectContaining({
        feature: "marketplace-search",
        success: true,
      })
    );
  });

  it("returns null on empty input without calling Gemini", async () => {
    const embedContent = vi.fn();
    (getClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      models: { embedContent },
    });

    const result = await embedText("   ", { userId: "u1" });
    expect(result).toBeNull();
    expect(embedContent).not.toHaveBeenCalled();
  });

  it("returns null when Gemini throws and records the failure", async () => {
    const embedContent = vi.fn(async () => {
      throw new Error("503 UNAVAILABLE");
    });
    (getClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      models: { embedContent },
    });

    const result = await embedText("hello", { feature: "tutor-match" });
    expect(result).toBeNull();
    expect(recordAICall).toHaveBeenCalledWith(
      expect.objectContaining({
        feature: "tutor-match",
        success: false,
      })
    );
  });

  it("returns null when the client has no embedContent method", async () => {
    (getClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      models: {},
    });

    const result = await embedText("hello");
    expect(result).toBeNull();
  });

  it("serialises a vector to the Postgres literal format", () => {
    expect(toPgVectorLiteral([0.1, 0.2, -0.5])).toBe("[0.1,0.2,-0.5]");
    expect(toPgVectorLiteral([0, 0, 0])).toBe("[0,0,0]");
  });
});
