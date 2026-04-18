import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { badRequest, notFound } from "../lib/AppError";

export const listCourses = async (req: Request, res: Response): Promise<void> => {
  const page = req.query.page as string | undefined;
  const limit = req.query.limit as string | undefined;
  const search = (req.query.search as string | undefined)?.trim();
  const university = (req.query.university as string | undefined)?.trim();
  const professorId = (req.query.professorId as string | undefined)?.trim();

  const pageNum = Math.max(1, parseInt(page || "1", 10) || 1);
  const limitNum = Math.min(200, Math.max(1, parseInt(limit || "20", 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (professorId) {
    where.professorId = professorId;
  }

  if (university) {
    where.professor = { university: { contains: university, mode: "insensitive" } };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
      { professor: { name: { contains: search, mode: "insensitive" } } },
      { professor: { university: { contains: search, mode: "insensitive" } } },
      { professor: { department: { contains: search, mode: "insensitive" } } },
    ];
    if (university) {
      where.AND = [{ professor: { university: { contains: university, mode: "insensitive" } } }];
      delete where.professor;
    }
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: [{ professor: { university: "asc" } }, { code: "asc" }],
      include: {
        professor: {
          select: { id: true, name: true, department: true, university: true },
        },
        _count: { select: { exams: true } },
      },
    }),
    prisma.course.count({ where }),
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
};

export const createCourse = async (req: Request, res: Response): Promise<void> => {
  const { name, code, professorId } = req.body;

  if (!name || !code || !professorId) {
    throw badRequest("Name, code, and professorId are required.");
  }

  const professor = await prisma.professor.findUnique({
    where: { id: professorId as string },
  });
  if (!professor) {
    throw notFound("Professor not found.");
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
};

export const getCourse = async (req: Request, res: Response): Promise<void> => {
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
    throw notFound("Course not found.");
  }

  res.json({ course });
};
