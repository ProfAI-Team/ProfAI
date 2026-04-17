/**
 * GPA letter-grade conversion presets for the universities ProfAI
 * currently supports. Each formula returns the numeric point value
 * (on a 4.0 scale) for a 0-100 numeric grade.
 *
 * Users pick a preset per-record on the grade tracker page; the
 * default falls back to `aydin` (the demo user's school) when no
 * university is attached. A `custom` preset is reserved for future
 * admin UI — Phase 6.
 */

export type UniversityKey = "aydin" | "bogazici" | "odtu";

export interface GradeBand {
  letter: string;
  min: number; // inclusive
  point: number;
}

export interface GpaFormula {
  key: UniversityKey;
  label: string;
  scale: 4.0;
  bands: GradeBand[]; // sorted high → low
}

// İstanbul Aydın Üniversitesi — Öğrenci Bilgi Sistemi (OBS) ölçeği
// https://akademik.aydin.edu.tr/ (approximation of widely-published
// bands; universities occasionally tune ±1 points).
export const AYDIN_FORMULA: GpaFormula = {
  key: "aydin",
  label: "İstanbul Aydın Üniversitesi",
  scale: 4.0,
  bands: [
    { letter: "AA", min: 85, point: 4.0 },
    { letter: "BA", min: 80, point: 3.5 },
    { letter: "BB", min: 75, point: 3.0 },
    { letter: "CB", min: 70, point: 2.5 },
    { letter: "CC", min: 65, point: 2.0 },
    { letter: "DC", min: 60, point: 1.5 },
    { letter: "DD", min: 55, point: 1.0 },
    { letter: "FD", min: 50, point: 0.5 },
    { letter: "FF", min: 0, point: 0.0 },
  ],
};

// Boğaziçi Üniversitesi — letter-grade-first system, harmonized to
// numeric for simulator purposes.
export const BOGAZICI_FORMULA: GpaFormula = {
  key: "bogazici",
  label: "Boğaziçi Üniversitesi",
  scale: 4.0,
  bands: [
    { letter: "AA", min: 90, point: 4.0 },
    { letter: "BA", min: 85, point: 3.5 },
    { letter: "BB", min: 80, point: 3.0 },
    { letter: "CB", min: 75, point: 2.5 },
    { letter: "CC", min: 70, point: 2.0 },
    { letter: "DC", min: 65, point: 1.5 },
    { letter: "DD", min: 60, point: 1.0 },
    { letter: "F", min: 0, point: 0.0 },
  ],
};

// ODTÜ — slightly stricter bands than Aydın.
export const ODTU_FORMULA: GpaFormula = {
  key: "odtu",
  label: "Orta Doğu Teknik Üniversitesi",
  scale: 4.0,
  bands: [
    { letter: "AA", min: 90, point: 4.0 },
    { letter: "BA", min: 85, point: 3.5 },
    { letter: "BB", min: 80, point: 3.0 },
    { letter: "CB", min: 75, point: 2.5 },
    { letter: "CC", min: 70, point: 2.0 },
    { letter: "DC", min: 65, point: 1.5 },
    { letter: "DD", min: 60, point: 1.0 },
    { letter: "FD", min: 50, point: 0.5 },
    { letter: "FF", min: 0, point: 0.0 },
  ],
};

export const GPA_FORMULAS: Record<UniversityKey, GpaFormula> = {
  aydin: AYDIN_FORMULA,
  bogazici: BOGAZICI_FORMULA,
  odtu: ODTU_FORMULA,
};

export const DEFAULT_UNIVERSITY: UniversityKey = "aydin";

export function resolveFormula(university?: string | null): GpaFormula {
  if (!university) return GPA_FORMULAS[DEFAULT_UNIVERSITY];
  if ((university as UniversityKey) in GPA_FORMULAS) {
    return GPA_FORMULAS[university as UniversityKey];
  }
  return GPA_FORMULAS[DEFAULT_UNIVERSITY];
}

/**
 * Numeric → letter + point using the given formula's bands. Bands are
 * assumed sorted high→low; returns the first band whose `min` is <=
 * the input grade.
 */
export function gradeToLetter(
  numericGrade: number,
  formula: GpaFormula
): { letter: string; point: number } {
  for (const band of formula.bands) {
    if (numericGrade >= band.min) {
      return { letter: band.letter, point: band.point };
    }
  }
  const last = formula.bands[formula.bands.length - 1];
  return { letter: last.letter, point: last.point };
}
