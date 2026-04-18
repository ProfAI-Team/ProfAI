import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import { analyzeExam } from "../services/analysisService";
import { invalidateStyleProfile } from "../services/professorStyleService";
import { invalidateStudyPacksForProfessor } from "../services/studyPackService";
import { invalidateMockExamsForProfessor } from "../services/mockExamService";
import { badRequest, notFound, unauthorized } from "../lib/AppError";
import { featureLogger } from "../lib/logger";

const log = featureLogger("examUpload");

export const uploadExam = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw unauthorized("Not authenticated.");
  }

  if (!req.file) {
    throw badRequest("No file uploaded.");
  }

  const { courseId, examType, year, semester } = req.body;

  if (!courseId || !examType || !year || !semester) {
    throw badRequest("courseId, examType, year, and semester are required.");
  }

  const validExamTypes = ["MIDTERM", "FINAL", "MAKEUP"];
  if (!validExamTypes.includes(examType)) {
    throw badRequest(
      `Invalid examType. Must be one of: ${validExamTypes.join(", ")}`
    );
  }

  const yearNum = parseInt(year, 10);
  if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
    throw badRequest("Invalid year.");
  }

  const course = await prisma.course.findUnique({ where: { id: courseId as string } });
  if (!course) {
    throw notFound("Course not found.");
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  const exam = await prisma.exam.create({
    data: {
      courseId: courseId as string,
      examType,
      year: yearNum,
      semester: semester as string,
      fileUrl,
      uploadedById: req.user.id,
    },
  });

  const analysisResult = await analyzeExam(req.file.path, req.file.mimetype);

  const analysis = await prisma.examAnalysis.create({
    data: {
      examId: exam.id,
      questionCount: analysisResult.questionCount,
      questionTypes: analysisResult.questionTypes as unknown as Prisma.InputJsonValue,
      topicDistribution: analysisResult.topicDistribution as unknown as Prisma.InputJsonValue,
      difficultyScore: analysisResult.difficultyScore,
      summary: analysisResult.summary,
    },
  });

  // Invalidate the professor's cached style profile — next visit will
  // rebuild it with this new exam in the aggregation. Swallow errors so a
  // telemetry hiccup never breaks the upload response.
  try {
    await invalidateStyleProfile(course.professorId);
  } catch (err) {
    log.error({ err, professorId: course.professorId }, "invalidateStyleProfile failed");
  }

  try {
    await invalidateStudyPacksForProfessor(course.professorId);
  } catch (err) {
    log.error({ err, professorId: course.professorId }, "invalidateStudyPacksForProfessor failed");
  }

  try {
    await invalidateMockExamsForProfessor(course.professorId);
  } catch (err) {
    log.error({ err, professorId: course.professorId }, "invalidateMockExamsForProfessor failed");
  }

  res.status(201).json({
    message: "Exam uploaded and analyzed successfully.",
    exam: {
      ...exam,
      analysis,
    },
  });
};

export const getMyExams = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw unauthorized("Not authenticated.");
  }

  const exams = await prisma.exam.findMany({
    where: { uploadedById: req.user.id },
    include: {
      analysis: true,
      course: {
        include: {
          professor: {
            select: { id: true, name: true, department: true, university: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  res.json({ exams });
};

export const getExamsByCourse = async (req: Request, res: Response): Promise<void> => {
  const courseId = req.params.courseId as string;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    throw notFound("Course not found.");
  }

  const exams = await prisma.exam.findMany({
    where: { courseId },
    include: {
      analysis: true,
      uploadedBy: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ exams });
};
