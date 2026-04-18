import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";

import { uploadNotes, getMyNotes } from "../controllers/noteController";
import { authenticate } from "../middleware/authMiddleware";
import { uploadNote } from "../middleware/uploadMiddleware";
import { asyncHandler } from "../lib/asyncHandler";
import { badRequest } from "../lib/AppError";

// Wrap Multer so filter/size errors surface as structured 400s through the
// global error middleware instead of bubbling up to the generic 500 handler.
function handleUploadErrors(uploader: ReturnType<typeof uploadNote.array>) {
  return (req: Request, res: Response, next: NextFunction) => {
    uploader(req, res, (err: unknown) => {
      if (!err) return next();
      if (err instanceof multer.MulterError) {
        return next(badRequest(err.message, { code: err.code }));
      }
      if (err instanceof Error) {
        return next(badRequest(err.message));
      }
      return next(badRequest("Upload failed."));
    });
  };
}

const router = Router();

router.post(
  "/upload",
  authenticate,
  handleUploadErrors(uploadNote.array("files", 5)),
  asyncHandler(uploadNotes)
);
router.get("/mine", authenticate, asyncHandler(getMyNotes));

export default router;
