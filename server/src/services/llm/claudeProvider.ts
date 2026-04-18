import { recordAICall } from "./aiCallTracker";

// Phase 6 task 6.3 — Claude text-generation fallback. Kept lazy: the
// @anthropic-ai/sdk dep is only `require`'d when `CLAUDE_API_KEY` is
// set, so dev environments without a Claude key don't pay the install
// cost. Voice + multimodal live features still need the Gemini Live API
// directly; this provider covers text-only summary/structured
// fallbacks (e.g. style summary, study pack, post-exam reconstruct).

const DEFAULT_MODEL = "claude-opus-4-7";

interface AnthropicMessageResponse {
  content: Array<{ type: string; text?: string }>;
  usage?: { input_tokens?: number; output_tokens?: number };
}

interface AnthropicClient {
  messages: {
    create(params: unknown): Promise<AnthropicMessageResponse>;
  };
}

let cached: AnthropicClient | null = null;

async function getClaudeClient(): Promise<AnthropicClient> {
  if (cached) return cached;
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    throw new Error("CLAUDE_API_KEY not configured");
  }
  try {
    // Dynamic import so environments without the package don't fail at
    // module load time. Installed only when operators opt into Claude.
    const mod = await import("@anthropic-ai/sdk" as string);
    const Ctor = (mod as { default?: new (opts: { apiKey: string }) => AnthropicClient }).default;
    if (!Ctor) throw new Error("@anthropic-ai/sdk has no default export");
    cached = new Ctor({ apiKey });
    return cached;
  } catch (err) {
    throw new Error(
      `@anthropic-ai/sdk not installed — run npm install @anthropic-ai/sdk to enable Claude fallback (${err instanceof Error ? err.message : "unknown"})`
    );
  }
}

export interface ClaudeTextOptions {
  userId?: string | null;
  feature: string;
  systemInstruction?: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export async function generateText(opts: ClaudeTextOptions): Promise<{
  text: string;
  model: string;
}> {
  const client = await getClaudeClient();
  const model = process.env.CLAUDE_MODEL || DEFAULT_MODEL;
  const startedAt = Date.now();

  try {
    const response = await client.messages.create({
      model,
      max_tokens: opts.maxTokens ?? 2048,
      temperature: opts.temperature ?? 0.4,
      ...(opts.systemInstruction ? { system: opts.systemInstruction } : {}),
      messages: [{ role: "user", content: opts.prompt }],
    });

    const text = response.content
      .filter((block) => block.type === "text" && block.text)
      .map((block) => block.text ?? "")
      .join("\n")
      .trim();

    if (!text) throw new Error("Claude returned empty response");

    await recordAICall({
      userId: opts.userId,
      feature: opts.feature,
      provider: "claude",
      model,
      inputTokens: response.usage?.input_tokens ?? 0,
      outputTokens: response.usage?.output_tokens ?? 0,
      latencyMs: Date.now() - startedAt,
      success: true,
    });

    return { text, model };
  } catch (err) {
    await recordAICall({
      userId: opts.userId,
      feature: opts.feature,
      provider: "claude",
      model,
      inputTokens: 0,
      outputTokens: 0,
      latencyMs: Date.now() - startedAt,
      success: false,
      errorCode: err instanceof Error ? err.message.slice(0, 100) : "unknown",
    });
    throw err;
  }
}

export interface ClaudeStructuredOptions<T> extends ClaudeTextOptions {
  parse: (raw: string) => T;
}

/**
 * Structured output via Claude. Unlike Gemini, Claude does not expose a
 * JSON-schema response mode yet, so we prompt-engineer the schema and
 * parse the JSON out of the response (tolerant: strips markdown fences).
 */
export async function generateStructured<T>(
  opts: ClaudeStructuredOptions<T>
): Promise<{ data: T; model: string }> {
  const { text, model } = await generateText({
    ...opts,
    systemInstruction:
      (opts.systemInstruction ?? "") +
      "\n\nReturn ONLY a valid JSON object that matches the caller's schema. No prose, no markdown fences.",
  });

  const cleaned = stripJsonFence(text);
  try {
    const parsed = opts.parse(cleaned);
    return { data: parsed, model };
  } catch (err) {
    throw new Error(
      `Claude returned malformed JSON for ${opts.feature}: ${err instanceof Error ? err.message : "parse failed"}`
    );
  }
}

function stripJsonFence(text: string): string {
  const fencePattern = /^```(?:json)?\s*([\s\S]*?)\s*```$/m;
  const match = text.match(fencePattern);
  return (match ? match[1] : text).trim();
}

export function isClaudeConfigured(): boolean {
  return Boolean(process.env.CLAUDE_API_KEY);
}
