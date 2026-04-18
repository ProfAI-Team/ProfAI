import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
  email: string;
  name: string;
  // Phase 7 (7.11) — new tokens carry the role + tenant. Old tokens
  // (pre-rollout) don't — we default to STUDENT on decode, which keeps
  // existing users logged in without a forced re-login.
  role?: UserRole;
  universityAccountId?: string | null;
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Access denied. No token provided." });
      return;
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "default-secret-change-me";

    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role ?? UserRole.STUDENT,
      universityAccountId: decoded.universityAccountId ?? null,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token." });
  }
};
