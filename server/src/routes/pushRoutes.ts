import { Router } from "express";

import { authenticate } from "../middleware/authMiddleware";
import { asyncHandler } from "../lib/asyncHandler";
import {
  deleteMyDevice,
  getConfig,
  listMyDevices,
  registerMyDevice,
  setMyOptIn,
  testPush,
} from "../controllers/pushController";

const router = Router();

router.get("/config", asyncHandler(getConfig));
router.post("/devices", authenticate, asyncHandler(registerMyDevice));
router.get("/devices", authenticate, asyncHandler(listMyDevices));
router.delete("/devices/:id", authenticate, asyncHandler(deleteMyDevice));
router.patch("/opt-in", authenticate, asyncHandler(setMyOptIn));
router.post("/test", authenticate, asyncHandler(testPush));

export default router;
