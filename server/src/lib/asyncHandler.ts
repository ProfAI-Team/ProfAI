import type { Request, Response, NextFunction, RequestHandler } from "express";

// Express 4 doesn't forward Promise rejections from async handlers into the
// error middleware on its own. Phase 6 (task 6.2) migrated legacy Phase 0/1
// controllers from `res.status(x).json({ error: "..." })` to `throw new
// AppError(...)`; wrapping them here routes thrown/rejected errors through
// `errorMiddleware` so the client sees the `{ error: { code, message } }`
// shape uniformly.
export const asyncHandler =
  (
    handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
  ): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
