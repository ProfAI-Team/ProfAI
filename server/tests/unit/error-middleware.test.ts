import { describe, it, expect, vi } from "vitest";
import { z } from "zod";

import { errorMiddleware } from "../../src/middleware/errorMiddleware";
import {
  AppError,
  badRequest,
  notFound,
  paymentRequired,
  unauthorized,
} from "../../src/lib/AppError";

function mockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as unknown as import("express").Response & {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };
}

describe("errorMiddleware", () => {
  it("renders AppError with its code + status", () => {
    const res = mockRes();
    errorMiddleware(
      notFound("Professor not found."),
      {} as import("express").Request,
      res,
      vi.fn()
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: "NOT_FOUND", message: "Professor not found." },
    });
  });

  it("includes issues when provided", () => {
    const res = mockRes();
    errorMiddleware(
      badRequest("Bad input", [{ field: "email", reason: "required" }]),
      {} as import("express").Request,
      res,
      vi.fn()
    );

    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: "VALIDATION_FAILED",
        message: "Bad input",
        issues: [{ field: "email", reason: "required" }],
      },
    });
  });

  it("maps ZodError to VALIDATION_FAILED with raw issues", () => {
    const schema = z.object({ name: z.string().min(3) });
    const parsed = schema.safeParse({ name: "a" });
    expect(parsed.success).toBe(false);

    const res = mockRes();
    errorMiddleware(
      (parsed as z.SafeParseError<{ name: string }>).error,
      {} as import("express").Request,
      res,
      vi.fn()
    );

    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0] as {
      error: { code: string; issues: unknown };
    };
    expect(body.error.code).toBe("VALIDATION_FAILED");
    expect(Array.isArray(body.error.issues)).toBe(true);
  });

  it("falls back to 500 INTERNAL for unknown errors", () => {
    const res = mockRes();
    const origConsoleError = console.error;
    console.error = vi.fn();
    errorMiddleware(
      new Error("something exploded"),
      {} as import("express").Request,
      res,
      vi.fn()
    );
    console.error = origConsoleError;

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: "INTERNAL", message: "Internal server error" },
    });
  });

  it("surfaces 401 UNAUTHORIZED for unauthorized()", () => {
    const res = mockRes();
    errorMiddleware(
      unauthorized(),
      {} as import("express").Request,
      res,
      vi.fn()
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: "UNAUTHORIZED", message: "Authentication required" },
    });
  });

  it("surfaces 402 for paymentRequired() (premium gate)", () => {
    const res = mockRes();
    errorMiddleware(
      paymentRequired("Premium subscription needed"),
      {} as import("express").Request,
      res,
      vi.fn()
    );
    expect(res.status).toHaveBeenCalledWith(402);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: "PREMIUM_REQUIRED",
        message: "Premium subscription needed",
      },
    });
  });

  it("AppError carries explicit code + status when constructed directly", () => {
    const err = new AppError("CUSTOM_CODE", "custom", 418);
    expect(err.code).toBe("CUSTOM_CODE");
    expect(err.status).toBe(418);
    expect(err.message).toBe("custom");
    expect(err).toBeInstanceOf(Error);
  });
});
