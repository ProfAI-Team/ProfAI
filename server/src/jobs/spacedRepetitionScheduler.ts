import { countDueByUser } from "../services/spacedRepetitionService";
import prisma from "../lib/prisma";
import { registerWorker, scheduleRepeating } from "../lib/queue";
import { featureLogger } from "../lib/logger";

const QUEUE_NAME = "spaced-repetition-daily";
const log = featureLogger("spacedRepetition");

/**
 * Daily spaced-repetition digest. For each user with due reviews we
 * enqueue a notification job (Phase 6 actually delivers the email /
 * push — for now this writes a structured log line, which the ops
 * team can tail and dashboard off).
 *
 * Frequency gating: users with `reviewFrequency = "off"` are skipped
 * entirely; `"weekly"` users only fire on Mondays.
 */
export function registerSpacedRepetitionWorker(): void {
  registerWorker<Record<string, never>>(QUEUE_NAME, async () => {
    const now = new Date();
    const isMonday = now.getUTCDay() === 1;

    const dueCounts = await countDueByUser(now);
    if (dueCounts.length === 0) return;

    const userIds = dueCounts.map((d) => d.userId);
    const preferences = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, reviewFrequency: true },
    });
    const prefMap = new Map(
      preferences.map((p) => [p.id, p.reviewFrequency ?? "daily"])
    );

    let notified = 0;
    for (const row of dueCounts) {
      const pref = prefMap.get(row.userId) ?? "daily";
      if (pref === "off") continue;
      if (pref === "weekly" && !isMonday) continue;

      log.info(
        {
          event: "spacedRepetition.notification",
          userId: row.userId,
          dueCount: row.dueCount,
          frequency: pref,
          sentAt: now.toISOString(),
        },
        "review digest queued"
      );
      notified += 1;
    }

    log.info({ notified, total: dueCounts.length }, "daily digest complete");
  });
}

/**
 * 09:00 UTC daily. Local time for Europe/Istanbul is ~12:00 — the
 * spec called for 9am to 9pm delivery; Phase 6 timezone-aware logic
 * will target each user's morning.
 */
export async function scheduleSpacedRepetitionDaily(): Promise<void> {
  await scheduleRepeating(QUEUE_NAME, "daily-digest", {}, "0 9 * * *");
}
