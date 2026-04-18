import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  score: number;
  reasons?: string[];
  className?: string;
}

/**
 * Displays the tutor↔student match score from the matching engine's
 * rubric (50% subject + 30% rating + 20% DNA similarity). `reasons`
 * renders below as a short bullet list so the student sees why the
 * tutor surfaced near the top.
 */
export const CompatibilityScore: React.FC<Props> = ({
  score,
  reasons = [],
  className,
}) => {
  const label =
    score >= 80 ? 'Mükemmel uyum' :
    score >= 60 ? 'Güçlü uyum' :
    score >= 40 ? 'Uygun' : 'Değerlendir';

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface p-3',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="relative w-10 h-10 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
            <circle
              cx="20"
              cy="20"
              r="16"
              strokeWidth="4"
              className="stroke-border fill-none"
            />
            <circle
              cx="20"
              cy="20"
              r="16"
              strokeWidth="4"
              strokeDasharray={`${(score / 100) * 100.5} 100.5`}
              strokeLinecap="round"
              className="stroke-primary fill-none transition-all"
            />
          </svg>
          <Sparkles className="absolute inset-0 m-auto w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0">
          <div className="font-display font-semibold text-sm text-foreground">
            {label}
          </div>
          <div className="text-xs text-muted-foreground">
            Uyum skoru: {score}/100
          </div>
        </div>
      </div>
      {reasons.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
          {reasons.slice(0, 3).map((r) => (
            <li key={r}>• {r}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CompatibilityScore;
