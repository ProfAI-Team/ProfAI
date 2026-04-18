import { UserRole } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        // Phase 7 (7.11) — role-gated endpoints read this to decide
        // access. Populated by `authenticate` from the JWT claim; tokens
        // issued before 7.11 rolled out default to STUDENT on decode.
        role: UserRole;
        universityAccountId: string | null;
      };
    }
  }
}

export {};
