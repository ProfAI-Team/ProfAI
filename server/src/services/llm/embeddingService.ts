import { featureLogger } from "../../lib/logger";
import { getClient } from "./geminiProvider";
import { recordAICall } from "./aiCallTracker";

const log = featureLogger("embedding");

/**
 * Text-embedding wrapper (Phase 7 task 7.3). Returns a 768-dim vector
 * from Gemini's `text-embedding-004` — the default retrieval embedding
 * for the `@google/genai` SDK. Phase 7 consumers:
 *
 *   - Tutor matching (7.14) — bio + specializations → embedding stored on
 *     the Tutor row, matched against the student's interest query.
 *   - Marketplace search (7.15) — item title + description → embedding
 *     stored on MarketplaceItem, matched against the student query.
 *   - Multimodal search (6.13 follow-up) — the Gemini-described formula
 *     keyword set → embedding; compared against the same targets once
 *     they are populated.
 *
 * Keeping the helper small on purpose: embedding failures should not
 * crash the caller — the tutor/marketplace flows fall back to literal
 * keyword filters when the embedding column is null. So we return
 * `null` on error instead of throwing, and the caller decides.
 */

export const EMBEDDING_DIM = 768;
export const DEFAULT_EMBEDDING_MODEL = "text-embedding-004";

export interface EmbedOptions {
  userId?: string | null;
  feature?: string; // overrides the AICallLog feature tag
}

export async function embedText(
  text: string,
  options: EmbedOptions = {}
): Promise<number[] | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const model = process.env.EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL;
  const feature = options.feature ?? "embedding";
  const startedAt = Date.now();

  try {
    const client = getClient();
    type EmbedFn = (req: {
      model: string;
      contents: string | Array<{ role: string; parts: Array<{ text: string }> }>;
    }) => Promise<{ embeddings?: Array<{ values?: number[] }> }>;
    // @google/genai exposes embedContent on `models`; cast to keep the
    // type narrow for the codebase (some SDK versions mismatch).
    const embedFn = (client.models as unknown as { embedContent: EmbedFn })
      .embedContent;
    if (typeof embedFn !== "function") {
      throw new Error("embedContent not available on Gemini client");
    }

    const response = await embedFn.call(client.models, {
      model,
      contents: trimmed,
    });

    const values = response.embeddings?.[0]?.values;
    if (!Array.isArray(values) || values.length === 0) {
      throw new Error("empty embedding response");
    }

    await recordAICall({
      userId: options.userId ?? null,
      feature,
      provider: "gemini",
      model,
      inputTokens: 0,
      outputTokens: 0,
      latencyMs: Date.now() - startedAt,
      success: true,
    });
    return values;
  } catch (err) {
    log.warn(
      { feature, err: (err as Error).message },
      "embedding failed — returning null"
    );
    await recordAICall({
      userId: options.userId ?? null,
      feature,
      provider: "gemini",
      model,
      inputTokens: 0,
      outputTokens: 0,
      latencyMs: Date.now() - startedAt,
      success: false,
      errorCode: (err as Error).message.slice(0, 120),
    });
    return null;
  }
}

/**
 * Serialise a vector to the string representation Postgres + pgvector
 * accept on write: `[0.1,0.2,0.3]`. Prisma has no native vector type
 * yet — callers persist via `$executeRaw` using this helper.
 */
export function toPgVectorLiteral(values: number[]): string {
  return `[${values.join(",")}]`;
}
