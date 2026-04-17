import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X } from 'lucide-react';
import type { SpacedRepetitionReview } from '../types/dna';

interface Props {
  review: SpacedRepetitionReview;
  onComplete: (correct: boolean) => void;
  submitting?: boolean;
}

/**
 * Single spaced-repetition review — shows the question text (a snapshot
 * from SpacedRepetition.questionText), lets the user mark correct or
 * wrong. Parent is expected to handle the optimistic update + server
 * round-trip via TanStack Query.
 */
export const ReviewCard: React.FC<Props> = ({ review, onComplete, submitting }) => {
  const { t } = useTranslation();
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="card-base p-5 space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{t('spacedRepetition.card.streak', { count: review.correctStreak })}</span>
        <span>{t('spacedRepetition.card.lapses', { count: review.lapseCount })}</span>
      </div>
      <p className="text-base text-foreground">
        {review.questionText ?? t('spacedRepetition.card.fallbackText')}
      </p>
      {!revealed ? (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="btn-ghost w-full"
        >
          {t('spacedRepetition.card.reveal')}
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={submitting}
            onClick={() => onComplete(false)}
            className="btn-ghost flex items-center justify-center gap-2 border border-rose-500/30 text-rose-700 dark:text-rose-300"
          >
            <X className="w-4 h-4" />
            {t('spacedRepetition.card.wrong')}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => onComplete(true)}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            {t('spacedRepetition.card.correct')}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
