import { describe, it, expect, beforeEach } from "vitest";

import prisma from "../../src/lib/prisma";
import {
  AYDIN_FORMULA,
  BOGAZICI_FORMULA,
  ODTU_FORMULA,
  gradeToLetter,
  resolveFormula,
} from "../../src/config/gpaFormulas";
import {
  addGrade,
  applyHypothetical,
  calculateGPA,
  deleteGrade,
  listGrades,
  simulateGPA,
  weightedGpa,
  whatIfTargetGPA,
} from "../../src/services/gradeService";

const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

describe("gpaFormulas (pure)", () => {
  it("Aydın: 87 → AA (4.0)", () => {
    expect(gradeToLetter(87, AYDIN_FORMULA)).toEqual({ letter: "AA", point: 4.0 });
  });

  it("Aydın: 65 → CC (2.0)", () => {
    expect(gradeToLetter(65, AYDIN_FORMULA)).toEqual({ letter: "CC", point: 2.0 });
  });

  it("Boğaziçi: 87 → BA (3.5) — stricter bands", () => {
    expect(gradeToLetter(87, BOGAZICI_FORMULA)).toEqual({
      letter: "BA",
      point: 3.5,
    });
  });

  it("ODTÜ: 87 → BA (3.5)", () => {
    expect(gradeToLetter(87, ODTU_FORMULA)).toEqual({ letter: "BA", point: 3.5 });
  });

  it("resolveFormula falls back to aydin for unknown universities", () => {
    expect(resolveFormula("bilkent").key).toBe("aydin");
  });
});

describe("weightedGpa (pure)", () => {
  it("returns null for empty rows", () => {
    expect(weightedGpa([], AYDIN_FORMULA)).toEqual({ gpa: null, totalCredits: 0 });
  });

  it("computes credit-weighted GPA across rows", () => {
    // AA (4.0) × 4 credits + BA (3.5) × 3 credits + CC (2.0) × 3 credits
    // = (16 + 10.5 + 6) / 10 = 3.25
    const result = weightedGpa(
      [
        { grade: 90, credit: 4, university: "aydin" },
        { grade: 82, credit: 3, university: "aydin" },
        { grade: 67, credit: 3, university: "aydin" },
      ],
      AYDIN_FORMULA
    );
    expect(result.gpa).toBe(3.25);
    expect(result.totalCredits).toBe(10);
  });
});

describe("applyHypothetical (pure)", () => {
  it("adds a new course when no name collision", () => {
    const base = [{ grade: 90, credit: 4, university: "aydin" }];
    const result = applyHypothetical(
      base,
      { courseName: "New Course", hypotheticalGrade: 70, credit: 3 },
      AYDIN_FORMULA
    );
    // AA × 4 = 16, CB (2.5) × 3 = 7.5 → 23.5 / 7 = 3.36
    expect(result.totalCredits).toBe(7);
    expect(result.gpa).toBeCloseTo(3.36, 2);
  });

  it("replaces an existing row by courseName", () => {
    const base = [
      { grade: 50, credit: 3, university: "aydin", courseName: "Target" },
      { grade: 90, credit: 4, university: "aydin" },
    ];
    const result = applyHypothetical(
      base,
      { courseName: "Target", hypotheticalGrade: 95, credit: 3 },
      AYDIN_FORMULA
    );
    // Target becomes AA instead of FD → GPA up.
    expect(result.totalCredits).toBe(7);
    expect(result.gpa).toBeGreaterThan(3.5);
  });
});

