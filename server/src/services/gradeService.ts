import prisma from "../lib/prisma";
import {
  DEFAULT_UNIVERSITY,
  type GpaFormula,
  type UniversityKey,
  gradeToLetter,
  resolveFormula,
} from "../config/gpaFormulas";

/**
 * Grade tracker + GPA calculator.
 *
 * Records live in `GradeRecord`. A record is uniquely identified by
 * (userId, courseKey, semester) where courseKey is `courseId` when
 * the user picks an existing Course, else the free-text `courseName`.
 * Updates to an existing key replace the grade.
 *
 * Pure-math helpers (`weightedGpa`, `applyHypothetical`) are exported
 * so the simulator endpoint doesn't have to re-touch the DB for every
 * "what if" call.
 */

export interface GradeRecordInput {
  courseId?: string;
  courseName: string;
  grade: number; // numeric 0-100
  credit: number;
  semester: string;
  letterGrade?: string;
  university?: UniversityKey;
}

export interface WeightedGradeRow {
  grade: number;
  credit: number;
  university?: string | null;
}

/**
 * Compute a weighted GPA from a list of graded rows. Each row's numeric
 * grade is converted to the preset's point scale, then weighted by
 * credit. Returns null if no rows are supplied (empty term).
 */
export function weightedGpa(
  rows: WeightedGradeRow[],
  defaultFormula: GpaFormula
): {
  gpa: number | null;
  totalCredits: number;
} {
  if (rows.length === 0) return { gpa: null, totalCredits: 0 };
  let pointsTimesCredit = 0;
  let totalCredits = 0;
  for (const row of rows) {
    const formula = resolveFormula(row.university ?? defaultFormula.key);
    const { point } = gradeToLetter(row.grade, formula);
    pointsTimesCredit += point * row.credit;
    totalCredits += row.credit;
  }
  if (totalCredits === 0) return { gpa: null, totalCredits: 0 };
  return {
    gpa: Math.round((pointsTimesCredit / totalCredits) * 100) / 100,
    totalCredits,
  };
}

/**
 * Given the current rows + a hypothetical new course, return the
 * projected GPA. If `courseName` matches an existing row we replace
 * its grade instead of adding a new one.
 */
export function applyHypothetical(
  rows: WeightedGradeRow[] & { courseName?: string }[],
  hypo: {
    courseName: string;
    hypotheticalGrade: number;
    credit: number;
    university?: string | null;
  },
  defaultFormula: GpaFormula
): { gpa: number | null; totalCredits: number } {
  // Note: rows here optionally carry `courseName` for dedupe; callers
  // that don't track names pass rows without — we just append in that case.
  const next: WeightedGradeRow[] = [];
  let replaced = false;
  for (const row of rows) {
    const name = (row as { courseName?: string }).courseName;
    if (name && name === hypo.courseName) {
      next.push({
        grade: hypo.hypotheticalGrade,
        credit: hypo.credit,
        university: hypo.university ?? row.university,
      });
      replaced = true;
    } else {
      next.push(row);
    }
  }
  if (!replaced) {
    next.push({
      grade: hypo.hypotheticalGrade,
      credit: hypo.credit,
      university: hypo.university,
    });
  }
  return weightedGpa(next, defaultFormula);
}

export async function addGrade(
  userId: string,
  input: GradeRecordInput
): Promise<{ id: string; letterGrade: string }> {
  const formula = resolveFormula(input.university);
  const { letter } = gradeToLetter(input.grade, formula);
  const letterGrade = input.letterGrade ?? letter;

  // Dedupe key: (userId, courseId ?? courseName, semester).
  const existing = await prisma.gradeRecord.findFirst({
    where: {
      userId,
      semester: input.semester,
      ...(input.courseId
        ? { courseId: input.courseId }
        : { courseId: null, courseName: input.courseName }),
    },
  });

  if (existing) {
    const updated = await prisma.gradeRecord.update({
      where: { id: existing.id },
      data: {
        grade: input.grade,
        letterGrade,
        credit: input.credit,
        university: input.university ?? existing.university,
        courseName: input.courseName,
      },
    });
    return { id: updated.id, letterGrade };
  }

  const row = await prisma.gradeRecord.create({
    data: {
      userId,
      courseId: input.courseId ?? null,
      courseName: input.courseName,
      grade: input.grade,
      letterGrade,
      credit: input.credit,
      semester: input.semester,
      university: input.university ?? DEFAULT_UNIVERSITY,
    },
  });
  return { id: row.id, letterGrade };
}

