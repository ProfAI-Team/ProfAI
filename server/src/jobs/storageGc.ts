import { registerWorker, scheduleRepeating } from "../lib/queue";
import { featureLogger } from "../lib/logger";
import prisma from "../lib/prisma";
import { getStorage } from "../lib/storage";

const log = featureLogger("storageGc");

/**
 * Phase 7 task 7.18 — storage garbage collector.
 *
 * The KVKK aydınlatma metni promises a 30-day TTL on voice tutor
 * transcripts. Phase 6 landed the persistence side of that promise but
 * the reaper was left as a follow-up — this worker closes it.
 *
 * Separately: R2 (and local disk) accumulate files from deleted domain
 * rows (e.g. OCR / marketplace files whose owning row was removed but
 * the blob survived a race). We walk the marketplace + ocr prefixes
 * and drop anything older than 90 days that no longer has a DB row.
 * Errs on the side of keeping data — if we can't prove orphan status
 * we skip.
 */

const QUEUE = "storage-gc";

const VOICE_TTL_DAYS = 30;
const ORPHAN_TTL_DAYS = 90;

interface JobData {
  task?: "voice-ttl" | "orphan-sweep";
}

export function registerStorageGcWorker(): void {
  registerWorker<JobData>(QUEUE, async (data) => {
    if (!data.task || data.task === "voice-ttl") {
      await runVoiceTtl();
    }
    if (!data.task || data.task === "orphan-sweep") {
      await runOrphanSweep();
    }
  });
}

export async function scheduleStorageGc(): Promise<void> {
  // 03:00 UTC daily — well before the marketplace indexing pass (03:15).
  await scheduleRepeating(QUEUE, "storage-gc-daily", {}, "0 3 * * *");
}

async function runVoiceTtl(): Promise<void> {
  const cutoff = new Date(Date.now() - VOICE_TTL_DAYS * 86_400_000);
  const res = await prisma.voiceSession.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });
  log.info(
    { cutoff: cutoff.toISOString(), removed: res.count },
    "voice session ttl sweep complete"
  );
}

async function runOrphanSweep(): Promise<void> {
  const storage = getStorage();
  const cutoff = new Date(Date.now() - ORPHAN_TTL_DAYS * 86_400_000);

  // Walk each prefix the app writes into. `ocr` + `marketplace` are
  // the only two as of Phase 7.
  for (const prefix of ["ocr", "marketplace"]) {
    const stale = await storage.listOlderThan(prefix, cutoff);
    for (const key of stale) {
      if (await isStillReferenced(key)) continue;
      try {
        await storage.delete(key);
        log.info({ key }, "dropped orphan blob");
      } catch (err) {
        log.warn(
          { key, err: (err as Error).message },
          "failed to drop blob"
        );
      }
    }
  }
}

async function isStillReferenced(key: string): Promise<boolean> {
  const fullLocalPath = `/uploads/${key}`;
  const [ocrCount, mpCount] = await Promise.all([
    prisma.oCRResult.count({
      where: {
        OR: [{ fileUrl: fullLocalPath }, { fileUrl: key }],
      },
    }),
    prisma.marketplaceItem.count({
      where: {
        OR: [{ fileUrl: fullLocalPath }, { fileUrl: key }],
      },
    }),
  ]);
  return ocrCount + mpCount > 0;
}
