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

const router = Router();

router.get("/", listProfessors);
router.get("/filters", getFilterOptions);
router.get("/discovery", getDiscovery);
router.get("/:id", getProfessor);
router.post("/", authenticate, createProfessor);
router.get("/:id/analysis", getProfessorAnalysis);
router.get("/:id/style-profile", getStyleProfile);

export default router;
