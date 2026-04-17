import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Loader2,
  UsersRound,
  Link2,
  CalendarDays,
  Circle,
} from 'lucide-react';

import { studyGroupService } from '../services/studyGroupService';
import type { StudyGroupSummary } from '../types/community';
import ExternalLinkModal from '../components/ExternalLinkModal';
import { cn } from '../lib/utils';

const groupKeys = {
  mine: () => ['studyGroups', 'mine'] as const,
};

const statusTone: Record<StudyGroupSummary['status'], string> = {
  SUGGESTED: 'bg-primary/10 text-primary border-primary/30',
  ACTIVE: 'bg-success/10 text-success border-success/30',
  CLOSED: 'bg-muted text-muted-foreground border-border',
};

const StudyGroupsPage: React.FC = () => {
  const { t } = useTranslation();
  const [linkModalFor, setLinkModalFor] = React.useState<string | null>(null);

  const mine = useQuery({
    queryKey: groupKeys.mine(),
    queryFn: () => studyGroupService.listMine(),
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <header className="space-y-1">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary border border-primary/30 px-2.5 py-0.5 text-[11px] font-medium">
          <UsersRound className="w-3 h-3" />
          {t('community.studyGroup.eyebrow')}
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {t('community.studyGroup.title')}
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          {t('community.studyGroup.subtitle')}
        </p>
      </header>

      {mine.isLoading ? (
        <div className="text-center py-16">
          <Loader2 className="w-5 h-5 text-primary animate-spin mx-auto" />
        </div>
      ) : !mine.data || mine.data.groups.length === 0 ? (
        <div className="card-base p-10 text-center">
          <UsersRound className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-display font-semibold text-foreground">
            {t('community.studyGroup.empty.title')}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {t('community.studyGroup.empty.body')}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {mine.data.groups.map((g) => (
            <li key={g.id} className="card-base p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                    <UsersRound className="w-4 h-4 text-primary" />
                    {t('community.studyGroup.card.title', {
                      count: g.memberCount,
                    })}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                    {g.examDate && (
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {new Date(g.examDate).toLocaleDateString()}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Circle className="w-2 h-2 fill-current" />
                      {t(`community.studyGroup.status.${g.status}`, {
                        defaultValue: g.status,
                      })}
                    </span>
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-[11px] font-medium',
                    statusTone[g.status]
                  )}
                >
                  {t(`community.studyGroup.status.${g.status}`, {
                    defaultValue: g.status,
                  })}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                {g.externalLink ? (
                  <a
                    href={g.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1.5"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    {t('community.studyGroup.card.openLink')}
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {t('community.studyGroup.card.noLink')}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setLinkModalFor(g.id)}
                  disabled={g.status === 'CLOSED'}
                  className="btn-secondary text-xs gap-1.5"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  {g.externalLink
                    ? t('community.studyGroup.card.replaceLink')
                    : t('community.studyGroup.card.attachLink')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {linkModalFor && (
        <ExternalLinkModal
          groupId={linkModalFor}
          onClose={() => setLinkModalFor(null)}
        />
      )}
    </div>
  );
};

export default StudyGroupsPage;
