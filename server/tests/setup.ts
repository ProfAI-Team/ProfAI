// Per-worker test setup. Runs once per Vitest worker before any test file
// imports a module. Rewrites DATABASE_URL so each worker points at its own
// Postgres schema (`test_worker_<poolId>`), preventing the Serializable
// (40001) retries + fixture collisions that caused Phase 4 to fall back to
// `singleFork: true`.
//
// The schemas themselves are created + migrated once per run by
// `tests/globalSetup.ts`. This file just binds each worker to its schema.
//
// `import "dotenv/config"` is load-bearing: vitest does not auto-populate
// `process.env` with `.env` values, and without it this file would run
// before anything else set `DATABASE_URL`, leave it undefined, and skip
// the schema rewrite — at which point PrismaClient's own lazy env loader
// would later resolve `DATABASE_URL=...?schema=public` and every worker
// would pile into the same schema. See the Phase 7 retro note in
// `docs/roadmap/phase-7-b2b-marketplace.md`.

import "dotenv/config";

const poolId = process.env.VITEST_POOL_ID ?? "1";
const schemaName = `test_worker_${poolId}`;

const base = process.env.DATABASE_URL;
if (base) {
  const url = new URL(base);
  url.searchParams.set("schema", schemaName);
  process.env.DATABASE_URL = url.toString();
}
