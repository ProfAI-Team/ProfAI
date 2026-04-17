import {
  registerStudyGroupMaintenanceWorker,
  scheduleStudyGroupMaintenance,
} from "./studyGroupMaintenance";
import { closeAll } from "../lib/queue";

/**
 * Boot all background workers + schedule repeating jobs.
 *
 * Called by `src/index.ts` when `RUN_JOBS=1` — so web and worker
 * processes can scale independently in production (the web tier
 * enqueues, the worker tier consumes). In single-process dev the
 * env var can just be set in `.env` alongside `NODE_ENV=development`.
 *
 * Tests never hit this path: they set `RUN_INLINE_QUEUE=1` and the
 * queue lib runs handlers synchronously without Redis.
 */
export async function bootJobs(): Promise<void> {
  registerStudyGroupMaintenanceWorker();
  await scheduleStudyGroupMaintenance();

  const shutdown = async () => {
    console.log("[jobs] shutting down workers...");
    await closeAll();
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  console.log("[jobs] workers registered + scheduled");
}
