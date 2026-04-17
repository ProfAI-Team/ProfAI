import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Target } from 'lucide-react';

import { confidenceService } from '../services/confidenceService';

/**
 * Dashboard widget — "Bu hafta çalışman gereken 3 konu". Pulls the
 * three lowest-scoring confidence rows and lists them with their
 * scores. Silent when the user has no confidence data yet.
 */
export const WeakTopicsWidget: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['confidence', 'weakest', 3],
    queryFn: () => confidenceService.getWeakest(3),
    staleTime: 5 * 60_000,
  });

  if (isLoading) {
    return <div className="card-base h-32 animate-pulse bg-secondary/40" />;
  }
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <section className="card-base p-5 sm:p-6">
      <header className="flex items-center gap-2 mb-3">
        <Target className="w-4 h-4 text-primary" />
        <h3 className="font-display font-semibold text-foreground">
          {t('confidence.widget.title')}
        </h3>
      </header>
      <ul className="space-y-2">
        {data.map((topic) => (
          <li
            key={topic.topic}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-foreground">{topic.topic}</span>
            <span
              className={`font-medium ${
                topic.score < 40
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {topic.score}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground mt-3">
        {t('confidence.widget.hint')}
      </p>
    </section>
  );
};

export default WeakTopicsWidget;
