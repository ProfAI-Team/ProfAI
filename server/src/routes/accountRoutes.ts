import { Router } from "express";

import { authenticate } from "../middleware/authMiddleware";
import { asyncHandler } from "../lib/asyncHandler";
import { deleteMyData } from "../controllers/accountController";

const router = Router();

// Phase 7 task 7.4 — "delete everything about me".
// Mounted under /api/users so the path ends up
// `DELETE /api/users/me/data`, mirroring the KVKK notice copy.
router.delete("/me/data", authenticate, asyncHandler(deleteMyData));

export default router;
