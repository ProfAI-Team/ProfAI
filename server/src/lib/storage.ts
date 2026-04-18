import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { featureLogger } from "./logger";

const log = featureLogger("storage");

/**
 * File-storage abstraction (Phase 7 task 7.2 — closes open question T2).
 *
 * Until Phase 6 everything wrote to `server/uploads/<uuid>.ext` and the
 * response carried a relative `/uploads/<name>` URL served by
 * `express.static`. That worked for a single VM but does not scale to
 * B2B: OCR + lecture audio + marketplace files will push disk usage
 * past what a single container can hold, and every multi-replica
 * rollout loses files that were written to the evicted pod.
 *
 * Chosen backend: Cloudflare R2 (S3-compatible, egress-free, cheap for
 * notes/audio archives). Existing controllers keep the local path until
 * Phase 7 marketplace is live; new call sites call `storage.put()` +
 * `storage.publicUrl()` directly and get R2 when configured, local
 * fallback otherwise. The `StoragePovider` contract covers both.
 *
 * Environment:
 *   R2_BUCKET             — switch R2 mode on.
 *   R2_ACCOUNT_ID         — required with R2_BUCKET.
 *   R2_ACCESS_KEY_ID      — required with R2_BUCKET.
 *   R2_SECRET_ACCESS_KEY  — required with R2_BUCKET.
 *   R2_PUBLIC_BASE_URL    — optional CDN base (e.g. https://cdn.profai.io);
 *                           when unset we return signed URLs instead.
 *   R2_SIGNED_URL_TTL_SEC — optional, default 3600 (1h).
 *
 * The AWS SDK is loaded lazily — importing `@aws-sdk/client-s3` adds
 * ~2 MB to cold start so we avoid it when R2 is not configured (dev,
 * tests).
 */

export type StorageKind = "local" | "r2";

export interface StorageUploadOptions {
  prefix?: string; // folder under the bucket/uploads dir
  contentType?: string;
  extension?: string; // ".pdf", ".mp3", ".png"; leading dot optional
  filename?: string; // override auto-generated uuid (caller owns it)
}

export interface StoredFile {
  key: string; // stable identifier, safe to persist in DB
  publicUrl: string; // directly-usable URL (signed when R2)
  kind: StorageKind;
  bytes: number;
}

export interface StorageProvider {
  kind: StorageKind;
  put(buffer: Buffer, options: StorageUploadOptions): Promise<StoredFile>;
  publicUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
  listOlderThan(prefix: string, olderThan: Date): Promise<string[]>;
}

let provider: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (provider) return provider;
  if (process.env.R2_BUCKET) {
    provider = createR2Provider();
  } else {
    provider = createLocalProvider();
  }
  return provider;
}

/**
 * Reset the provider singleton — test helper that picks up the current
 * env vars. In production the module-level singleton is set once.
 */
export function __resetStorageForTests(): void {
  provider = null;
}

function normalizeExtension(ext?: string): string {
  if (!ext) return "";
  return ext.startsWith(".") ? ext : `.${ext}`;
}

function buildKey(options: StorageUploadOptions): string {
  const ext = normalizeExtension(options.extension);
  const base = options.filename ?? `${randomUUID()}${ext}`;
  if (!options.prefix) return base;
  const prefix = options.prefix.replace(/^\/+|\/+$/g, "");
  return `${prefix}/${base}`;
}

// --- Local provider ---------------------------------------------------

