import { Router } from "express";

import {
  generate,
  getById,
  listMine,
} from "../controllers/studyPackController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post("/generate", authenticate, generate);
router.get("/mine", authenticate, listMine);
router.get("/:id", authenticate, getById);

export default router;
