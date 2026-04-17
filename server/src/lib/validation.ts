import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodTypeAny, type z } from "zod";

const isProd = process.env.NODE_ENV === "production";

function formatIssues(err: ZodError) {
  return err.issues.map((issue) => ({
    path: issue.path.join("."),
    code: issue.code,
    message: issue.message,
  }));
}

/**
 * Standard error shape for all validation failures:
 *   { error: { code: "VALIDATION_FAILED", message, issues? } }
 * `issues` is stripped in production so the payload does not leak the
 * schema shape to callers.
 */
export function sendValidationError(res: Response, err: ZodError) {
  res.status(400).json({
    error: {
      code: "VALIDATION_FAILED",
      message: "Request payload did not match the expected schema.",
      ...(isProd ? {} : { issues: formatIssues(err) }),
    },
  });
}

export function parseOrRespond<S extends ZodTypeAny>(
  schema: S,
  data: unknown,
  res: Response
): z.output<S> | null {
  const result = schema.safeParse(data);
  if (!result.success) {
    sendValidationError(res, result.error);
    return null;
  }
  return result.data;
}

/**
 * Express middleware factory for inline body validation. Attaches the
 * parsed payload at `req.body` so downstream handlers see the typed
 * shape with defaults applied.
 */
export function validateBody<S extends ZodTypeAny>(schema: S) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = parseOrRespond(schema, req.body, res);
    if (parsed === null) return;
    req.body = parsed as typeof req.body;
    next();
  };
}

export function validateQuery<S extends ZodTypeAny>(schema: S) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = parseOrRespond(schema, req.query, res);
    if (parsed === null) return;
    (req as Request & { validatedQuery: z.output<S> }).validatedQuery = parsed;
    next();
  };
}
