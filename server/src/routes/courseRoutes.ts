import { Router } from "express";
import { listCourses, createCourse, getCourse } from "../controllers/courseController";
import { authenticate } from "../middleware/authMiddleware";
import { asyncHandler } from "../lib/asyncHandler";

const router = Router();

router.get("/", asyncHandler(listCourses));
router.post("/", authenticate, asyncHandler(createCourse));
router.get("/:id", asyncHandler(getCourse));

export default router;