function createLocalProvider(): StorageProvider {
  const baseDir = path.resolve(
    process.cwd(),
    process.env.LOCAL_UPLOADS_DIR ?? "uploads"
  );

  return {
    kind: "local",

    async put(buffer, options) {
      const key = buildKey(options);
      const absolute = path.join(baseDir, key);
      await fs.mkdir(path.dirname(absolute), { recursive: true });
      await fs.writeFile(absolute, buffer);
      return {
        key,
        publicUrl: `/uploads/${key}`,
        kind: "local",
        bytes: buffer.length,
      };
    },

    async publicUrl(key) {
      return `/uploads/${key}`;
    },

    async delete(key) {
      const absolute = path.join(baseDir, key);
      try {
        await fs.unlink(absolute);
      } catch (err) {
        const code = (err as NodeJS.ErrnoException).code;
        if (code !== "ENOENT") throw err;
      }
    },

    async listOlderThan(prefix, olderThan) {
      const dir = path.join(baseDir, prefix);
      let entries: string[];
      try {
        entries = await fs.readdir(dir);
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
        throw err;
      }
      const out: string[] = [];
      for (const name of entries) {
        const full = path.join(dir, name);
        const stat = await fs.stat(full);
        if (!stat.isFile()) continue;
        if (stat.mtime < olderThan) {
          out.push(path.posix.join(prefix, name));
        }
      }
      return out;
    },
  };
}

// --- R2 provider (lazy SDK) -------------------------------------------

function createR2Provider(): StorageProvider {
  const accountId = requireEnv("R2_ACCOUNT_ID");
  const accessKeyId = requireEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = requireEnv("R2_SECRET_ACCESS_KEY");
  const bucket = requireEnv("R2_BUCKET");
  const publicBase = process.env.R2_PUBLIC_BASE_URL;
  const signedTtlSec = Number(process.env.R2_SIGNED_URL_TTL_SEC ?? 3600);

  // Client + presigner are created on first use so a bad env can't kill
  // boot — the failure surfaces where it matters (the upload call) with
  // a clear stack.
  type S3Client = import("@aws-sdk/client-s3").S3Client;
  let clientPromise: Promise<S3Client> | null = null;

  async function getClient(): Promise<S3Client> {
    if (!clientPromise) {
      clientPromise = (async () => {
        const { S3Client } = await import("@aws-sdk/client-s3");
        return new S3Client({
          region: "auto",
          endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
          credentials: { accessKeyId, secretAccessKey },
        });
      })();
    }
    return clientPromise;
  }

  return {
    kind: "r2",

    async put(buffer, options) {
      const { PutObjectCommand } = await import("@aws-sdk/client-s3");
      const key = buildKey(options);
      const client = await getClient();
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: options.contentType,
        })
      );
      const publicUrl = publicBase
        ? `${publicBase.replace(/\/$/, "")}/${key}`
        : await this.publicUrl(key);
      log.info({ key, bytes: buffer.length }, "r2 put");
      return { key, publicUrl, kind: "r2", bytes: buffer.length };
    },

    async publicUrl(key) {
      if (publicBase) return `${publicBase.replace(/\/$/, "")}/${key}`;
      const { GetObjectCommand } = await import("@aws-sdk/client-s3");
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
      const client = await getClient();
      return getSignedUrl(
        client,
        new GetObjectCommand({ Bucket: bucket, Key: key }),
        { expiresIn: signedTtlSec }
      );
    },

    async delete(key) {
      const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
      const client = await getClient();
      await client.send(
        new DeleteObjectCommand({ Bucket: bucket, Key: key })
      );
    },

    async listOlderThan(prefix, olderThan) {
      const { ListObjectsV2Command } = await import("@aws-sdk/client-s3");
      const client = await getClient();
      const out: string[] = [];
      let continuationToken: string | undefined;
      do {
        const res = await client.send(
          new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: prefix.replace(/^\/+|\/+$/g, ""),
            ContinuationToken: continuationToken,
          })
        );
        for (const obj of res.Contents ?? []) {
          if (!obj.Key) continue;
          if (obj.LastModified && obj.LastModified < olderThan) {
            out.push(obj.Key);
          }
        }
        continuationToken = res.IsTruncated
          ? res.NextContinuationToken
          : undefined;
      } while (continuationToken);
      return out;
    },
  };
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`storage: missing required env var ${name}`);
  }
  return value;
}
