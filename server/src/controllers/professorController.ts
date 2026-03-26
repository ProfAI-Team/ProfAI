import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const listProfessors = async (req: Request, res: Response): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    const department = req.query.department as string | undefined;
    const university = req.query.university as string | undefined;
    const page = req.query.page as string | undefined;
    const limit = req.query.limit as string | undefined;

    const pageNum = Math.max(1, parseInt(page || "1", 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit || "10", 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }
    if (department) {
      where.department = { contains: department, mode: "insensitive" };
    }
    if (university) {
      where.university = { contains: university, mode: "insensitive" };
    }

    const [professors, total] = await Promise.all([
      prisma.professor.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { name: "asc" },
        include: {
          _count: { select: { courses: true, ratings: true } },
        },
      }),
      prisma.professor.count({ where }),
    ]);

    res.json({
      professors,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("List professors error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getProfessor = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const professor = await prisma.professor.findUnique({
      where: { id },
      include: {
        courses: {
          include: {
            _count: { select: { exams: true } },
          },
        },
        ratings: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: "desc" as const },
        },
      },
    });

    if (!professor) {
      res.status(404).json({ error: "Professor not found." });
      return;
    }

    const ratings = professor.ratings as any[];

    // Calculate average ratings
    const avgDifficulty =
      ratings.length > 0
        ? ratings.reduce((sum: number, r: any) => sum + r.difficultyScore, 0) /
          ratings.length
        : null;
    const avgFairness =
      ratings.length > 0
        ? ratings.reduce((sum: number, r: any) => sum + r.fairnessScore, 0) /
          ratings.length
        : null;

    res.json({
      professor,
      averageRatings: {
        difficulty: avgDifficulty ? parseFloat(avgDifficulty.toFixed(1)) : null,
        fairness: avgFairness ? parseFloat(avgFairness.toFixed(1)) : null,
        totalRatings: ratings.length,
      },
    });
  } catch (error) {
    console.error("Get professor error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const createProfessor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, department, university } = req.body;

    if (!name || !department || !university) {
      res.status(400).json({ error: "Name, department, and university are required." });
      return;
    }

    const professor = await prisma.professor.create({
      data: { name, department, university },
    });

    res.status(201).json({ professor });
  } catch (error) {
    console.error("Create professor error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getProfessorAnalysis = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const professor = await prisma.professor.findUnique({
      where: { id },
      include: {
        courses: {
          include: {
            exams: {
              include: { analysis: true },
            },
          },
        },
      },
    });

    if (!professor) {
      res.status(404).json({ error: "Professor not found." });
      return;
    }

    const courses = professor.courses as any[];

    // Aggregate analysis across all exams
    const allAnalyses = courses.flatMap((course: any) =>
      course.exams
        .filter((exam: any) => exam.analysis !== null)
        .map((exam: any) => exam.analysis!)
    );

    if (allAnalyses.length === 0) {
      res.json({
        professor: { id: professor.id, name: professor.name },
        analysis: null,
        message: "No exam analyses available for this professor.",
      });
      return;
    }

    const avgDifficulty =
      allAnalyses.reduce((sum: number, a: any) => sum + a.difficultyScore, 0) /
      allAnalyses.length;

    const avgQuestionCount =
      allAnalyses.reduce((sum: number, a: any) => sum + a.questionCount, 0) /
      allAnalyses.length;

    // Aggregate question types
    const aggregatedQuestionTypes: Record<string, number[]> = {};
    for (const analysis of allAnalyses) {
      const qt = analysis.questionTypes as Record<string, number>;
      for (const [type, pct] of Object.entries(qt)) {
        if (!aggregatedQuestionTypes[type]) aggregatedQuestionTypes[type] = [];
        aggregatedQuestionTypes[type].push(pct);
      }
    }

    const avgQuestionTypes: Record<string, number> = {};
    for (const [type, values] of Object.entries(aggregatedQuestionTypes)) {
      avgQuestionTypes[type] = parseFloat(
        (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
      );
    }

    // Aggregate topic distribution
    const aggregatedTopics: Record<string, number[]> = {};
    for (const analysis of allAnalyses) {
      const td = analysis.topicDistribution as Record<string, number>;
      for (const [topic, pct] of Object.entries(td)) {
        if (!aggregatedTopics[topic]) aggregatedTopics[topic] = [];
        aggregatedTopics[topic].push(pct);
      }
    }

    const topTopics = Object.entries(aggregatedTopics)
      .map(([topic, values]) => ({
        topic,
        averagePercentage: parseFloat(
          (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
        ),
        frequency: values.length,
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    res.json({
      professor: { id: professor.id, name: professor.name },
      analysis: {
        totalExamsAnalyzed: allAnalyses.length,
        averageDifficultyScore: parseFloat(avgDifficulty.toFixed(1)),
        averageQuestionCount: parseFloat(avgQuestionCount.toFixed(1)),
        averageQuestionTypes: avgQuestionTypes,
        topTopics,
      },
    });
  } catch (error) {
    console.error("Get professor analysis error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
