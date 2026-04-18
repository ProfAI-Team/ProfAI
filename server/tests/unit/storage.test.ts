import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { getStorage, __resetStorageForTests } from "../../src/lib/storage";

describe("storage local provider", () => {
  let tmpDir: string;
  const origEnv = { ...process.env };

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "profai-storage-"));
    delete process.env.R2_BUCKET;
    process.env.LOCAL_UPLOADS_DIR = tmpDir;
    __resetStorageForTests();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
    process.env = { ...origEnv };
    __resetStorageForTests();
  });

  it("uploads a buffer and returns a /uploads key", async () => {
    const storage = getStorage();
    expect(storage.kind).toBe("local");

    const result = await storage.put(Buffer.from("hello world"), {
      prefix: "marketplace",
      extension: "txt",
    });

    expect(result.kind).toBe("local");
    expect(result.bytes).toBe(11);
    expect(result.key.startsWith("marketplace/")).toBe(true);
    expect(result.key.endsWith(".txt")).toBe(true);
    expect(result.publicUrl).toBe(`/uploads/${result.key}`);

    const absolute = path.resolve(
      process.cwd(),
      process.env.LOCAL_UPLOADS_DIR as string,
      result.key
    );
    const contents = await fs.readFile(absolute, "utf8");
    expect(contents).toBe("hello world");
  });

  it("honours a caller-provided filename instead of uuid", async () => {
    const storage = getStorage();
    const result = await storage.put(Buffer.from("x"), {
      prefix: "notes",
      filename: "fixed.pdf",
    });
    expect(result.key).toBe("notes/fixed.pdf");
  });

  it("delete is idempotent on missing files", async () => {
    const storage = getStorage();
    await expect(storage.delete("does-not-exist.txt")).resolves.toBeUndefined();
  });

  it("listOlderThan returns keys written before the cutoff", async () => {
    const storage = getStorage();

    const prefix = "gc";
    await storage.put(Buffer.from("old"), {
      prefix,
      filename: "old.txt",
    });
    // Stat mtime has second precision — nudge the file back ~2h.
    const absolute = path.resolve(
      process.cwd(),
      process.env.LOCAL_UPLOADS_DIR as string,
      "gc/old.txt"
    );
    const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000);
    await fs.utimes(absolute, pastDate, pastDate);

    await storage.put(Buffer.from("new"), {
      prefix,
      filename: "new.txt",
    });

    const stale = await storage.listOlderThan(
      prefix,
      new Date(Date.now() - 60 * 60 * 1000)
    );
    expect(stale).toEqual(["gc/old.txt"]);
  });

  it("publicUrl echoes the /uploads path", async () => {
    const storage = getStorage();
    const url = await storage.publicUrl("ocr/abc.png");
    expect(url).toBe("/uploads/ocr/abc.png");
  });
});
