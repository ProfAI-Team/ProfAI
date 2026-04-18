import { registerWorker, enqueue, scheduleRepeating } from "../lib/queue";
import { featureLogger } from "../lib/logger";
import prisma from "../lib/prisma";
import { embedText, toPgVectorLiteral } from "../services/llm/embeddingService";

const log = featureLogger("marketplaceIndexing");

/**
 * Phase 7 task 7.18 — opportunistic embedding refresh for marketplace
 * items.
 *
 * The `approveItem` flow already calls embedText inline, so the
 * standard happy-path doesn't need this worker. It exists for the
 * "approved before embedding service was online" backfill + the
 * "Gemini was 503 during approve" second-chance. Scheduled daily at
 * 03:15 UTC; walks approved items with a NULL embedding, embeds the
 * top 50 per tick (keeps Gemini cost predictable).
 */

const QUEUE = "marketplace-index";
const BATCH_SIZE = 50;

interface JobData {
  itemId?: string; // when present, re-embed that specific item
}

export function registerMarketplaceIndexingWorker(): void {
  registerWorker<JobData>(QUEUE, async (data) => {
    if (data.itemId) {
      await embedItem(data.itemId);
      return;
    }
    await embedBatch();
  });
}

export async function scheduleMarketplaceIndexing(): Promise<void> {
  await scheduleRepeating(QUEUE, "marketplace-index-daily", {}, "15 3 * * *");
}

/** Explicit re-embed — callable from admin controllers if needed. */
export async function enqueueMarketplaceEmbed(itemId: string): Promise<void> {
  await enqueue(QUEUE, { itemId });
}

async function embedBatch(): Promise<void> {
  const rows = await prisma.$queryRawUnsafe<{ id: string; title: string; description: string; tags: unknown }[]>(
    `SELECT id, title, description, tags FROM marketplace_items
     WHERE approved = true AND embedding IS NULL
     LIMIT $1`,
    BATCH_SIZE
  );
  log.info({ batchSize: rows.length }, "marketplace index pass");
  for (const row of rows) {
    try {
      await embedItem(row.id);
    } catch (err) {
      log.warn(
        { itemId: row.id, err: (err as Error).message },
        "embed failed, continuing"
      );
    }
  }
}

async function embedItem(itemId: string): Promise<void> {
  const item = await prisma.marketplaceItem.findUnique({
    where: { id: itemId },
  });
  if (!item) return;
  const tags = Array.isArray(item.tags) ? (item.tags as string[]) : [];
  const text = [item.title, ...tags, item.description.slice(0, 500)].join("\n");
  const vector = await embedText(text, {
    userId: item.sellerId,
    feature: "marketplace-embedding-backfill",
  });
  if (!vector) return;
  await prisma.$executeRawUnsafe(
    `UPDATE marketplace_items SET embedding = $1::vector WHERE id = $2`,
    toPgVectorLiteral(vector),
    itemId
  );
}
