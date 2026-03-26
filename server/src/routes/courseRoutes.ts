import { Router } from "express";
import { listCourses, createCourse, getCourse } from "../controllers/courseController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/", listCourses);
router.post("/", authenticate, createCourse);
router.get("/:id", getCourse);

export default router;
