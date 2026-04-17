import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';

interface Props {
  count: number;
  minRequired: number;
  titleKey?: string;
  hintKey?: string;
}

export const InsufficientDataBanner: React.FC<Props> = ({
  count,
  minRequired,
  titleKey = 'dna.insufficient.title',
  hintKey = 'dna.insufficient.hint',
}) => {
  const { t } = useTranslation();
  const progress = Math.min(100, Math.round((count / minRequired) * 100));
  return (
    <div className="card-base p-5 sm:p-6 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
        <Sparkles className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-semibold text-foreground">
          {t(titleKey, { count, minRequired })}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(hintKey, { remaining: Math.max(0, minRequired - count) })}
        </p>
        <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {count}/{minRequired}
        </p>
      </div>
    </div>
  );
};

export default InsufficientDataBanner;
