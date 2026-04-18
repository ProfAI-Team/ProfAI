import { Router } from "express";
import { uploadExam, getExamsByCourse, getMyExams } from "../controllers/examController";
import { authenticate } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";
import { asyncHandler } from "../lib/asyncHandler";

const router = Router();

router.post("/upload", authenticate, upload.single("file"), asyncHandler(uploadExam));
router.get("/mine", authenticate, asyncHandler(getMyExams));
router.get("/course/:courseId", asyncHandler(getExamsByCourse));

export default router;
