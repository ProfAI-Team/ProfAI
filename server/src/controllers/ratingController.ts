import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const createRating = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }

    const { professorId, difficultyScore, fairnessScore, comment } = req.body;

    if (!professorId || difficultyScore === undefined || fairnessScore === undefined) {
      res.status(400).json({
        error: "professorId, difficultyScore, and fairnessScore are required.",
      });
      return;
    }

    const difficulty = parseInt(difficultyScore, 10);
    const fairness = parseInt(fairnessScore, 10);

    if (isNaN(difficulty) || difficulty < 1 || difficulty > 5) {
      res.status(400).json({ error: "difficultyScore must be between 1 and 5." });
      return;
    }

    if (isNaN(fairness) || fairness < 1 || fairness > 5) {
      res.status(400).json({ error: "fairnessScore must be between 1 and 5." });
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
  } catch (error) {
    console.error("Create rating error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getRatingsByProfessor = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const professorId = req.params.professorId as string;

    const professor = await prisma.professor.findUnique({
      where: { id: professorId },
    });
    if (!professor) {
      res.status(404).json({ error: "Professor not found." });
      return;
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
  } catch (error) {
    console.error("Get ratings by professor error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
