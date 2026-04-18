import { Router } from "express";
import multer from "multer";
import type { Request, Response, NextFunction } from "express";

import { authenticate } from "../middleware/authMiddleware";
import { asyncHandler } from "../lib/asyncHandler";
import { badRequest } from "../lib/AppError";
import { requirePremium } from "../middleware/premiumMiddleware";
import {
  voiceSessionDailyLimiter,
  ocrUploadDailyLimiter,
  lectureUploadDailyLimiter,
  multimodalSearchDailyLimiter,
} from "../middleware/rateLimitMiddleware";
import {
  startVoiceSession,
  endVoiceSession,
  getMyVoiceSessions,
  getMyVoiceUsage,
} from "../controllers/voiceController";
import { uploadOCR, getMyOCR, deleteMyOCR } from "../controllers/ocrController";
import {
  uploadLecture,
  getLecture,
  listMyLectures,
} from "../controllers/lectureController";
import { search as multimodalSearch } from "../controllers/multimodalSearchController";

const imageUpload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per image
  fileFilter: (_req, file, cb) => {
    if (/^image\/(png|jpeg|jpg|webp|heic)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error("Yalnızca PNG / JPG / WEBP / HEIC destekleniyor."));
  },
});

const audioUpload = multer({
  dest: "uploads/",
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB — 60min audio
  fileFilter: (_req, file, cb) => {
    if (/^audio\/(mpeg|mp3|wav|mp4|x-m4a|webm)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error("Yalnızca MP3 / WAV / M4A destekleniyor."));
  },
});

function handleUploadErrors(
  uploader: ReturnType<typeof imageUpload.single>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    uploader(req, res, (err: unknown) => {
      if (!err) return next();
      if (err instanceof multer.MulterError) {
        return next(badRequest(err.message, { code: err.code }));
      }
      if (err instanceof Error) return next(badRequest(err.message));
      return next(badRequest("Upload failed."));
    });
  };
}

const router = Router();

// --- Voice tutor ---
router.post(
  "/voice/sessions",
  authenticate,
  requirePremium("VOICE_TUTOR"),
  voiceSessionDailyLimiter,
  asyncHandler(startVoiceSession)
);
router.post(
  "/voice/sessions/end",
  authenticate,
  requirePremium("VOICE_TUTOR"),
  asyncHandler(endVoiceSession)
);
router.get("/voice/sessions/me", authenticate, asyncHandler(getMyVoiceSessions));
router.get("/voice/usage/me", authenticate, asyncHandler(getMyVoiceUsage));

// --- OCR ---
router.post(
  "/ocr/upload",
  authenticate,
  requirePremium("OCR_PRO"),
  ocrUploadDailyLimiter,
  handleUploadErrors(imageUpload.single("image")),
  asyncHandler(uploadOCR)
);
router.get("/ocr/me", authenticate, asyncHandler(getMyOCR));
router.delete("/ocr/:id", authenticate, asyncHandler(deleteMyOCR));

// --- Lecture audio ---
router.post(
  "/lectures/upload",
  authenticate,
  requirePremium("LECTURE_TRANSCRIBE"),
  lectureUploadDailyLimiter,
  handleUploadErrors(audioUpload.single("audio")),
  asyncHandler(uploadLecture)
);
router.get("/lectures/me", authenticate, asyncHandler(listMyLectures));
router.get("/lectures/:id", authenticate, asyncHandler(getLecture));

// --- Multimodal search ---
router.post(
  "/multimodal/search",
  authenticate,
  requirePremium("MULTIMODAL_SEARCH"),
  multimodalSearchDailyLimiter,
  handleUploadErrors(imageUpload.single("image")),
  asyncHandler(multimodalSearch)
);

export default router;