export async function listGrades(
  userId: string,
  opts: { semester?: string } = {}
) {
  return prisma.gradeRecord.findMany({
    where: {
      userId,
      ...(opts.semester ? { semester: opts.semester } : {}),
    },
    orderBy: [{ semester: "desc" }, { createdAt: "desc" }],
  });
}

export async function deleteGrade(
  userId: string,
  gradeId: string
): Promise<boolean> {
  const row = await prisma.gradeRecord.findUnique({ where: { id: gradeId } });
  if (!row || row.userId !== userId) return false;
  await prisma.gradeRecord.delete({ where: { id: gradeId } });
  return true;
}

export async function calculateGPA(
  userId: string,
  opts: { semester?: string; university?: UniversityKey } = {}
): Promise<{ gpa: number | null; totalCredits: number; formulaKey: UniversityKey }> {
  const defaultFormula = resolveFormula(opts.university ?? DEFAULT_UNIVERSITY);
  const rows = await prisma.gradeRecord.findMany({
    where: {
      userId,
      ...(opts.semester ? { semester: opts.semester } : {}),
    },
  });
  const result = weightedGpa(
    rows.map((r) => ({
      grade: r.grade,
      credit: r.credit,
      university: (r.university as UniversityKey | null) ?? null,
    })),
    defaultFormula
  );
  return { ...result, formulaKey: defaultFormula.key };
}

/**
 * "If I score X in this course, what does my GPA become?" — pulls the
 * user's existing rows + folds in the hypothetical.
 */
export async function simulateGPA(
  userId: string,
  hypo: {
    courseName: string;
    hypotheticalGrade: number;
    credit: number;
    university?: UniversityKey;
  }
): Promise<{ gpa: number | null; totalCredits: number }> {
  const defaultFormula = resolveFormula(hypo.university ?? DEFAULT_UNIVERSITY);
  const rows = await prisma.gradeRecord.findMany({ where: { userId } });
  const rowsWithName = rows.map((r) => ({
    grade: r.grade,
    credit: r.credit,
    university: r.university,
    courseName: r.courseName,
  }));
  return applyHypothetical(rowsWithName, hypo, defaultFormula);
}

/**
 * "Hedef GPA'ya ulaşmak için bu dersten en az kaç almalıyım?" —
 * binary search across 0-100 for the minimum grade that reaches the
 * target when folded into the existing rows.
 */
export async function whatIfTargetGPA(
  userId: string,
  opts: {
    targetGPA: number;
    courseName: string;
    credit: number;
    university?: UniversityKey;
  }
): Promise<{ minimumGrade: number | null; achievable: boolean }> {
  const defaultFormula = resolveFormula(opts.university ?? DEFAULT_UNIVERSITY);
  const rows = await prisma.gradeRecord.findMany({ where: { userId } });
  const baseline = rows.map((r) => ({
    grade: r.grade,
    credit: r.credit,
    university: r.university,
    courseName: r.courseName,
  }));

  const projectedAt = (grade: number) => {
    const { gpa } = applyHypothetical(
      baseline,
      {
        courseName: opts.courseName,
        hypotheticalGrade: grade,
        credit: opts.credit,
        university: opts.university,
      },
      defaultFormula
    );
    return gpa;
  };

  // Even with a perfect 100, we might not reach the target.
  const maxGpa = projectedAt(100);
  if (maxGpa === null || maxGpa < opts.targetGPA) {
    return { minimumGrade: null, achievable: false };
  }
  // 0 might already exceed the target for users with a tiny hypo weight.
  const minGpa = projectedAt(0);
  if (minGpa !== null && minGpa >= opts.targetGPA) {
    return { minimumGrade: 0, achievable: true };
  }

  // Binary search over integer grades 0..100.
  let lo = 0;
  let hi = 100;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const gpa = projectedAt(mid);
    if (gpa !== null && gpa >= opts.targetGPA) hi = mid;
    else lo = mid + 1;
  }
  return { minimumGrade: lo, achievable: true };
}
