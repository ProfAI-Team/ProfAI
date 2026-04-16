import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { TURKISH_UNIVERSITIES } from "../data/turkish-universities";
import { getOrBuildStyleProfile } from "../services/professorStyleService";

// University → city lookup table (from data file)
const UNIVERSITY_TO_CITY = new Map<string, string>(
  TURKISH_UNIVERSITIES.map((u) => [u.name, u.city])
);

function buildWhere(params: {
  search?: string;
  department?: string;
  university?: string;
  city?: string;
}) {
  const where: any = {};
  const andClauses: any[] = [];

  if (params.search) {
    andClauses.push({
      OR: [
        { name: { contains: params.search, mode: "insensitive" } },
        { department: { contains: params.search, mode: "insensitive" } },
        { university: { contains: params.search, mode: "insensitive" } },
      ],
    });
  }
  if (params.department) {
    andClauses.push({ department: { contains: params.department, mode: "insensitive" } });
  }
  if (params.university) {
    andClauses.push({ university: { contains: params.university, mode: "insensitive" } });
  }
  if (params.city) {
    // Filter by city via university lookup — find all uni names in that city
    const unisInCity = TURKISH_UNIVERSITIES.filter((u) => u.city === params.city).map(
      (u) => u.name
    );
    if (unisInCity.length > 0) {
      andClauses.push({ university: { in: unisInCity } });
    } else {
      // No universities in this city → no results
      andClauses.push({ university: "__never_match__" });
    }
  }

  if (andClauses.length > 0) where.AND = andClauses;
  return where;
}

function getOrderBy(sort?: string): any {
  switch (sort) {
    case "ratings-desc":
      return [{ ratings: { _count: "desc" } }, { name: "asc" }];
    case "courses-desc":
      return [{ courses: { _count: "desc" } }, { name: "asc" }];
    case "name-desc":
      return { name: "desc" };
    case "name-asc":
    default:
      return { name: "asc" };
  }
}

export const listProfessors = async (req: Request, res: Response): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    const department = req.query.department as string | undefined;
    const university = req.query.university as string | undefined;
    const city = req.query.city as string | undefined;
    const sort = req.query.sort as string | undefined;
    const page = req.query.page as string | undefined;
    const limit = req.query.limit as string | undefined;

    const pageNum = Math.max(1, parseInt(page || "1", 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit || "20", 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where = buildWhere({ search, department, university, city });

    const [professors, total] = await Promise.all([
      prisma.professor.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: getOrderBy(sort),
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

export const getDiscovery = async (req: Request, res: Response): Promise<void> => {
  try {
    const userUniversity = req.query.university as string | undefined;

    const [topRated, byUserUni] = await Promise.all([
      prisma.professor.findMany({
        take: 12,
        orderBy: [{ ratings: { _count: "desc" } }],
        include: { _count: { select: { courses: true, ratings: true } } },
      }),
      userUniversity
        ? prisma.professor.findMany({
            where: { university: userUniversity },
            take: 12,
            orderBy: [{ ratings: { _count: "desc" } }],
            include: { _count: { select: { courses: true, ratings: true } } },
          })
        : Promise.resolve([]),
    ]);

    res.json({
      topRated,
      byUserUni,
    });
  } catch (error) {
    console.error("Get discovery error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getFilterOptions = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Aggregate counts per university and department in single queries
    const [uniGroups, deptGroups] = await Promise.all([
      prisma.professor.groupBy({
        by: ["university"],
        _count: { _all: true },
        orderBy: { university: "asc" },
      }),
      prisma.professor.groupBy({
        by: ["department"],
        _count: { _all: true },
        orderBy: { department: "asc" },
      }),
    ]);

    const universities = uniGroups.map((g) => ({
      name: g.university,
      count: g._count._all,
      city: UNIVERSITY_TO_CITY.get(g.university) || null,
    }));

    const departments = deptGroups.map((g) => ({
      name: g.department,
      count: g._count._all,
    }));

    // Compute city counts (sum profs across unis in same city)
    const cityCountsMap = new Map<string, number>();
    for (const u of universities) {
      if (u.city) {
        cityCountsMap.set(u.city, (cityCountsMap.get(u.city) || 0) + u.count);
      }
    }
    const cities = Array.from(cityCountsMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    res.json({ universities, departments, cities });
  } catch (error) {
    console.error("Get filter options error:", error);
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

// Phase 1 — Style profile endpoint.
// Responses:
//   200 { status: "ready", professor, profile, generatedAt }
//   200 { status: "insufficient_data", professor, examSourceCount, minRequired }
//   404 { error: "Professor not found." }
//   500 { error: "Internal server error." }
export const getStyleProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const professor = await prisma.professor.findUnique({
      where: { id },
      select: { id: true, name: true, department: true, university: true },
    });

    if (!professor) {
      res.status(404).json({ error: "Professor not found." });
      return;
    }

    const result = await getOrBuildStyleProfile(id);

    if (result.status === "insufficient_data") {
      res.json({
        status: "insufficient_data",
        professor,
        examSourceCount: result.examSourceCount,
        minRequired: 3,
      });
      return;
    }

    const p = result.profile;
    res.json({
      status: "ready",
      professor,
      profile: {
        aggregated: p.aggregatedData,
        topTopics: p.topTopics,
        evolution: p.evolution,
        metrics: p.metrics,
        styleSummary: p.geminiSummary,
        examSourceCount: p.examSourceCount,
        isStale: p.isStale,
        geminiVersion: p.geminiVersion,
        generatedAt: p.generatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Get style profile error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