describeIfDb("gradeService (DB-backed)", () => {
  async function makeUser(suffix: string) {
    return prisma.user.create({
      data: {
        email: `grade-${suffix}-${Date.now()}-${Math.random()}@test.local`,
        password: "x",
        name: "Grade Tester",
      },
    });
  }

  beforeEach(async () => {
    await prisma.gradeRecord.deleteMany({
      where: { user: { email: { contains: "grade-" } } },
    });
  });

  it("addGrade creates a new row and derives letterGrade", async () => {
    const user = await makeUser("add");
    const { id, letterGrade } = await addGrade(user.id, {
      courseName: "Software Project Management",
      grade: 88,
      credit: 3,
      semester: "2026-Spring",
      university: "aydin",
    });
    expect(id).toBeTruthy();
    expect(letterGrade).toBe("AA");
  });

  it("addGrade upserts on same (userId, courseName, semester)", async () => {
    const user = await makeUser("upsert");
    await addGrade(user.id, {
      courseName: "SPM",
      grade: 60,
      credit: 3,
      semester: "2026-Spring",
      university: "aydin",
    });
    await addGrade(user.id, {
      courseName: "SPM",
      grade: 90,
      credit: 3,
      semester: "2026-Spring",
      university: "aydin",
    });
    const rows = await listGrades(user.id);
    expect(rows.length).toBe(1);
    expect(rows[0].grade).toBe(90);
  });

  it("calculateGPA weights credits correctly", async () => {
    const user = await makeUser("calc");
    await addGrade(user.id, {
      courseName: "A",
      grade: 92,
      credit: 4,
      semester: "S",
      university: "aydin",
    });
    await addGrade(user.id, {
      courseName: "B",
      grade: 72,
      credit: 2,
      semester: "S",
      university: "aydin",
    });
    const { gpa, totalCredits } = await calculateGPA(user.id, {
      university: "aydin",
    });
    expect(totalCredits).toBe(6);
    // AA (4.0) × 4 + CB (2.5) × 2 = 16 + 5 = 21 / 6 = 3.5
    expect(gpa).toBe(3.5);
  });

  it("simulateGPA projects a hypothetical new course", async () => {
    const user = await makeUser("sim");
    await addGrade(user.id, {
      courseName: "A",
      grade: 90,
      credit: 4,
      semester: "S",
      university: "aydin",
    });
    const { gpa } = await simulateGPA(user.id, {
      courseName: "New",
      hypotheticalGrade: 60,
      credit: 3,
      university: "aydin",
    });
    // AA × 4 + DC (1.5) × 3 = 16 + 4.5 = 20.5 / 7 = ~2.93
    expect(gpa).toBeCloseTo(2.93, 2);
  });

  it("whatIfTargetGPA returns minimum grade needed or null when unreachable", async () => {
    const user = await makeUser("target");
    await addGrade(user.id, {
      courseName: "Existing",
      grade: 75,
      credit: 3,
      semester: "S",
      university: "aydin",
    });
    // Baseline GPA: BB (3.0). Target a jump to 3.4 via a 4-credit new course.
    // Needs roughly an AA-level score on the new course to pull up the average.
    const achievable = await whatIfTargetGPA(user.id, {
      targetGPA: 3.4,
      courseName: "New",
      credit: 4,
      university: "aydin",
    });
    expect(achievable.achievable).toBe(true);
    expect(achievable.minimumGrade).not.toBeNull();
    // Sanity — needs to be in the AA band.
    expect(achievable.minimumGrade!).toBeGreaterThanOrEqual(85);

    // Impossible target — can't hit 4.0 with a BB (3.0) already locked in.
    const impossible = await whatIfTargetGPA(user.id, {
      targetGPA: 4.0,
      courseName: "Another",
      credit: 1,
      university: "aydin",
    });
    expect(impossible.achievable).toBe(false);
    expect(impossible.minimumGrade).toBeNull();
  });

  it("deleteGrade only works on the owner's row", async () => {
    const alice = await makeUser("owner");
    const bob = await makeUser("intruder");
    const { id } = await addGrade(alice.id, {
      courseName: "C",
      grade: 75,
      credit: 3,
      semester: "S",
      university: "aydin",
    });
    const bobAttempt = await deleteGrade(bob.id, id);
    expect(bobAttempt).toBe(false);
    const aliceSuccess = await deleteGrade(alice.id, id);
    expect(aliceSuccess).toBe(true);
  });
});
