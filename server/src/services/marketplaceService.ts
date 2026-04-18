import type { MarketplaceItem } from "@prisma/client";

import prisma from "../lib/prisma";
import { AppError, notFound } from "../lib/AppError";
import { featureLogger } from "../lib/logger";
import { embedText, toPgVectorLiteral } from "./llm/embeddingService";
import { cacheGet, cacheInvalidate } from "../lib/cache";

const log = featureLogger("marketplace");

/**
 * Marketplace service (Phase 7 task 7.15). Students list notes /
 * study-guides for sale; SUPER_ADMIN approves; other students search +
 * buy (the purchase itself is routed through paymentService).
 *
 * Commission split (spec, Phase 7):
 *   notes         → ProfAI takes 30%
 *   tutoring      → ProfAI takes 15% (paid out via tutorService, not here)
 *
 * The `calculateCommission` helper is shared so the commission number
 * on receipts + analytics is computed in one place.
 */

export type MarketplaceItemType = "notes" | "study_guide";

export interface CreateItemInput {
  sellerId: string;
  type: MarketplaceItemType;
  title: string;
  description: string;
  priceTl: number;
  fileUrl: string; // storage key from storage.put()
  previewText?: string | null;
  tags?: string[];
}

export interface SearchFilters {
  query?: string;
  type?: MarketplaceItemType;
  priceMinTl?: number;
  priceMaxTl?: number;
  sort?: "recent" | "popular" | "price_asc" | "price_desc";
  limit?: number;
}

export interface CommissionBreakdown {
  gross: number; // kuruş
  commissionPct: number;
  commission: number; // kuruş
  sellerPayout: number; // kuruş
}

const COMMISSION_RATES: Record<MarketplaceItemType, number> = {
  notes: 0.3,
  study_guide: 0.3,
};

const SEARCH_CACHE_TTL_SEC = 120;

function searchCacheKey(filters: SearchFilters): string {
  return `marketplace:search:${filters.query ?? "_"}:${filters.type ?? "_"}:${
    filters.priceMinTl ?? "_"
  }:${filters.priceMaxTl ?? "_"}:${filters.sort ?? "recent"}:${
    filters.limit ?? 20
  }`;
}

export function calculateCommission(
  grossTl: number,
  type: MarketplaceItemType
): CommissionBreakdown {
  const gross = Math.round(grossTl * 100);
  const pct = COMMISSION_RATES[type] ?? 0.3;
  const commission = Math.round(gross * pct);
  return {
    gross,
    commissionPct: pct,
    commission,
    sellerPayout: gross - commission,
  };
}

export async function createItem(
  input: CreateItemInput
): Promise<MarketplaceItem> {
  if (input.priceTl <= 0) {
    throw new AppError(
      "VALIDATION_FAILED",
      "price must be positive",
      400
    );
  }
  if (!input.title.trim() || !input.description.trim()) {
    throw new AppError(
      "VALIDATION_FAILED",
      "title + description are required",
      400
    );
  }

  const item = await prisma.marketplaceItem.create({
    data: {
      sellerId: input.sellerId,
      type: input.type,
      title: input.title.trim(),
      description: input.description,
      price: input.priceTl,
      fileUrl: input.fileUrl,
      previewText: input.previewText ?? null,
      tags: (input.tags ?? []) as unknown as object,
      approved: false,
    },
  });
  log.info({ itemId: item.id, sellerId: input.sellerId }, "marketplace item created");
  return item;
}

export async function approveItem(
  itemId: string,
  approvedById: string
): Promise<MarketplaceItem> {
  const item = await prisma.marketplaceItem.findUnique({
    where: { id: itemId },
  });
  if (!item) throw notFound("Marketplace item not found");
  if (item.approved) return item;

  const updated = await prisma.marketplaceItem.update({
    where: { id: itemId },
    data: { approved: true, approvedById },
  });

  // Embedding: title + tags + truncated description so search quality
  // doesn't collapse when a seller writes a 5-page description.
  const tags = Array.isArray(updated.tags) ? (updated.tags as string[]) : [];
  const embeddingText = [
    updated.title,
    ...(tags as string[]),
    updated.description.slice(0, 500),
  ].join("\n");

  try {
    const vector = await embedText(embeddingText, {
      userId: updated.sellerId,
      feature: "marketplace-embedding",
    });
    if (vector) {
      await prisma.$executeRawUnsafe(
        `UPDATE marketplace_items SET embedding = $1::vector WHERE id = $2`,
        toPgVectorLiteral(vector),
        updated.id
      );
    }
  } catch (err) {
    log.warn(
      { itemId: updated.id, err: (err as Error).message },
      "marketplace embedding failed"
    );
  }

  await cacheInvalidate("marketplace:search:*");
  log.info({ itemId: updated.id }, "marketplace item approved");
  return updated;
}

export async function search(
  filters: SearchFilters
): Promise<MarketplaceItem[]> {
  return cacheGet(
    searchCacheKey(filters),
    async () => runSearch(filters),
    { ttlSec: SEARCH_CACHE_TTL_SEC }
  );
}

async function runSearch(
  filters: SearchFilters
): Promise<MarketplaceItem[]> {
  const limit = filters.limit ?? 20;
  const priceMinTl = filters.priceMinTl ?? 0;
  const priceMaxTl = filters.priceMaxTl ?? 1_000_000;
  const type = filters.type ?? null;

  if (filters.query) {
    const vector = await embedText(filters.query, {
      feature: "marketplace-search",
    });
    if (vector) {
      const rows = await prisma.$queryRawUnsafe<MarketplaceItem[]>(
        `SELECT i.*
         FROM marketplace_items i
         WHERE i.approved = true
           AND ($1::text IS NULL OR i.type = $1)
           AND i.price BETWEEN $2 AND $3
         ORDER BY CASE WHEN i.embedding IS NULL THEN 1 ELSE 0 END,
                  i.embedding <=> $4::vector NULLS LAST
         LIMIT $5`,
        type,
        priceMinTl,
        priceMaxTl,
        toPgVectorLiteral(vector),
        limit
      );
      return rows;
    }
  }

  const orderBy = mapSort(filters.sort);
  return prisma.marketplaceItem.findMany({
    where: {
      approved: true,
      type: type ?? undefined,
      price: { gte: priceMinTl, lte: priceMaxTl },
    },
    orderBy,
    take: limit,
  });
}

function mapSort(sort: SearchFilters["sort"]):
  | { createdAt: "desc" }
  | { totalSales: "desc" }
  | { price: "asc" }
  | { price: "desc" } {
  switch (sort) {
    case "popular":
      return { totalSales: "desc" };
    case "price_asc":
      return { price: "asc" };
    case "price_desc":
      return { price: "desc" };
    default:
      return { createdAt: "desc" };
  }
}

export async function getItemById(
  id: string
): Promise<MarketplaceItem | null> {
  return prisma.marketplaceItem.findUnique({ where: { id } });
}
