/**
 * VAPID key-pair generator (Phase 7 task 7.9). Run once per environment
 * when provisioning Web Push — the resulting public/private keypair goes
 * into the server env and the public key is surfaced to the browser via
 * `GET /api/push/vapid-public-key`.
 *
 * Usage:
 *   cd server && npx tsx scripts/generate-vapid.ts
 *
 * Copy the output into your `.env` (or secret manager). Keys are
 * long-lived — rotate only when leaked, because every subscribed device
 * has to re-subscribe with the new public key (old endpoints fail with
 * InvalidKeyId and our 410-Gone path prunes them on next delivery).
 *
 * The runbook (docs/operations/runbooks/push-vapid.md) covers the full
 * rotation procedure.
 */

import webpush from "web-push";

function main(): void {
  const keys = webpush.generateVAPIDKeys();
  const subject = process.env.VAPID_SUBJECT ?? "mailto:ops@profai.local";

  // eslint-disable-next-line no-console
  console.log(
    [
      "# Generated " + new Date().toISOString(),
      "# Copy into server/.env (dev) or your secret manager (prod).",
      `VAPID_PUBLIC_KEY=${keys.publicKey}`,
      `VAPID_PRIVATE_KEY=${keys.privateKey}`,
      `VAPID_SUBJECT=${subject}`,
      "",
      "# Verify the keypair by running the server and hitting:",
      "#   curl http://localhost:5000/api/push/vapid-public-key",
      "# The response's `publicKey` should match the value above.",
    ].join("\n")
  );
}

main();
