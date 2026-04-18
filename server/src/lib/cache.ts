import IORedis, { type Redis } from "ioredis";
import { featureLogger } from "./logger";

const log = featureLogger("cache");

/**
 * Redis-backed cache (Phase 7 task 7.1 — closes open question T1).
 *
 * Prisma-backed caches (AcademicDNA, ProfessorStyleProfile) stay where
 * they are — a Postgres row is already multi-instance safe. This module
 * is for the new hot paths added in Phase 7 (tutor matching, marketplace
 * search) where every request would otherwise recompute an embedding
 * distance scan.
 *
 * Falls back to an in-memory Map when `REDIS_URL` is unset or
 * `RUN_INLINE_QUEUE=1` is set (test mode). The test fallback keeps the
 * cache contract working without a live Redis — same TTL semantics,
 * same invalidation pattern, just scoped to the current process.
 *
 * Key convention: `profai:cache:<feature>:<identifier>`. Pattern
 * invalidation uses SCAN so we don't block on wildcard-heavy queries.
 */

const KEY_PREFIX = "profai:cache:";

let redis: Redis | null = null;

interface MemoryEntry {
  value: string;
  expiresAt: number;
}

const memoryStore: Map<string, MemoryEntry> = new Map();

function useMemoryFallback(): boolean {
  if (process.env.RUN_INLINE_QUEUE === "1") return true;
  if (!process.env.REDIS_URL) return true;
  return false;
}

function getRedis(): Redis {
  if (!redis) {
    const url = process.env.REDIS_URL ?? "redis://localhost:6379";
    redis = new IORedis(url, {
      // Default retry semantics are fine for cache (unlike BullMQ workers
      // which require maxRetriesPerRequest: null).
      enableOfflineQueue: false,
    });
    redis.on("error", (err) => {
      log.warn({ err: err.message }, "redis cache error");
    });
  }
  return redis;
}

export interface CacheOptions {
  ttlSec: number;
}

function fullKey(key: string): string {
  return key.startsWith(KEY_PREFIX) ? key : `${KEY_PREFIX}${key}`;
}

function memoryGet(key: string): string | null {
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value;
}

function memorySet(key: string, value: string, ttlSec: number): void {
  memoryStore.set(key, {
    value,
    expiresAt: Date.now() + ttlSec * 1000,
  });
}

function memoryDelete(pattern: string): number {
  // Convert simple glob (`foo:*`) into a prefix match — callers only use
  // trailing wildcards, no character classes.
  if (pattern.endsWith("*")) {
    const prefix = pattern.slice(0, -1);
    let removed = 0;
    for (const key of memoryStore.keys()) {
      if (key.startsWith(prefix)) {
        memoryStore.delete(key);
        removed += 1;
      }
    }
    return removed;
  }
  return memoryStore.delete(pattern) ? 1 : 0;
}

/**
 * Cache-aside read: if the key is present, return the parsed value;
 * otherwise call the fetcher, persist, and return the fresh value.
 */
export async function cacheGet<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions
): Promise<T> {
  const k = fullKey(key);
  const raw = await rawGet(k);
  if (raw !== null) {
    try {
      return JSON.parse(raw) as T;
    } catch (err) {
      // Corrupt entry — fall through to refetch.
      log.warn({ key: k, err: (err as Error).message }, "cache parse failed");
    }
  }
  const fresh = await fetcher();
  await rawSet(k, JSON.stringify(fresh), options.ttlSec);
  return fresh;
}

/**
 * Write a cache entry directly without reading first — useful when the
 * caller already has the value (e.g. a mutation that wants to warm the
 * cache on success).
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  options: CacheOptions
): Promise<void> {
  await rawSet(fullKey(key), JSON.stringify(value), options.ttlSec);
}

export async function cacheDel(key: string): Promise<void> {
  const k = fullKey(key);
  if (useMemoryFallback()) {
    memoryDelete(k);
    return;
  }
  await getRedis().del(k);
}

/**
 * Drop every key matching the glob pattern (e.g. `profai:cache:dna:*`).
 * Use this from mutation paths that can't enumerate affected keys.
 */
export async function cacheInvalidate(pattern: string): Promise<number> {
  const p = fullKey(pattern);
  if (useMemoryFallback()) {
    return memoryDelete(p);
  }
  const client = getRedis();
  const stream = client.scanStream({ match: p, count: 100 });
  let removed = 0;
  for await (const keys of stream) {
    if (keys.length === 0) continue;
    await client.del(...keys);
    removed += keys.length;
  }
  return removed;
}

async function rawGet(key: string): Promise<string | null> {
  if (useMemoryFallback()) {
    return memoryGet(key);
  }
  try {
    return await getRedis().get(key);
  } catch (err) {
    // Never fail the caller on a cache miss — treat Redis errors as
    // an implicit miss and let the fetcher run.
    log.warn({ key, err: (err as Error).message }, "cache get failed");
    return null;
  }
}

async function rawSet(
  key: string,
  value: string,
  ttlSec: number
): Promise<void> {
  if (useMemoryFallback()) {
    memorySet(key, value, ttlSec);
    return;
  }
  try {
    await getRedis().set(key, value, "EX", ttlSec);
  } catch (err) {
    log.warn({ key, err: (err as Error).message }, "cache set failed");
  }
}

export async function closeCache(): Promise<void> {
  if (redis) {
    redis.disconnect();
    redis = null;
  }
  memoryStore.clear();
}

/**
 * Test-only helper — forces the in-memory fallback to reset between
 * test cases without going through closeCache (which also drops the
 * Redis connection).
 */
export function __resetCacheForTests(): void {
  memoryStore.clear();
}
