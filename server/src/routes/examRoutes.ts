import { Router } from "express";
import { uploadExam, getExamsByCourse } from "../controllers/examController";
import { authenticate } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";

const router = Router();

router.post("/upload", authenticate, upload.single("file"), uploadExam);
router.get("/course/:courseId", getExamsByCourse);

export default router;
