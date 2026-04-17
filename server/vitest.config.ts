import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
    // Integration tests that touch Postgres are gated on DATABASE_URL
    // being set at run time — see tests/integration/* for the skip guard.
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // Phase 4 introduces several DB-backed unit tests (credit / approval /
    // vote / report / group) that share a single Postgres instance. Running
    // test files in parallel causes Serializable-transaction retries
    // (40001) and shared-fixture races. Force a single fork until we
    // introduce per-worker schemas in Phase 5.
    pool: "forks",
    poolOptions: {
      forks: { singleFork: true },
    },
  },
});
