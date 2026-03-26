import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const listCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = req.query.page as string | undefined;
    const limit = req.query.limit as string | undefined;

    const pageNum = Math.max(1, parseInt(page || "1", 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit || "10", 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        skip,
        take: limitNum,
        orderBy: { name: "asc" },
        include: {
          professor: {
            select: { id: true, name: true, department: true, university: true },
          },
          _count: { select: { exams: true } },
        },
      }),
      prisma.course.count(),
    ]);

    res.json({
      courses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("List courses error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, code, professorId } = req.body;

    if (!name || !code || !professorId) {
      res.status(400).json({ error: "Name, code, and professorId are required." });
      return;
    }

    // Verify professor exists
    const professor = await prisma.professor.findUnique({
      where: { id: professorId as string },
    });
    if (!professor) {
      res.status(404).json({ error: "Professor not found." });
      return;
    }

    const course = await prisma.course.create({
      data: { name, code, professorId: professorId as string },
      include: {
        professor: {
          select: { id: true, name: true, department: true, university: true },
        },
      },
    });

    res.status(201).json({ course });
  } catch (error) {
    console.error("Create course error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        professor: {
          select: { id: true, name: true, department: true, university: true },
        },
        exams: {
          include: {
            analysis: true,
            uploadedBy: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!course) {
      res.status(404).json({ error: "Course not found." });
      return;
    }

    res.json({ course });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
