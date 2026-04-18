import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the heavy PDF + DOCX extractors so unit tests run without needing
// sample binary fixtures — control flow is what we're validating. vitest 4
// tightened `vi.mock` factory constructor semantics, so we expose named
// `vi.fn` handles via `vi.hoisted` and wrap them in a plain class.
const pdfMocks = vi.hoisted(() => ({
  getText: vi.fn(),
  destroy: vi.fn(),
}));

vi.mock("pdf-parse", () => ({
  PDFParse: class {
    getText = pdfMocks.getText;
    destroy = pdfMocks.destroy;
  },
}));

vi.mock("mammoth", () => ({
  default: {
    extractRawText: vi
      .fn()
      .mockResolvedValue({ value: "parsed docx content here", messages: [] }),
  },
}));

import {
  extractText,
  hashText,
  wordCount,
  UnsupportedMimeTypeError,
  ExtractionFailedError,
} from "../../src/lib/textExtract";

describe("wordCount", () => {
  it("returns 0 for empty string", () => {
    expect(wordCount("")).toBe(0);
  });

  it("returns 0 for whitespace-only string", () => {
    expect(wordCount("   \n\t   ")).toBe(0);
  });

  it("counts simple words", () => {
    expect(wordCount("hello world from profai")).toBe(4);
  });

  it("collapses multiple whitespace", () => {
    expect(wordCount("hello    world\n\nfrom\ttest")).toBe(4);
  });

  it("handles Turkish characters", () => {
    expect(wordCount("Merhaba dünya, hocanın stili")).toBe(4);
  });
});

describe("hashText", () => {
  it("produces a stable 64-char hex digest", () => {
    const hash = hashText("deterministic content");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("returns the same hash for the same input", () => {
    expect(hashText("same input")).toBe(hashText("same input"));
  });

  it("differs for different inputs", () => {
    expect(hashText("input a")).not.toBe(hashText("input b"));
  });
});

describe("extractText", () => {
  beforeEach(() => {
    pdfMocks.getText.mockReset();
    pdfMocks.destroy.mockReset();
    pdfMocks.getText.mockResolvedValue({ text: "parsed pdf content here" });
    pdfMocks.destroy.mockResolvedValue(undefined);
  });

  it("extracts UTF-8 plain text", async () => {
    const buffer = Buffer.from("  hello world  ", "utf8");
    const result = await extractText(buffer, "text/plain");
    expect(result.text).toBe("hello world");
    expect(result.wordCount).toBe(2);
  });

  it("extracts Turkish plain text", async () => {
    const buffer = Buffer.from("Merhaba hoca, nasılsın?", "utf8");
    const result = await extractText(buffer, "text/plain");
    expect(result.text).toBe("Merhaba hoca, nasılsın?");
    expect(result.wordCount).toBe(3);
  });

  it("extracts PDF via pdf-parse", async () => {
    const buffer = Buffer.from("not-real-pdf-bytes");
    const result = await extractText(buffer, "application/pdf");
    expect(result.text).toBe("parsed pdf content here");
    expect(result.wordCount).toBe(4);
  });

  it("extracts DOCX via mammoth", async () => {
    const buffer = Buffer.from("not-real-docx-bytes");
    const result = await extractText(
      buffer,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    expect(result.text).toBe("parsed docx content here");
    expect(result.wordCount).toBe(4);
  });

  it("throws UnsupportedMimeTypeError for unknown mime", async () => {
    const buffer = Buffer.from("x");
    await expect(extractText(buffer, "image/png")).rejects.toBeInstanceOf(
      UnsupportedMimeTypeError
    );
  });

  it("wraps underlying extraction failures", async () => {
    pdfMocks.getText.mockRejectedValueOnce(new Error("bad PDF"));

    await expect(
      extractText(Buffer.from("x"), "application/pdf")
    ).rejects.toBeInstanceOf(ExtractionFailedError);
  });

  it("returns 0 wordCount for empty buffer", async () => {
    const result = await extractText(Buffer.from(""), "text/plain");
    expect(result.text).toBe("");
    expect(result.wordCount).toBe(0);
  });
});
