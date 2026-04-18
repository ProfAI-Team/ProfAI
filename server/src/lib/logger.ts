import { randomUUID } from "node:crypto";
import pino, { type Logger } from "pino";
import pinoHttp, { type HttpLogger } from "pino-http";

// Phase 6 task 6.4 — structured logging. Voice sessions, OCR uploads,
// and push delivery each emit enough chatter that console.log lines
// would drown out real problems. pino gives us JSON-in-prod / pretty-
// in-dev output plus a request_id that threads through every log line
// inside a single HTTP request via `req.log.child`.

type LogLevel = "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "silent";

function resolveLevel(): LogLevel {
  const raw = process.env.LOG_LEVEL?.toLowerCase();
  const allowed: LogLevel[] = [
    "fatal",
    "error",
    "warn",
    "info",
    "debug",
    "trace",
    "silent",
  ];
  if (raw && (allowed as string[]).includes(raw)) {
    return raw as LogLevel;
  }
  if (process.env.NODE_ENV === "test") return "silent";
  if (process.env.NODE_ENV === "production") return "info";
  return "debug";
}

const level = resolveLevel();
const isDev = process.env.NODE_ENV !== "production" && level !== "silent";

export const logger: Logger = pino({
  level,
  base: null, // drop default `pid`/`hostname` — noisy in dev
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "*.password",
      "*.apiKey",
    ],
    remove: true,
  },
  ...(isDev
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
      }
    : {}),
});

export const httpLogger: HttpLogger = pinoHttp({
  logger,
  genReqId: (req, _res) => {
    const existing =
      (req.headers["x-request-id"] as string | undefined) ||
      (req.headers["x-correlation-id"] as string | undefined);
    return existing ?? randomUUID();
  },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
    }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
});

/**
 * Returns a child logger bound to the given feature tag — useful for
 * services that want to log outside of an HTTP request (workers, boot
 * hooks, cron-driven jobs).
 */
export function featureLogger(feature: string): Logger {
  return logger.child({ feature });
}
