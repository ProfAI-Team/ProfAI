import { describe, it, expect } from "vitest";

import prisma from "../../src/lib/prisma";
import { deleteOCR, listOCRForUser } from "../../src/services/ocrService";

const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

async function makeUser(suffix: string) {
  return prisma.user.create({
    data: {
      email: `ocr-${suffix}-${Date.now()}-${Math.random()}@test.local`,
      password: "x",
      name: "OCR Tester",
    },
  });
}

async function seedOcrRow(userId: string, text: string) {
  return prisma.oCRResult.create({
    data: {
      userId,
      fileUrl: `/uploads/fake-${text}.png`,
      mimeType: "image/png",
      extractedText: text,
      latexFormulas: [],
      confidence: 0.9,
      provider: "gemini-multimodal",
      processingMs: 10,
    },
  });
}

describeIfDb("ocrService — history helpers", () => {
  it("listOCRForUser returns rows newest-first, capped to the limit", async () => {
    const user = await makeUser("list");
    const a = await seedOcrRow(user.id, "alpha");
    const b = await seedOcrRow(user.id, "beta");
    const c = await seedOcrRow(user.id, "gamma");

    const results = await listOCRForUser(user.id, 2);
    expect(results).toHaveLength(2);
    expect(results[0].id).toBe(c.id);
    expect(results[1].id).toBe(b.id);
    // `a` should not appear — just verifying cap ordering, `a` unused.
    expect(a.id).not.toBe(results[0].id);
  });

  it("deleteOCR only removes rows owned by the caller", async () => {
    const owner = await makeUser("del-owner");
    const stranger = await makeUser("del-stranger");
    const row = await seedOcrRow(owner.id, "only-mine");

    const okForStranger = await deleteOCR(stranger.id, row.id);
    expect(okForStranger).toBe(false);

    const okForOwner = await deleteOCR(owner.id, row.id);
    expect(okForOwner).toBe(true);

    const remaining = await prisma.oCRResult.findUnique({ where: { id: row.id } });
    expect(remaining).toBeNull();
  });
});
