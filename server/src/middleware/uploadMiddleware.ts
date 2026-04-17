import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");
const MAX_FILE_SIZE = parseInt(process.env.UPLOAD_MAX_SIZE || "10485760", 10); // 10MB default

const examMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const noteMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

function makeFileFilter(allowed: string[], message: string) {
  return (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(message));
    }
  };
}

export const upload = multer({
  storage,
  fileFilter: makeFileFilter(
    examMimeTypes,
    "Invalid file type. Only PDF, JPG, and PNG files are allowed."
  ),
  limits: { fileSize: MAX_FILE_SIZE },
});

// Study-note uploads accept PDF / DOCX / plain text — matches the extractor
// coverage in `lib/textExtract.ts`. Images go via the OCR path (Phase 6).
export const uploadNote = multer({
  storage,
  fileFilter: makeFileFilter(
    noteMimeTypes,
    "Invalid file type. Only PDF, DOCX, and TXT files are allowed."
  ),
  limits: { fileSize: MAX_FILE_SIZE },
});
