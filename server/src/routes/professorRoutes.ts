import { Router } from "express";
import {
  listProfessors,
  getProfessor,
  createProfessor,
  getProfessorAnalysis,
  getStyleProfile,
  getFilterOptions,
  getDiscovery,
} from "../controllers/professorController";
import { authenticate } from "../middleware/authMiddleware";
import { asyncHandler } from "../lib/asyncHandler";

const router = Router();

router.get("/", asyncHandler(listProfessors));
router.get("/filters", asyncHandler(getFilterOptions));
router.get("/discovery", asyncHandler(getDiscovery));
router.get("/:id", asyncHandler(getProfessor));
router.post("/", authenticate, asyncHandler(createProfessor));
router.get("/:id/analysis", asyncHandler(getProfessorAnalysis));
router.get("/:id/style-profile", asyncHandler(getStyleProfile));

export default router;
