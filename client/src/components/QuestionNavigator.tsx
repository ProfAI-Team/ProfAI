import React from 'react';
import { useTranslation } from 'react-i18next';
import { Flag, Check, Circle } from 'lucide-react';
import { cn } from '../lib/utils';

export interface QuestionNavigatorItem {
  qIdx: number;
  answered: boolean;
  flagged: boolean;
}

export interface QuestionNavigatorProps {
  items: QuestionNavigatorItem[];
  currentIdx: number;
  onSelect: (qIdx: number) => void;
  className?: string;
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  items,
  currentIdx,
  onSelect,
  className,
}) => {
  const { t } = useTranslation();
  const answeredCount = items.filter((i) => i.answered).length;
  const flaggedCount = items.filter((i) => i.flagged).length;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="text-xs text-muted-foreground flex items-center justify-between">
        <span>
          {t('mockExam.session.nav.progress', {
            answered: answeredCount,
            total: items.length,
          })}
        </span>
        {flaggedCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <Flag className="w-3 h-3 text-amber-500" />
            {flaggedCount}
          </span>
        )}
      </div>
      <div className="grid grid-cols-6 gap-1.5" role="tablist" aria-label={t('mockExam.session.nav.ariaLabel')}>
        {items.map((item) => {
          const isActive = item.qIdx === currentIdx;
          return (
            <button
              key={item.qIdx}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={t('mockExam.session.nav.goTo', { n: item.qIdx + 1 })}
              onClick={() => onSelect(item.qIdx)}
              className={cn(
                'relative h-9 rounded-md border text-xs font-mono font-medium transition-colors',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground'
                  : item.answered
                    ? 'border-primary/30 bg-primary/10 text-foreground hover:bg-primary/15'
                    : 'border-border bg-surface text-muted-foreground hover:bg-secondary'
              )}
            >
              {item.qIdx + 1}
              {item.flagged && (
                <Flag className="absolute -top-1 -right-1 w-3 h-3 text-amber-500 fill-amber-500" />
              )}
              {!isActive && item.answered && (
                <Check className="absolute -bottom-1 -right-1 w-3 h-3 text-primary" strokeWidth={3} />
              )}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground pt-2 border-t border-border">
        <span className="inline-flex items-center gap-1">
          <Check className="w-3 h-3 text-primary" strokeWidth={3} />
          {t('mockExam.session.nav.legend.answered')}
        </span>
        <span className="inline-flex items-center gap-1">
          <Flag className="w-3 h-3 text-amber-500" />
          {t('mockExam.session.nav.legend.flagged')}
        </span>
        <span className="inline-flex items-center gap-1">
          <Circle className="w-3 h-3" />
          {t('mockExam.session.nav.legend.unanswered')}
        </span>
      </div>
    </div>
  );
};

export default QuestionNavigator;
