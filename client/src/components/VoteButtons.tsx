import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ThumbsUp, ThumbsDown, CheckCheck } from 'lucide-react';

import { questionVoteService } from '../services/questionVoteService';
import { useAuth } from '../context/AuthContext';
import type { QuestionVoteStats } from '../types/community';
import { cn } from '../lib/utils';

export const voteKeys = {
  stats: (questionId: string) => ['questionVote', 'stats', questionId] as const,
};

interface VoteButtonsProps {
  questionId: string;
  /** When true, renders a compact variant suitable for dense lists. */
  compact?: boolean;
}

/**
 * Inline vote widget for any AI-generated question. Wires to
 * /api/questions/:id/vote + came-on-exam with TanStack Query optimistic
 * updates: the UI reflects the intended state before the server responds
 * and rolls back if the mutation fails.
 */
export const VoteButtons = ({ questionId, compact }: VoteButtonsProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const qc = useQueryClient();

  const stats = useQuery<QuestionVoteStats>({
    queryKey: voteKeys.stats(questionId),
    queryFn: () => questionVoteService.getStats(questionId),
    staleTime: 15_000,
  });

  const voteMutation = useMutation({
    mutationFn: (direction: -1 | 0 | 1) =>
      questionVoteService.vote(questionId, { direction }),
    onMutate: async (direction) => {
      await qc.cancelQueries({ queryKey: voteKeys.stats(questionId) });
      const prev = qc.getQueryData<QuestionVoteStats>(
        voteKeys.stats(questionId)
      );
      if (prev) {
        const previousDirection = prev.myVote?.direction ?? 0;
        const next: QuestionVoteStats = {
          ...prev,
          upvotes: prev.upvotes,
          downvotes: prev.downvotes,
          myVote: {
            direction,
            cameOnExam: prev.myVote?.cameOnExam ?? null,
          },
        };
        // Roll the delta: remove previous direction then add new one.
        if (previousDirection === 1) next.upvotes = Math.max(0, next.upvotes - 1);
        if (previousDirection === -1) next.downvotes = Math.max(0, next.downvotes - 1);
        if (direction === 1) next.upvotes += 1;
        if (direction === -1) next.downvotes += 1;
        qc.setQueryData(voteKeys.stats(questionId), next);
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(voteKeys.stats(questionId), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: voteKeys.stats(questionId) });
    },
  });

  const cameMutation = useMutation({
    mutationFn: (value: boolean) =>
      questionVoteService.markCameOnExam(questionId, { cameOnExam: value }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: voteKeys.stats(questionId) });
    },
  });

  if (!user) return null;

  const myDirection = stats.data?.myVote?.direction ?? 0;
  const myCameOnExam = Boolean(stats.data?.myVote?.cameOnExam);
  const upvotes = stats.data?.upvotes ?? 0;
  const downvotes = stats.data?.downvotes ?? 0;
  const cameOnExamCount = stats.data?.cameOnExamCount ?? 0;
  const disabled = voteMutation.isPending;

  const sizeClass = compact ? 'text-[11px] gap-1' : 'text-xs gap-1.5';
  const iconClass = compact ? 'w-3 h-3' : 'w-3.5 h-3.5';

  const handleVote = (next: -1 | 1) => {
    const dir: -1 | 0 | 1 = myDirection === next ? 0 : next;
    voteMutation.mutate(dir);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        aria-pressed={myDirection === 1}
        aria-label={t('community.vote.upvote')}
        disabled={disabled}
        onClick={() => handleVote(1)}
        className={cn(
          'inline-flex items-center rounded-md border px-2 py-1 font-medium transition-colors',
          sizeClass,
          myDirection === 1
            ? 'bg-success/10 text-success border-success/40'
            : 'border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/40'
        )}
      >
        <ThumbsUp className={iconClass} />
        <span className="tabular-nums">{upvotes}</span>
      </button>

      <button
        type="button"
        aria-pressed={myDirection === -1}
        aria-label={t('community.vote.downvote')}
        disabled={disabled}
        onClick={() => handleVote(-1)}
        className={cn(
          'inline-flex items-center rounded-md border px-2 py-1 font-medium transition-colors',
          sizeClass,
          myDirection === -1
            ? 'bg-destructive/10 text-destructive border-destructive/40'
            : 'border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/40'
        )}
      >
        <ThumbsDown className={iconClass} />
        <span className="tabular-nums">{downvotes}</span>
      </button>

      <button
        type="button"
        aria-pressed={myCameOnExam}
        aria-label={t('community.vote.cameOnExam')}
        disabled={cameMutation.isPending}
        onClick={() => cameMutation.mutate(!myCameOnExam)}
        className={cn(
          'inline-flex items-center rounded-md border px-2 py-1 font-medium transition-colors',
          sizeClass,
          myCameOnExam
            ? 'bg-warning/10 text-warning border-warning/40'
            : 'border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/40'
        )}
      >
        <CheckCheck className={iconClass} />
        <span className="hidden sm:inline">
          {t('community.vote.cameOnExam')}
        </span>
        <span className="tabular-nums">{cameOnExamCount}</span>
      </button>
    </div>
  );
};

export default VoteButtons;
