import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Compass, AlertTriangle, Check } from 'lucide-react';
import { AxiosError } from 'axios';

import { professorService } from '../services/professorService';
import { courseAdvisorService } from '../services/courseAdvisorService';
import PremiumLockCard from '../components/PremiumLockCard';
import type { CompatibilityResult } from '../types/dna';

interface ProfessorOption {
  id: string;
  name: string;
  department: string;
  university: string;
}

const CourseAdvisorPage: React.FC = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<ProfessorOption[]>([]);
  const [selected, setSelected] = useState<ProfessorOption | null>(null);
  const [premiumLocked, setPremiumLocked] = useState(false);
  const [featureDisabled, setFeatureDisabled] = useState(false);

  async function search(q: string) {
    setQuery(q);
    if (q.length < 2) {
      setOptions([]);
      return;
    }
    const profs = await professorService.getAll({ search: q, limit: 5 });
    setOptions(profs as ProfessorOption[]);
  }

  const compatibilityMutation = useMutation<
    CompatibilityResult,
    AxiosError<{ error: { code: string; message: string } }>,
    string
  >({
    mutationFn: (professorId: string) =>
      courseAdvisorService.getCompatibility(professorId),
    onError: (err) => {
      const code = err.response?.data?.error?.code;
      if (code === 'PREMIUM_REQUIRED') setPremiumLocked(true);
      else if (code === 'FEATURE_DISABLED') setFeatureDisabled(true);
    },
  });

  if (premiumLocked) {
    return (
      <div className="max-w-2xl mx-auto p-6 sm:p-8">
        <PremiumLockCard featureKey="courseAdvisor" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-8 space-y-6">
      <header className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
          <Compass className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground">
            {t('courseAdvisor.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('courseAdvisor.subtitle')}
          </p>
        </div>
      </header>

      {featureDisabled && (
        <div className="card-base p-4 text-sm text-amber-700 dark:text-amber-300 border border-amber-500/30">
          {t('premium.featureDisabled')}
        </div>
      )}

      <section className="card-base p-5 sm:p-6 space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-foreground">
            {t('courseAdvisor.search.label')}
          </span>
          <input
            type="text"
            className="mt-1 w-full input-base"
            value={query}
            onChange={(e) => search(e.target.value)}
            placeholder={t('courseAdvisor.search.placeholder')}
          />
        </label>
        {options.length > 0 && (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {options.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(o);
                    setOptions([]);
                    setQuery(o.name);
                    compatibilityMutation.mutate(o.id);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-secondary/60"
                >
                  <div className="font-medium text-foreground">{o.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {o.department} · {o.university}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selected && compatibilityMutation.data && (
        <CompatibilityCard result={compatibilityMutation.data} />
      )}
    </div>
  );
};

const CompatibilityCard: React.FC<{ result: CompatibilityResult }> = ({
  result,
}) => {
  const { t } = useTranslation();
  if (result.status === 'insufficient_dna') {
    return (
      <div className="card-base p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h3 className="font-display font-semibold text-foreground">
            {t('courseAdvisor.insufficient.dna.title')}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('courseAdvisor.insufficient.dna.hint', {
            count: result.dnaQuestionCount,
          })}
        </p>
      </div>
    );
  }
  if (result.status === 'insufficient_professor') {
    return (
      <div className="card-base p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h3 className="font-display font-semibold text-foreground">
            {t('courseAdvisor.insufficient.professor.title')}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('courseAdvisor.insufficient.professor.hint', {
            count: result.professorExamCount,
          })}
        </p>
      </div>
    );
  }
  return (
    <div className="card-base p-5 sm:p-6 space-y-4">
      <div>
        <h3 className="font-display font-semibold text-foreground">
          {result.professor.name}
        </h3>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-4xl font-display font-semibold text-primary">
            {result.score}
          </span>
          <span className="text-sm text-muted-foreground">/ 100</span>
        </div>
      </div>
      {result.reasons.length > 0 && (
        <ul className="space-y-1">
          {result.reasons.map((r) => (
            <li key={r} className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
              <Check className="w-4 h-4" />
              {t(`courseAdvisor.reasons.${r.split(':')[0]}`, {
                n: r.split(':')[1] ?? 0,
              })}
            </li>
          ))}
        </ul>
      )}
      {result.warnings.length > 0 && (
        <ul className="space-y-1">
          {result.warnings.map((w) => (
            <li
              key={w}
              className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300"
            >
              <AlertTriangle className="w-4 h-4" />
              {t(`courseAdvisor.warnings.${w}`)}
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">
        {t('courseAdvisor.disclaimer')}
      </p>
    </div>
  );
};

export default CourseAdvisorPage;
