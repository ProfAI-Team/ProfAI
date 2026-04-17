import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";

import { uploadNotes, getMyNotes } from "../controllers/noteController";
import { authenticate } from "../middleware/authMiddleware";
import { uploadNote } from "../middleware/uploadMiddleware";

const router = Router();

// Wrap Multer so filter/size errors translate to JSON 400s instead of
// bubbling up to the generic 500 handler and losing the root cause.
function handleUploadErrors(uploader: ReturnType<typeof uploadNote.array>) {
  return (req: Request, res: Response, next: NextFunction) => {
    uploader(req, res, (err: unknown) => {
      if (!err) return next();
      if (err instanceof multer.MulterError) {
        res.status(400).json({ error: err.message, code: err.code });
        return;
      }
      if (err instanceof Error) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.status(400).json({ error: "Upload failed." });
    });
  };
}

router.post(
  "/upload",
  authenticate,
  handleUploadErrors(uploadNote.array("files", 5)),
  uploadNotes
);
router.get("/mine", authenticate, getMyNotes);

export default router;
