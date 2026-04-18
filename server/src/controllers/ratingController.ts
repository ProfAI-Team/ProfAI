import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { badRequest, notFound, unauthorized } from "../lib/AppError";

export const createRating = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw unauthorized("Not authenticated.");
  }

  const { professorId, difficultyScore, fairnessScore, comment } = req.body;

  if (!professorId || difficultyScore === undefined || fairnessScore === undefined) {
    throw badRequest(
      "professorId, difficultyScore, and fairnessScore are required."
    );
  }

  const difficulty = parseInt(difficultyScore, 10);
  const fairness = parseInt(fairnessScore, 10);

  if (isNaN(difficulty) || difficulty < 1 || difficulty > 5) {
    throw badRequest("difficultyScore must be between 1 and 5.");
  }

  if (isNaN(fairness) || fairness < 1 || fairness > 5) {
    throw badRequest("fairnessScore must be between 1 and 5.");
  }

  const professor = await prisma.professor.findUnique({
    where: { id: professorId as string },
  });
  if (!professor) {
    throw notFound("Professor not found.");
  }

  const rating = await prisma.professorRating.create({
    data: {
      professorId: professorId as string,
      userId: req.user.id,
      difficultyScore: difficulty,
      fairnessScore: fairness,
      comment: comment || null,
    },
    include: {
      user: { select: { id: true, name: true } },
      professor: { select: { id: true, name: true } },
    },
  });

  res.status(201).json({ rating });
};

export const getRatingsByProfessor = async (
  req: Request,
  res: Response
): Promise<void> => {
  const professorId = req.params.professorId as string;

  const professor = await prisma.professor.findUnique({
    where: { id: professorId },
  });
  if (!professor) {
    throw notFound("Professor not found.");
  }

  const ratings = await prisma.professorRating.findMany({
    where: { professorId },
    include: {
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const avgDifficulty =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.difficultyScore, 0) / ratings.length
      : null;

  const avgFairness =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.fairnessScore, 0) / ratings.length
      : null;

  res.json({
    ratings,
    averages: {
      difficulty: avgDifficulty ? parseFloat(avgDifficulty.toFixed(1)) : null,
      fairness: avgFairness ? parseFloat(avgFairness.toFixed(1)) : null,
      totalRatings: ratings.length,
    },
  });
};
