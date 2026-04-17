import React, { Suspense, lazy, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Brain, RefreshCw, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';

import { dnaService } from '../services/dnaService';
import { InsufficientDataBanner } from '../components/InsufficientDataBanner';
import type { DNAResponse, LearningStyle } from '../types/dna';

const DNARadar = lazy(() => import('../components/charts/DNARadar'));

const LEARNING_STYLES: LearningStyle[] = [
  'reading',
  'kinesthetic',
  'visual',
  'mixed',
  null,
];

const DNAProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editingStyle, setEditingStyle] = useState(false);

  const dnaQuery = useQuery<DNAResponse>({
    queryKey: ['dna', 'me'],
    queryFn: () => dnaService.getDNA(),
    staleTime: 60_000,
  });

  const recomputeMutation = useMutation({
    mutationFn: () => dnaService.recompute(),
    onSuccess: (result) => {
      queryClient.setQueryData(['dna', 'me'], result);
    },
  });

  const styleMutation = useMutation({
    mutationFn: (style: LearningStyle) => dnaService.setLearningStyle(style),
    onSuccess: () => {
      setEditingStyle(false);
      queryClient.invalidateQueries({ queryKey: ['dna', 'me'] });
    },
  });

  if (dnaQuery.isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 sm:p-8">
        <div className="card-base h-48 animate-pulse bg-secondary/40" />
      </div>
    );
  }

  const data = dnaQuery.data;
  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 space-y-6">
      <header className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
          <Brain className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-semibold text-foreground">
            {t('dna.profile.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('dna.profile.subtitle')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => recomputeMutation.mutate()}
          disabled={recomputeMutation.isPending}
          className="btn-ghost flex items-center gap-2"
          title={t('dna.profile.recompute')}
        >
          <RefreshCw
            className={`w-4 h-4 ${
              recomputeMutation.isPending ? 'animate-spin' : ''
            }`}
          />
          <span className="hidden sm:inline">{t('dna.profile.recompute')}</span>
        </button>
      </header>

      {data.status === 'insufficient' && (
        <InsufficientDataBanner
          count={data.count}
          minRequired={data.minRequired}
        />
      )}

      {data.status === 'ready' && (
        <>
          <section className="card-base p-6 sm:p-8">
            <h2 className="font-display font-semibold text-foreground mb-4">
              {t('dna.profile.radar.title')}
            </h2>
            <Suspense
              fallback={<div className="h-[320px] rounded-xl bg-secondary/40 animate-pulse" />}
            >
              <DNARadar
                data={data.dna.strengths.map((s) => ({
                  topic: s.topic,
                  score: s.score,
                }))}
              />
            </Suspense>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section className="card-base p-5 sm:p-6">
              <header className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <h3 className="font-display font-semibold text-foreground">
                  {t('dna.profile.strengths.title')}
                </h3>
              </header>
              {data.dna.strengths.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t('dna.profile.strengths.empty')}
                </p>
              ) : (
                <ul className="space-y-2">
                  {data.dna.strengths.slice(0, 5).map((s) => (
                    <li
                      key={s.topic}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-foreground">{s.topic}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {s.score}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card-base p-5 sm:p-6">
              <header className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-4 h-4 text-rose-500" />
                <h3 className="font-display font-semibold text-foreground">
                  {t('dna.profile.weaknesses.title')}
                </h3>
              </header>
              {data.dna.weaknesses.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t('dna.profile.weaknesses.empty')}
                </p>
              ) : (
                <ul className="space-y-2">
                  {data.dna.weaknesses.slice(0, 5).map((w) => (
                    <li
                      key={w.topic}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-foreground">{w.topic}</span>
                      <span className="text-rose-600 dark:text-rose-400 font-medium">
                        {w.score}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="card-base p-5 sm:p-6">
            <header className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="font-display font-semibold text-foreground">
                  {t('dna.profile.learningStyle.title')}
                </h3>
              </div>
              {!editingStyle && (
                <button
                  type="button"
                  className="btn-ghost text-xs"
                  onClick={() => setEditingStyle(true)}
                >
                  {t('dna.profile.learningStyle.override')}
                </button>
              )}
            </header>
            {!editingStyle ? (
              <p className="text-sm text-foreground">
                {t(
                  `dna.profile.learningStyle.values.${
                    data.dna.learningStyle ?? 'unknown'
                  }`
                )}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {LEARNING_STYLES.map((s) => (
                  <button
                    key={String(s)}
                    type="button"
                    onClick={() => styleMutation.mutate(s)}
                    disabled={styleMutation.isPending}
                    className="btn-ghost text-xs"
                  >
                    {t(`dna.profile.learningStyle.values.${s ?? 'unknown'}`)}
                  </button>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-3">
              {t('dna.profile.learningStyle.disclaimer')}
            </p>
          </section>

          <section className="card-base p-4 sm:p-5 border-dashed text-xs text-muted-foreground">
            {t('dna.profile.kvkkNotice', {
              samples: data.dna.totalQuestionsAnswered,
            })}
          </section>
        </>
      )}
    </div>
  );
};

export default DNAProfilePage;
