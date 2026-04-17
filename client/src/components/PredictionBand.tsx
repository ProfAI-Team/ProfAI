import React from 'react';
import { useTranslation } from 'react-i18next';
import { Gauge, ShieldAlert } from 'lucide-react';
import type { PredictionBand as PredictionBandShape } from '../types/mockExam';
import { cn } from '../lib/utils';

export interface PredictionBandProps {
  prediction: PredictionBandShape;
  mockScore: number;
  className?: string;
}

function confidenceTone(level: PredictionBandShape['confidence']): string {
  switch (level) {
    case 'high':
      return 'text-emerald-600 border-emerald-500/40 bg-emerald-500/10';
    case 'medium':
      return 'text-primary border-primary/40 bg-primary/10';
    case 'low':
    default:
      return 'text-amber-600 border-amber-500/40 bg-amber-500/10';
  }
}

export const PredictionBand: React.FC<PredictionBandProps> = ({
  prediction,
  mockScore,
  className,
}) => {
  const { t } = useTranslation();
  const lower = Math.max(0, Math.min(100, prediction.lowerBound));
  const upper = Math.max(0, Math.min(100, prediction.upperBound));
  const bandWidth = Math.max(2, upper - lower);
  const scoreClamped = Math.max(0, Math.min(100, mockScore));

  return (
    <div className={cn('card-base p-5 sm:p-6', className)}>
      <div className="flex items-center gap-2 mb-3">
        <Gauge className="w-4 h-4 text-primary" />
        <h3 className="font-display font-semibold text-base">
          {t('mockExam.result.prediction.title')}
        </h3>
        <span
          className={cn(
            'ml-auto px-2 py-0.5 rounded-full border text-[11px] font-semibold uppercase tracking-wide',
            confidenceTone(prediction.confidence)
          )}
        >
          {t(`mockExam.result.prediction.confidence.${prediction.confidence}`)}
        </span>
      </div>

      <p className="text-2xl font-display font-bold text-foreground">
        {t('mockExam.result.prediction.range', {
          lower: Math.round(lower),
          upper: Math.round(upper),
        })}
      </p>

      <div className="relative mt-4 h-3 rounded-full bg-secondary overflow-hidden">
        <div
          className="absolute top-0 h-full rounded-full bg-primary/40"
          style={{
            left: `${lower}%`,
            width: `${bandWidth}%`,
          }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-foreground"
          style={{ left: `${scoreClamped}%` }}
          aria-hidden
        />
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {prediction.reasoning}
      </p>
      <p className="mt-2 text-xs text-muted-foreground flex items-start gap-1.5">
        <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
        <span>{prediction.disclaimer}</span>
      </p>
    </div>
  );
};

export default PredictionBand;
