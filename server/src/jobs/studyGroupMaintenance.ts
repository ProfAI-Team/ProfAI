import { closeStaleGroups } from "../services/studyGroupService";
import { registerWorker, scheduleRepeating } from "../lib/queue";

// Daily maintenance for the study group layer: closes suggested/active
// groups whose examDate has lapsed more than 30 days ago.
const QUEUE_NAME = "study-group-maintenance";

export function registerStudyGroupMaintenanceWorker(): void {
  registerWorker<Record<string, never>>(QUEUE_NAME, async () => {
    const { closed } = await closeStaleGroups();
    if (closed > 0) {
      console.log(
        `[studyGroupMaintenance] closed ${closed} stale group(s)`
      );
    }
  });
}

/**
 * Registers a repeating BullMQ job at 02:00 UTC daily. Safe to call on
 * every boot — BullMQ de-dupes based on the cron pattern.
 */
export async function scheduleStudyGroupMaintenance(): Promise<void> {
  await scheduleRepeating(
    QUEUE_NAME,
    "daily-close-stale",
    {},
    "0 2 * * *"
  );
}
