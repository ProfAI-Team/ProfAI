import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { AppError } from "../lib/AppError";
import { logger } from "../lib/logger";

/**
 * Global error handler. Normalizes thrown errors (AppError, ZodError,
 * unknowns) into the `{ error: { code, message, issues? } }` shape used
 * by Phase 2-4+ endpoints.
 *
 * Controllers written in the legacy Phase 0/1 style — those that write
 * `res.status(400).json({ error: "..." })` directly — still work: they
 * don't throw, so this middleware is never invoked for them. Migrating
 * legacy controllers is deferred to Phase 6.
 */
export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.issues !== undefined ? { issues: err.issues } : {}),
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_FAILED",
        message: "Request body failed validation.",
        issues: err.issues,
      },
    });
    return;
  }

  logger.error(
    {
      err,
      requestId: (_req as { id?: string }).id,
    },
    "Unhandled error reached global error middleware"
  );
  res.status(500).json({
    error: {
      code: "INTERNAL",
      message: "Internal server error",
    },
  });
};
