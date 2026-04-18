import { registerWorker, enqueue } from "../lib/queue";
import { featureLogger } from "../lib/logger";

const log = featureLogger("hocaVerification");

/**
 * Phase 7 task 7.18 — placeholder for the hoca verification follow-up.
 *
 * Phase 7 MVP keeps verification manual: a hoca applies via
 * POST /api/hoca/verify, SUPER_ADMIN inspects the match, runs a
 * LinkedIn check offline, and flips User.role to HOCA via a DB update.
 * Phase 8 plans to automate the LinkedIn probe + email a welcome
 * packet once status flips; this worker gives us the hook without
 * having to reshape the pipeline when that arrives.
 */

const QUEUE = "hoca-verify";

interface JobData {
  userId: string;
  universityEmail: string;
}

export function registerHocaVerificationWorker(): void {
  registerWorker<JobData>(QUEUE, async (data) => {
    log.info(
      { userId: data.userId, email: data.universityEmail },
      "hoca verify request queued — manual review pending"
    );
    // Phase 8:
    //  1. LinkedIn search by email domain + name.
    //  2. If high-confidence match → auto-flip role.
    //  3. Else → page the ops Slack channel.
  });
}

export async function enqueueHocaVerification(
  input: JobData
): Promise<void> {
  await enqueue(QUEUE, input);
}
