import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

export interface ScoreGaugeProps {
  score: number;
  size?: number;
  label?: string;
  className?: string;
}

function toneForScore(score: number): string {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 60) return 'text-primary';
  if (score >= 40) return 'text-amber-500';
  return 'text-red-500';
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 160,
  label,
  className,
}) => {
  const { t } = useTranslation();
  const clamped = Math.max(0, Math.min(100, score));
  const radius = size / 2 - 12;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const tone = toneForScore(clamped);

  return (
    <div
      className={cn(
        'inline-flex flex-col items-center justify-center',
        className
      )}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={10}
            className="stroke-border"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className={cn('transition-[stroke-dashoffset] duration-700', tone)}
            stroke="currentColor"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-display font-bold tabular-nums', tone)} style={{ fontSize: size / 4 }}>
            {Math.round(clamped)}
          </span>
          <span className="text-xs text-muted-foreground">
            {t('mockExam.result.scoreOutOf')}
          </span>
        </div>
      </div>
      {label && (
        <p className="mt-2 text-sm text-muted-foreground text-center">{label}</p>
      )}
    </div>
  );
};

export default ScoreGauge;
