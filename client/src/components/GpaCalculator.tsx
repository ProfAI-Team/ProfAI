import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { UniversityKey } from '../types/dna';

interface Props {
  onSimulate: (input: {
    courseName: string;
    hypotheticalGrade: number;
    credit: number;
    university: UniversityKey;
  }) => void;
  submitting?: boolean;
}

/**
 * Form that drives the simulator — "if I score X in this course, what
 * does my GPA become?". Pure presentation; the parent (GradesPage) owns
 * the resulting projection.
 */
export const GpaCalculator: React.FC<Props> = ({ onSimulate, submitting }) => {
  const { t } = useTranslation();
  const [courseName, setCourseName] = useState('');
  const [grade, setGrade] = useState(75);
  const [credit, setCredit] = useState(3);
  const [university, setUniversity] = useState<UniversityKey>('aydin');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!courseName.trim()) return;
    onSimulate({
      courseName: courseName.trim(),
      hypotheticalGrade: grade,
      credit,
      university,
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-sm font-medium text-foreground">
          {t('grades.simulator.courseName')}
        </span>
        <input
          type="text"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          className="mt-1 w-full input-base"
          required
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-foreground">
          {t('grades.simulator.grade', { value: grade })}
        </span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={grade}
          onChange={(e) => setGrade(Number(e.target.value))}
          className="mt-1 w-full"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-medium text-foreground">
            {t('grades.simulator.credit')}
          </span>
          <input
            type="number"
            min={1}
            max={20}
            value={credit}
            onChange={(e) => setCredit(Number(e.target.value))}
            className="mt-1 w-full input-base"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-foreground">
            {t('grades.simulator.university')}
          </span>
          <select
            value={university}
            onChange={(e) => setUniversity(e.target.value as UniversityKey)}
            className="mt-1 w-full input-base"
          >
            <option value="aydin">{t('grades.university.aydin')}</option>
            <option value="bogazici">{t('grades.university.bogazici')}</option>
            <option value="odtu">{t('grades.university.odtu')}</option>
          </select>
        </label>
      </div>

      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {t('grades.simulator.submit')}
      </button>
    </form>
  );
};

export default GpaCalculator;
