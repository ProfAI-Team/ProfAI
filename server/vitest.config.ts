import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
    // Integration tests that touch Postgres are gated on DATABASE_URL
    // being set at run time — see tests/integration/* for the skip guard.
    testTimeout: 30_000,
    hookTimeout: 60_000,
    // Phase 5: per-worker Postgres schema isolation is available via the
    // `VITEST_WORKER_COUNT` env var. When unset (default), we stay on
    // singleFork — our ~150 test suite runs in ~2s and re-migrating 4
    // schemas on every run adds ~40s of first-run overhead that is only
    // worth paying when the suite grows past ~300 tests.
    //
    // Set `VITEST_WORKER_COUNT=4` to opt into parallel execution with
    // schema isolation. Phase 6's vitest v4 upgrade is expected to unlock
    // this by default.
    pool: "forks",
    poolOptions: {
      forks: process.env.VITEST_WORKER_COUNT
        ? {
            maxForks: Number(process.env.VITEST_WORKER_COUNT),
            minForks: 1,
          }
        : { singleFork: true },
    },
    globalSetup: ["./tests/globalSetup.ts"],
    setupFiles: ["./tests/setup.ts"],
  },
});
