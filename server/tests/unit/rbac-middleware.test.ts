import { describe, it, expect, vi } from "vitest";
import { UserRole } from "@prisma/client";

import {
  requireRole,
  requireRoleOrSelf,
  requireTenantMatch,
} from "../../src/middleware/rbacMiddleware";
import { AppError } from "../../src/lib/AppError";

type ReqShape = {
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    universityAccountId: string | null;
  };
  params?: Record<string, string>;
};

function buildReq(
  role: UserRole | null,
  extras: Partial<ReqShape> = {}
): ReqShape {
  if (role === null) return { params: {}, ...extras };
  return {
    user: {
      id: "u1",
      email: "u1@example.com",
      name: "User 1",
      role,
      universityAccountId: null,
    },
    params: {},
    ...extras,
  };
}

describe("requireRole", () => {
  it("lets an allowed role through", () => {
    const middleware = requireRole([UserRole.HOCA]);
    const req = buildReq(UserRole.HOCA);
    const next = vi.fn();
    middleware(req as any, {} as any, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("blocks a disallowed role with FORBIDDEN_ROLE", () => {
    const middleware = requireRole([UserRole.HOCA]);
    const req = buildReq(UserRole.STUDENT);
    const next = vi.fn();
    middleware(req as any, {} as any, next);
    const err = next.mock.calls[0]?.[0] as AppError;
    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe("FORBIDDEN_ROLE");
    expect(err.status).toBe(403);
  });

  it("SUPER_ADMIN bypasses even when not listed", () => {
    const middleware = requireRole([UserRole.HOCA, UserRole.TUTOR]);
    const req = buildReq(UserRole.SUPER_ADMIN);
    const next = vi.fn();
    middleware(req as any, {} as any, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("throws UNAUTHORIZED when req.user is missing", () => {
    const middleware = requireRole([UserRole.STUDENT]);
    const req = buildReq(null);
    const next = vi.fn();
    middleware(req as any, {} as any, next);
    const err = next.mock.calls[0]?.[0] as AppError;
    expect(err.code).toBe("UNAUTHORIZED");
  });
});

describe("requireRoleOrSelf", () => {
  it("allows the owner even without a privileged role", () => {
    const middleware = requireRoleOrSelf(
      [UserRole.UNIVERSITY_ADMIN],
      "userId"
    );
    const req = buildReq(UserRole.STUDENT, { params: { userId: "u1" } });
    const next = vi.fn();
    middleware(req as any, {} as any, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("rejects a non-owner without a privileged role", () => {
    const middleware = requireRoleOrSelf(
      [UserRole.UNIVERSITY_ADMIN],
      "userId"
    );
    const req = buildReq(UserRole.STUDENT, { params: { userId: "uOther" } });
    const next = vi.fn();
    middleware(req as any, {} as any, next);
    const err = next.mock.calls[0]?.[0] as AppError;
    expect(err.code).toBe("FORBIDDEN_ROLE");
  });

  it("allows a privileged role editing someone else", () => {
    const middleware = requireRoleOrSelf(
      [UserRole.UNIVERSITY_ADMIN],
      "userId"
    );
    const req = buildReq(UserRole.UNIVERSITY_ADMIN, {
      params: { userId: "uOther" },
    });
    const next = vi.fn();
    middleware(req as any, {} as any, next);
    expect(next).toHaveBeenCalledWith();
  });
});

describe("requireTenantMatch", () => {
  it("allows tenant admin inside their own tenant", () => {
    const middleware = requireTenantMatch("tenantId");
    const req = buildReq(UserRole.UNIVERSITY_ADMIN, {
      params: { tenantId: "tenant-1" },
    });
    // Set the tenant on the user record
    req.user!.universityAccountId = "tenant-1";
    const next = vi.fn();
    middleware(req as any, {} as any, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("blocks tenant admin from a different tenant", () => {
    const middleware = requireTenantMatch("tenantId");
    const req = buildReq(UserRole.UNIVERSITY_ADMIN, {
      params: { tenantId: "tenant-2" },
    });
    req.user!.universityAccountId = "tenant-1";
    const next = vi.fn();
    middleware(req as any, {} as any, next);
    const err = next.mock.calls[0]?.[0] as AppError;
    expect(err.code).toBe("FORBIDDEN");
  });

  it("SUPER_ADMIN bypasses tenant scoping", () => {
    const middleware = requireTenantMatch("tenantId");
    const req = buildReq(UserRole.SUPER_ADMIN, {
      params: { tenantId: "tenant-any" },
    });
    const next = vi.fn();
    middleware(req as any, {} as any, next);
    expect(next).toHaveBeenCalledWith();
  });
});
