import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ClipboardList, PenLine, Loader2 } from 'lucide-react';

import { postExamReportService } from '../services/postExamReportService';
import { cn } from '../lib/utils';

interface Props {
  professorId: string;
}

export const aggregatedKeys = {
  byProfessor: (professorId: string) =>
    ['postExamReport', 'aggregated', professorId] as const,
};

/** Panel on ProfessorDetailPage: k-anonymized post-exam aggregate. */
export const AggregatedExamInsights: React.FC<Props> = ({ professorId }) => {
  const { t } = useTranslation();
  const q = useQuery({
    queryKey: aggregatedKeys.byProfessor(professorId),
    queryFn: () => postExamReportService.getAggregated(professorId),
    staleTime: 60_000,
  });

  return (
    <section className="card-base p-5 space-y-3">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-display font-semibold text-lg flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" />
            {t('community.postExam.insights.title')}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('community.postExam.insights.subtitle')}
          </p>
        </div>
        <Link
          to={`/post-exam-reports/new?professorId=${professorId}`}
          className="btn-secondary text-xs gap-1.5"
        >
          <PenLine className="w-3.5 h-3.5" />
          {t('community.postExam.insights.contributeCta')}
        </Link>
      </header>

      {q.isLoading && (
        <div className="py-6 text-center">
          <Loader2 className="w-4 h-4 text-primary animate-spin mx-auto" />
        </div>
      )}

      {q.data?.status === 'insufficient' && (
        <div className="text-sm text-muted-foreground py-2">
          {t('community.postExam.insights.insufficient', {
            count: q.data.count,
            threshold: q.data.threshold,
          })}
        </div>
      )}

      {q.data?.status === 'ready' && (
        <ul className="space-y-2">
          {q.data.topics.slice(0, 5).map((topic) => (
            <li
              key={topic.topic}
              className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium truncate">{topic.topic}</p>
                <p className="text-xs text-muted-foreground">
                  {t(`community.postExam.frequency.${topic.frequencyMode}`)}
                  {' · '}
                  {t('community.postExam.insights.difficulty', {
                    value: topic.medianDifficulty.toFixed(1),
                  })}
                </p>
              </div>
              <span
                className={cn(
                  'rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[11px] font-medium tabular-nums'
                )}
              >
                ×{topic.reportedCount}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default AggregatedExamInsights;
