import { createHash } from "crypto";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
] as const;

export type SupportedMimeType = (typeof SUPPORTED_MIME_TYPES)[number];

export class UnsupportedMimeTypeError extends Error {
  readonly code = "EXTRACTION_UNSUPPORTED";
  constructor(mimeType: string) {
    super(`Unsupported mime type: ${mimeType}`);
    this.name = "UnsupportedMimeTypeError";
  }
}

export class ExtractionFailedError extends Error {
  readonly code = "EXTRACTION_FAILED";
  constructor(mimeType: string, cause: unknown) {
    super(`Failed to extract text from ${mimeType}`);
    this.name = "ExtractionFailedError";
    this.cause = cause;
  }
}

export interface ExtractionResult {
  text: string;
  wordCount: number;
}

export function wordCount(text: string): number {
  if (!text) return 0;
  return text
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean).length;
}

// SHA-256 digest used as the cache key component for StudyPack lookups.
// Same content → same hash, independent of upload order.
export function hashText(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function isSupportedMime(mime: string): mime is SupportedMimeType {
  return (SUPPORTED_MIME_TYPES as readonly string[]).includes(mime);
}

async function extractPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    return (result.text ?? "").trim();
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}

async function extractDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return (result.value ?? "").trim();
}

function extractTxt(buffer: Buffer): string {
  return buffer.toString("utf8").trim();
}

export async function extractText(
  buffer: Buffer,
  mimeType: string
): Promise<ExtractionResult> {
  if (!isSupportedMime(mimeType)) {
    throw new UnsupportedMimeTypeError(mimeType);
  }

  try {
    let text = "";
    if (mimeType === "application/pdf") {
      text = await extractPdf(buffer);
    } else if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      text = await extractDocx(buffer);
    } else {
      text = extractTxt(buffer);
    }

    return { text, wordCount: wordCount(text) };
  } catch (err) {
    if (err instanceof UnsupportedMimeTypeError) throw err;
    throw new ExtractionFailedError(mimeType, err);
  }
}
