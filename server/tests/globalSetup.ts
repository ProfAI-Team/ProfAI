// Prepares per-worker test schemas once per Vitest run.
//
// Phase 6 (task 6.1): Default path after the vitest 4 upgrade — the suite
// runs in parallel forks and each worker gets its own `test_worker_<id>`
// schema so DB-backed tests don't step on each other. `setup.ts` binds
// every worker's `DATABASE_URL` to its schema via `VITEST_POOL_ID`.

import os from "node:os";
import { execSync } from "node:child_process";

const defaultWorkers = Math.min(os.cpus().length, 4);
const WORKER_COUNT = Number(process.env.VITEST_WORKER_COUNT) || defaultWorkers;

function schemaUrl(base: string, schema: string): string {
  const url = new URL(base);
  url.searchParams.set("schema", schema);
  return url.toString();
}

export async function setup() {
  const base = process.env.DATABASE_URL;
  if (!base) {
    // No database in this environment — integration tests will `describe.skip`.
    return;
  }

  for (let i = 1; i <= WORKER_COUNT; i++) {
    const schema = `test_worker_${i}`;
    const url = schemaUrl(base, schema);

    // `prisma migrate deploy` creates the schema if missing and applies all
    // migrations. It's idempotent, so re-runs are cheap after the first.
    execSync("npx prisma migrate deploy", {
      env: { ...process.env, DATABASE_URL: url },
      stdio: "pipe",
    });
  }
}

export async function teardown() {
  // Keep schemas around between runs — cheap to migrate incrementally,
  // expensive to drop + recreate. CI can prune with `DROP SCHEMA ... CASCADE`
  // on a cadence if storage grows.
}
