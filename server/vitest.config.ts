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
  },
});
