import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";

import { AppError, forbidden, unauthorized } from "../lib/AppError";

/**
 * Role-based access control (Phase 7 task 7.11). The authenticate
 * middleware already attaches `req.user.role` from the JWT claim;
 * this wrapper short-circuits the request chain when the caller is
 * not in the allow-list.
 *
 * Hierarchy: SUPER_ADMIN bypasses every other check — it's the ProfAI
 * operator role and is set by DB update, never by self-registration.
 * The other four roles are flat (no implicit inheritance) because
 * HOCA / TUTOR / UNIVERSITY_ADMIN / STUDENT describe disjoint
 * capabilities. A user with `role: HOCA` cannot take tutoring
 * sessions as a student without explicitly also being STUDENT (the
 * column is a single value; we lean on SUPER_ADMIN for cross-role
 * inspection).
 *
 * Typical call shape in a router:
 *
 *   router.get('/hoca/dashboard',
 *     authenticate,
 *     requireRole(['HOCA']),
 *     asyncHandler(hocaController.dashboard));
 */

export type AllowedRole = UserRole | "SUPER_ADMIN";

const SUPER_ADMIN: UserRole = UserRole.SUPER_ADMIN;

export function requireRole(allowed: readonly UserRole[]) {
  const allowSet = new Set<UserRole>(allowed);
  // SUPER_ADMIN always passes unless the caller explicitly constrained
  // the list to other-roles-only (rare; never currently the case).
  allowSet.add(SUPER_ADMIN);

  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(unauthorized("Authentication required"));
    }
    if (!allowSet.has(req.user.role)) {
      return next(
        new AppError(
          "FORBIDDEN_ROLE",
          `Your account role (${req.user.role}) does not have access to this resource.`,
          403
        )
      );
    }
    next();
  };
}

/**
 * Allow the caller either if they match one of the privileged roles OR
 * if the request is about their own user record (matched on a route
 * param). Used by hoca profile edit + tutor self-edit paths where a
 * SUPER_ADMIN may also want to edit on behalf of a user.
 *
 * `paramName` defaults to "userId" which matches the most common
 * route shape (`/users/:userId`).
 */
export function requireRoleOrSelf(
  privileged: readonly UserRole[],
  paramName: string = "userId"
) {
  const allowSet = new Set<UserRole>(privileged);
  allowSet.add(SUPER_ADMIN);

  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(unauthorized("Authentication required"));
    }
    const targetId = req.params[paramName];
    if (targetId && targetId === req.user.id) {
      return next();
    }
    if (!allowSet.has(req.user.role)) {
      return next(
        new AppError(
          "FORBIDDEN_ROLE",
          "You can only modify your own record unless you have the required role.",
          403
        )
      );
    }
    next();
  };
}

/**
 * Route guard for multi-tenant routes that must only expose data from
 * the caller's own UniversityAccount. SUPER_ADMIN bypasses the scope
 * check so operator-level inspection still works.
 */
export function requireTenantMatch(paramName: string = "tenantId") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(unauthorized("Authentication required"));
    }
    if (req.user.role === SUPER_ADMIN) {
      return next();
    }
    const tenantId = req.params[paramName];
    if (!tenantId) {
      return next(
        new AppError(
          "VALIDATION_FAILED",
          `Missing tenant identifier in route param "${paramName}".`,
          400
        )
      );
    }
    if (req.user.universityAccountId !== tenantId) {
      return next(
        forbidden("You do not belong to this university tenant.")
      );
    }
    next();
  };
}
