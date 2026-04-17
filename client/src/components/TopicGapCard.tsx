import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingDown, Target } from 'lucide-react';
import type { TopicGap } from '../types/mockExam';
import { cn } from '../lib/utils';

export interface TopicGapCardProps {
  gap: TopicGap;
  studyPackHref?: string;
  className?: string;
}

function tone(accuracy: number): string {
  if (accuracy >= 0.7) return 'text-emerald-600';
  if (accuracy >= 0.4) return 'text-amber-600';
  return 'text-red-600';
}

export const TopicGapCard: React.FC<TopicGapCardProps> = ({
  gap,
  studyPackHref,
  className,
}) => {
  const { t } = useTranslation();
  const accuracyPct = Math.round(gap.accuracy * 100);

  return (
    <div className={cn('card-base p-4', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-display font-semibold truncate text-foreground">
            {gap.topic}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('mockExam.result.topicGap.ratio', {
              correct: gap.correctCount,
              total: gap.totalCount,
            })}
          </p>
        </div>
        <span
          className={cn(
            'flex items-center gap-1 text-sm font-semibold tabular-nums',
            tone(gap.accuracy)
          )}
        >
          <TrendingDown className="w-3.5 h-3.5" />
          %{accuracyPct}
        </span>
      </div>
      <div className="mt-3 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={cn(
            'h-full transition-all',
            accuracyPct >= 70
              ? 'bg-emerald-500'
              : accuracyPct >= 40
                ? 'bg-amber-500'
                : 'bg-red-500'
          )}
          style={{ width: `${accuracyPct}%` }}
        />
      </div>
      {studyPackHref && (
        <a
          href={studyPackHref}
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <Target className="w-3.5 h-3.5" />
          {t('mockExam.result.topicGap.cta')}
        </a>
      )}
    </div>
  );
};

export default TopicGapCard;
