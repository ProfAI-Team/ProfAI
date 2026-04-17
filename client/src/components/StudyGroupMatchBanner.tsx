import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { UsersRound, Sparkles, Loader2 } from 'lucide-react';

import { studyGroupService } from '../services/studyGroupService';

interface Props {
  professorId: string;
}

const suggestKeys = {
  byProfessor: (professorId: string) =>
    ['studyGroups', 'suggestions', professorId] as const,
};

export const StudyGroupMatchBanner: React.FC<Props> = ({ professorId }) => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const suggestions = useQuery({
    queryKey: suggestKeys.byProfessor(professorId),
    queryFn: () => studyGroupService.listSuggestions(professorId),
  });

  const join = useMutation({
    mutationFn: () => studyGroupService.join({ professorId }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: suggestKeys.byProfessor(professorId) });
      qc.invalidateQueries({ queryKey: ['studyGroups'] });
    },
  });

  const data = suggestions.data?.suggestions ?? [];
  const top = data[0];

  if (suggestions.isLoading || !top) {
    return null;
  }

  return (
    <section className="card-base p-5 bg-primary/5 border-primary/30 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
          <UsersRound className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="font-display font-semibold">
            {t('community.studyGroup.banner.title', {
              count: top.memberCount,
            })}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('community.studyGroup.banner.subtitle')}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => join.mutate()}
        disabled={join.isPending}
        className="btn-primary text-sm gap-1.5 ml-auto"
      >
        {join.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t('community.studyGroup.banner.joining')}
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            {t('community.studyGroup.banner.join')}
          </>
        )}
      </button>
    </section>
  );
};

export default StudyGroupMatchBanner;
