// Prepares per-worker test schemas once per Vitest run.
//
// Why: With `pool: "forks"` + `singleFork: true` (Phase 4), DB-backed tests
// serialize on the public schema — slow as the suite grows. Isolating each
// worker to its own schema lets us parallelize safely.
//
// How: For each of N parallel workers, create `test_worker_<id>` and run
// `prisma migrate deploy` against that schema. Workers later (`setup.ts`)
// bind their `DATABASE_URL` to the matching schema via `VITEST_POOL_ID`.

import { execSync } from "node:child_process";

// Single-fork mode only needs one schema. Parallel mode needs N.
const WORKER_COUNT = Number(process.env.VITEST_WORKER_COUNT ?? 1);

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
