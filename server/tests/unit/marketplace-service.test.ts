import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import prisma from "../../src/lib/prisma";
import {
  calculateCommission,
  createItem,
  approveItem,
  search,
} from "../../src/services/marketplaceService";

vi.mock("../../src/services/llm/embeddingService", async () => {
  const actual = await vi.importActual<typeof import("../../src/services/llm/embeddingService")>(
    "../../src/services/llm/embeddingService"
  );
  return {
    ...actual,
    embedText: vi.fn(async () => null),
  };
});

const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

describe("calculateCommission", () => {
  it("applies 30% on notes", () => {
    const out = calculateCommission(100, "notes");
    expect(out.gross).toBe(10_000);
    expect(out.commissionPct).toBe(0.3);
    expect(out.commission).toBe(3_000);
    expect(out.sellerPayout).toBe(7_000);
  });

  it("applies 30% on study_guide", () => {
    const out = calculateCommission(50, "study_guide");
    expect(out.commission).toBe(1_500);
    expect(out.sellerPayout).toBe(3_500);
  });

  it("rounds fractional kuruş safely", () => {
    const out = calculateCommission(33.33, "notes");
    expect(out.gross + 0).toBe(3333);
    expect(out.commission + out.sellerPayout).toBe(out.gross);
  });
});

async function makeUser(email: string) {
  return prisma.user.create({
    data: { email, password: "x", name: "U" },
  });
}

describeIfDb("marketplaceService", () => {
  beforeEach(() => {
    process.env.RUN_INLINE_QUEUE = "1";
  });
  afterEach(async () => {
    await prisma.marketplaceItem.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: { contains: "@marketplace.test" } },
    });
    delete process.env.RUN_INLINE_QUEUE;
  });

  it("createItem starts pending + approveItem flips the flag", async () => {
    const seller = await makeUser(`s-${Date.now()}@marketplace.test`);
    const admin = await makeUser(`a-${Date.now()}@marketplace.test`);
    const item = await createItem({
      sellerId: seller.id,
      type: "notes",
      title: "Diferansiyel Geometri Notları",
      description: "Full notes for the fall semester.",
      priceTl: 45,
      fileUrl: "marketplace/abc.pdf",
      tags: ["math", "differential"],
    });
    expect(item.approved).toBe(false);

    const approved = await approveItem(item.id, admin.id);
    expect(approved.approved).toBe(true);
    expect(approved.approvedById).toBe(admin.id);
  });

  it("approveItem is idempotent", async () => {
    const seller = await makeUser(`idem-${Date.now()}@marketplace.test`);
    const admin = await makeUser(`adm-${Date.now()}@marketplace.test`);
    const item = await createItem({
      sellerId: seller.id,
      type: "study_guide",
      title: "t",
      description: "d",
      priceTl: 30,
      fileUrl: "marketplace/x.pdf",
    });
    const first = await approveItem(item.id, admin.id);
    const second = await approveItem(item.id, admin.id);
    expect(first.id).toBe(second.id);
    expect(second.approved).toBe(true);
  });

  it("search only returns approved rows", async () => {
    const s1 = await makeUser(`s1-${Date.now()}@marketplace.test`);
    const admin = await makeUser(`adm-${Date.now()}@marketplace.test`);
    const approved = await createItem({
      sellerId: s1.id,
      type: "notes",
      title: "approved",
      description: "desc",
      priceTl: 20,
      fileUrl: "x",
    });
    const pending = await createItem({
      sellerId: s1.id,
      type: "notes",
      title: "pending",
      description: "desc",
      priceTl: 20,
      fileUrl: "y",
    });
    await approveItem(approved.id, admin.id);

    const results = await search({ type: "notes" });
    const ids = results.map((r) => r.id);
    expect(ids).toContain(approved.id);
    expect(ids).not.toContain(pending.id);
  });

  it("search applies price filter", async () => {
    const s = await makeUser(`sp-${Date.now()}@marketplace.test`);
    const admin = await makeUser(`spa-${Date.now()}@marketplace.test`);
    const cheap = await createItem({
      sellerId: s.id,
      type: "notes",
      title: "cheap",
      description: "d",
      priceTl: 10,
      fileUrl: "a",
    });
    const expensive = await createItem({
      sellerId: s.id,
      type: "notes",
      title: "expensive",
      description: "d",
      priceTl: 100,
      fileUrl: "b",
    });
    await approveItem(cheap.id, admin.id);
    await approveItem(expensive.id, admin.id);
    const results = await search({ priceMaxTl: 50 });
    const ids = results.map((r) => r.id);
    expect(ids).toContain(cheap.id);
    expect(ids).not.toContain(expensive.id);
  });
});
