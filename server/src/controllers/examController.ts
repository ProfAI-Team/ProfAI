import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import { analyzeExam } from "../services/analysisService";

export const uploadExam = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "No file uploaded." });
      return;
    }

    const { courseId, examType, year, semester } = req.body;

    if (!courseId || !examType || !year || !semester) {
      res
        .status(400)
        .json({ error: "courseId, examType, year, and semester are required." });
      return;
    }

    // Validate examType
    const validExamTypes = ["MIDTERM", "FINAL", "MAKEUP"];
    if (!validExamTypes.includes(examType)) {
      res.status(400).json({
        error: `Invalid examType. Must be one of: ${validExamTypes.join(", ")}`,
      });
      return;
    }

    const yearNum = parseInt(year, 10);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      res.status(400).json({ error: "Invalid year." });
      return;
    }

    // Verify course exists
    const course = await prisma.course.findUnique({ where: { id: courseId as string } });
    if (!course) {
      res.status(404).json({ error: "Course not found." });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    // Create exam record
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

    // Run analysis (Gemini, with mock fallback on error)
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

    res.status(201).json({
      message: "Exam uploaded and analyzed successfully.",
      exam: {
        ...exam,
        analysis,
      },
    });
  } catch (error) {
    console.error("Upload exam error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getMyExams = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated." });
      return;
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
  } catch (error) {
    console.error("Get my exams error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getExamsByCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = req.params.courseId as string;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      res.status(404).json({ error: "Course not found." });
      return;
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
  } catch (error) {
    console.error("Get exams by course error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
