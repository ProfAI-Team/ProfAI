import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";

import { httpLogger } from "./lib/logger";
import authRoutes from "./routes/authRoutes";
import professorRoutes from "./routes/professorRoutes";
import courseRoutes from "./routes/courseRoutes";
import examRoutes from "./routes/examRoutes";
import ratingRoutes from "./routes/ratingRoutes";
import noteRoutes from "./routes/noteRoutes";
import studyPackRoutes from "./routes/studyPackRoutes";
import mockExamRoutes from "./routes/mockExamRoutes";
import communityRoutes from "./routes/communityRoutes";
import dnaRoutes from "./routes/dnaRoutes";
import multimodalRoutes from "./routes/multimodalRoutes";
import pushRoutes from "./routes/pushRoutes";
import accountRoutes from "./routes/accountRoutes";
import b2bRoutes from "./routes/b2bRoutes";
import { errorMiddleware } from "./middleware/errorMiddleware";

export function createApp(): express.Express {
  const app = express();

  app.use(helmet());
  app.use(httpLogger);
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      credentials: true,
    })
  );

  // Rate limiting — 100 req / 15 min / IP.
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests, please try again later.",
      },
    },
  });
  app.use(limiter);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // All /api routers attach `authenticate` per-route, so mount order is
  // no longer load-bearing — previously dnaRoutes installed auth at the
  // router level and had to sit last, which 401'd b2b's public browse
  // endpoints when it sat first.
  app.use("/api/auth", authRoutes);
  app.use("/api/professors", professorRoutes);
  app.use("/api/courses", courseRoutes);
  app.use("/api/exams", examRoutes);
  app.use("/api/ratings", ratingRoutes);
  app.use("/api/notes", noteRoutes);
  app.use("/api/study-pack", studyPackRoutes);
  app.use("/api/mock-exam", mockExamRoutes);
  app.use("/api", communityRoutes);
  app.use("/api", b2bRoutes);
  app.use("/api", dnaRoutes);
  app.use("/api", multimodalRoutes);
  app.use("/api/push", pushRoutes);
  app.use("/api/users", accountRoutes);

  app.use(errorMiddleware);

  return app;
}

export default createApp();
