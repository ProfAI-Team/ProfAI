import { Router } from "express";
import { register, login, getMe } from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";
import { asyncHandler } from "../lib/asyncHandler";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/me", authenticate, asyncHandler(getMe));

export default router;
