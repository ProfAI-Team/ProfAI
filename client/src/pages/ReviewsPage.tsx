import React, { useState } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Calendar, ListChecks, Settings } from 'lucide-react';

import { spacedRepetitionService } from '../services/spacedRepetitionService';
import ReviewCard from '../components/ReviewCard';
import type { SpacedRepetitionReview } from '../types/dna';

type FrequencyValue = 'daily' | 'weekly' | 'off';

const ReviewsPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'today' | 'calendar' | 'settings'>('today');
  const [frequency, setFrequency] = useState<FrequencyValue>('daily');

  const dueQuery = useQuery<SpacedRepetitionReview[]>({
    queryKey: ['spaced-rep', 'due'],
    queryFn: () => spacedRepetitionService.getDue(),
    staleTime: 60_000,
  });

  // Calendar view: 30-day window.
  const calendarEnd = new Date();
  calendarEnd.setDate(calendarEnd.getDate() + 30);
  const calendarQuery = useQuery<SpacedRepetitionReview[]>({
    queryKey: ['spaced-rep', 'calendar'],
    queryFn: () => spacedRepetitionService.getDue(calendarEnd),
    staleTime: 5 * 60_000,
    enabled: tab === 'calendar',
  });

  const completeMutation = useMutation({
    mutationFn: (vars: { questionId: string; correct: boolean }) =>
      spacedRepetitionService.complete(vars.questionId, vars.correct),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ['spaced-rep', 'due'] });
      const prev = queryClient.getQueryData<SpacedRepetitionReview[]>([
        'spaced-rep',
        'due',
      ]);
      queryClient.setQueryData<SpacedRepetitionReview[]>(
        ['spaced-rep', 'due'],
        (old) => (old ?? []).filter((r) => r.questionId !== vars.questionId)
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev)
        queryClient.setQueryData(['spaced-rep', 'due'], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['spaced-rep'] });
    },
  });

  const frequencyMutation = useMutation({
    mutationFn: (f: FrequencyValue) => spacedRepetitionService.setFrequency(f),
  });

  // Group calendar items by day-of-month.
  const calendarByDay = new Map<string, number>();
  (calendarQuery.data ?? []).forEach((r) => {
    const date = new Date(r.nextReview);
    const key = date.toISOString().slice(0, 10);
    calendarByDay.set(key, (calendarByDay.get(key) ?? 0) + 1);
  });

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 space-y-6">
      <header className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
          <ListChecks className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground">
            {t('spacedRepetition.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('spacedRepetition.subtitle')}
          </p>
        </div>
      </header>

      <nav className="flex gap-2 border-b border-border">
        {(['today', 'calendar', 'settings'] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === k
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t(`spacedRepetition.tab.${k}`)}
            {k === 'today' && dueQuery.data && dueQuery.data.length > 0 && (
              <span className="ml-2 inline-block px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
                {dueQuery.data.length}
              </span>
            )}
          </button>
        ))}
      </nav>

      {tab === 'today' && (
        <div className="space-y-3">
          {dueQuery.isLoading ? (
            <div className="card-base h-32 animate-pulse bg-secondary/40" />
          ) : !dueQuery.data || dueQuery.data.length === 0 ? (
            <div className="card-base p-8 text-center">
              <p className="text-foreground font-medium">
                {t('spacedRepetition.empty.title')}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {t('spacedRepetition.empty.hint')}
              </p>
            </div>
          ) : (
            dueQuery.data.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                submitting={completeMutation.isPending}
                onComplete={(correct) =>
                  completeMutation.mutate({
                    questionId: review.questionId,
                    correct,
                  })
                }
              />
            ))
          )}
        </div>
      )}

      {tab === 'calendar' && (
        <section className="card-base p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-primary" />
            <h2 className="font-display font-semibold text-foreground">
              {t('spacedRepetition.calendar.title')}
            </h2>
          </div>
          <div className="grid grid-cols-7 gap-1 text-sm">
            {Array.from({ length: 30 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() + i);
              const key = d.toISOString().slice(0, 10);
              const count = calendarByDay.get(key) ?? 0;
              return (
                <div
                  key={key}
                  className={`p-2 rounded-md text-center ${
                    count === 0
                      ? 'bg-secondary/30 text-muted-foreground'
                      : 'bg-primary-soft text-primary font-semibold'
                  }`}
                >
                  <div className="text-xs">{d.getDate()}</div>
                  {count > 0 && <div className="text-[10px]">{count}</div>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {tab === 'settings' && (
        <section className="card-base p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            <h2 className="font-display font-semibold text-foreground">
              {t('spacedRepetition.settings.title')}
            </h2>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-foreground">
              {t('spacedRepetition.settings.frequencyLabel')}
            </span>
            <select
              className="mt-1 w-full input-base"
              value={frequency}
              onChange={(e) => {
                const f = e.target.value as FrequencyValue;
                setFrequency(f);
                frequencyMutation.mutate(f);
              }}
            >
              <option value="daily">
                {t('spacedRepetition.settings.frequency.daily')}
              </option>
              <option value="weekly">
                {t('spacedRepetition.settings.frequency.weekly')}
              </option>
              <option value="off">
                {t('spacedRepetition.settings.frequency.off')}
              </option>
            </select>
          </label>
          <p className="text-xs text-muted-foreground">
            {t('spacedRepetition.settings.disclaimer')}
          </p>
        </section>
      )}
    </div>
  );
};

export default ReviewsPage;
