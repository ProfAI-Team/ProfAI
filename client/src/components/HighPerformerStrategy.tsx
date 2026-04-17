import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Trophy, Loader2 } from 'lucide-react';

import { postExamReportService } from '../services/postExamReportService';

interface Props {
  professorId: string;
}

const strategyKeys = {
  byProfessor: (professorId: string) =>
    ['highPerformerStrategy', professorId] as const,
};

export const HighPerformerStrategy: React.FC<Props> = ({ professorId }) => {
  const { t } = useTranslation();
  const q = useQuery({
    queryKey: strategyKeys.byProfessor(professorId),
    queryFn: () =>
      postExamReportService.getHighPerformerStrategy(professorId),
    staleTime: 60_000,
  });

  return (
    <section className="card-base p-5 space-y-3">
      <header>
        <h2 className="font-display font-semibold text-lg flex items-center gap-2">
          <Trophy className="w-4 h-4 text-warning" />
          {t('community.highPerformer.title')}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t('community.highPerformer.subtitle')}
        </p>
      </header>

      {q.isLoading && (
        <div className="py-6 text-center">
          <Loader2 className="w-4 h-4 text-primary animate-spin mx-auto" />
        </div>
      )}

      {q.data?.status === 'insufficient' && (
        <div className="text-sm text-muted-foreground">
          {t('community.highPerformer.insufficient', {
            count: q.data.count,
            threshold: q.data.threshold,
          })}
        </div>
      )}

      {q.data?.status === 'ready' && (
        <>
          {q.data.topics.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('community.highPerformer.noDominantTopics')}
            </p>
          ) : (
            <ul className="space-y-2">
              {q.data.topics.map((topic) => (
                <li
                  key={topic.topic}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span className="font-medium truncate">{topic.topic}</span>
                  <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {t(`community.postExam.frequency.${topic.dominantFrequency}`)}
                    </span>
                    <span className="rounded-full bg-warning/10 text-warning px-2 py-0.5 font-medium tabular-nums">
                      {topic.coveragePct}%
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="text-[11px] text-muted-foreground pt-1 border-t border-border">
            {t('community.highPerformer.disclaimer')}
          </p>
        </>
      )}
    </section>
  );
};

export default HighPerformerStrategy;
