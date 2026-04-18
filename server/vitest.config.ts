import os from "node:os";
import { defineConfig } from "vitest/config";

// Phase 6 (task 6.1): vitest 2→4 upgrade flipped per-worker schema isolation
// to the default path. Each fork binds to its own `test_worker_<poolId>`
// Postgres schema so DB-backed tests can run in parallel without the
// Serializable (40001) retries that drove Phase 4 to singleFork.
const defaultWorkers = Math.min(os.cpus().length, 4);
const WORKER_COUNT = Number(process.env.VITEST_WORKER_COUNT) || defaultWorkers;

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
    // Integration tests that touch Postgres are gated on DATABASE_URL
    // being set at run time — see tests/integration/* for the skip guard.
    testTimeout: 30_000,
    hookTimeout: 60_000,
    pool: "forks",
    // vitest 4 reads `maxWorkers` / `minWorkers` at the top level; pool ID
    // handed to each worker is clamped to `[1, maxWorkers]`, which is what
    // our per-worker schema setup relies on.
    maxWorkers: WORKER_COUNT,
    minWorkers: 1,
    globalSetup: ["./tests/globalSetup.ts"],
    setupFiles: ["./tests/setup.ts"],
  },
});
