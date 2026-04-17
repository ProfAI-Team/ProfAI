/**
 * Structured error type raised by controllers and services.
 *
 * Thrown here, caught by `errorMiddleware`, and rendered as
 * `{ error: { code, message, issues? } }` with the right HTTP status.
 *
 * Phase 5+ endpoints should throw `AppError` (or let Zod validation
 * errors bubble — the middleware normalizes those too) rather than
 * hand-writing `res.status(X).json({ error: "..." })`. Phase 0/1
 * controllers still use the legacy string shape; migrating them is
 * Phase 6 work.
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly issues?: unknown;

  constructor(
    code: string,
    message: string,
    status: number,
    issues?: unknown
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.issues = issues;
  }
}

export const badRequest = (message: string, issues?: unknown) =>
  new AppError("VALIDATION_FAILED", message, 400, issues);

export const unauthorized = (message = "Authentication required") =>
  new AppError("UNAUTHORIZED", message, 401);

export const forbidden = (message = "Not allowed") =>
  new AppError("FORBIDDEN", message, 403);

export const notFound = (message: string) =>
  new AppError("NOT_FOUND", message, 404);

export const conflict = (message: string) =>
  new AppError("CONFLICT", message, 409);

export const paymentRequired = (message: string, code = "PREMIUM_REQUIRED") =>
  new AppError(code, message, 402);

export const rateLimited = (message = "Too many requests") =>
  new AppError("RATE_LIMITED", message, 429);
