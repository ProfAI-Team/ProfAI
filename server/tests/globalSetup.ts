// Prepares per-worker test schemas once per Vitest run.
//
// Phase 6 (task 6.1): Default path after the vitest 4 upgrade — the suite
// runs in parallel forks and each worker gets its own `test_worker_<id>`
// schema so DB-backed tests don't step on each other. `setup.ts` binds
// every worker's `DATABASE_URL` to its schema via `VITEST_POOL_ID`.
//
// Phase 7 retro (2026-04-19): vitest does not auto-load `.env` into
// `process.env`, so both this file and `setup.ts` must pull it in
// explicitly. Without the dotenv import globalSetup saw an undefined
// `DATABASE_URL`, bailed silently, and the whole suite ran against the
// `public` schema — the isolation guarantee was a no-op. See
// `docs/roadmap/phase-7-b2b-marketplace.md` § Parallel test flake.

import "dotenv/config";
import os from "node:os";
import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

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

  // Create every worker schema up front with an admin client pointed at the
  // base URL. Doing this explicitly (rather than relying on `prisma migrate
  // deploy`'s auto-creation) keeps the invariant visible: if the CREATE
  // fails we throw here, instead of letting a silent `migrate deploy`
  // swallow the error and leave the suite running against `public`.
  const admin = new PrismaClient({ datasources: { db: { url: base } } });
  try {
    for (let i = 1; i <= WORKER_COUNT; i++) {
      const schema = `test_worker_${i}`;
      await admin.$executeRawUnsafe(
        `CREATE SCHEMA IF NOT EXISTS "${schema}"`
      );
    }
  } finally {
    await admin.$disconnect();
  }

  for (let i = 1; i <= WORKER_COUNT; i++) {
    const schema = `test_worker_${i}`;
    const url = schemaUrl(base, schema);

    // `prisma migrate deploy` applies every pending migration to the target
    // schema. It's idempotent, so re-runs are cheap after the first.
    try {
      execSync("npx prisma migrate deploy", {
        env: { ...process.env, DATABASE_URL: url },
        stdio: "pipe",
      });
    } catch (e) {
      const err = e as {
        stdout?: Buffer;
        stderr?: Buffer;
        message?: string;
      };
      const stdout = err.stdout?.toString() ?? "";
      const stderr = err.stderr?.toString() ?? "";
      throw new Error(
        `prisma migrate deploy failed for schema "${schema}":\n` +
          `STDOUT:\n${stdout}\nSTDERR:\n${stderr}\n${err.message ?? ""}`
      );
    }
  }
}

export async function teardown() {
  // Keep schemas around between runs — cheap to migrate incrementally,
  // expensive to drop + recreate. CI can prune with `DROP SCHEMA ... CASCADE`
  // on a cadence if storage grows.
}
