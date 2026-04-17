import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Pause, Play } from 'lucide-react';
import { cn } from '../lib/utils';

export type TimerWarningLevel = 'calm' | 'warning' | 'critical';

export interface TimerProps {
  remainingSec: number;
  totalSec: number;
  state: 'running' | 'paused' | 'idle' | 'expired';
  onPause?: () => void;
  onResume?: () => void;
  className?: string;
}

function formatMMSS(totalSec: number): string {
  const clamped = Math.max(0, Math.floor(totalSec));
  const mm = Math.floor(clamped / 60);
  const ss = clamped % 60;
  return `${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
}

function warningLevel(remaining: number): TimerWarningLevel {
  if (remaining <= 60) return 'critical';
  if (remaining <= 300) return 'warning';
  return 'calm';
}

export const Timer: React.FC<TimerProps> = ({
  remainingSec,
  totalSec,
  state,
  onPause,
  onResume,
  className,
}) => {
  const { t } = useTranslation();
  const level = warningLevel(remainingSec);
  const progress = totalSec > 0 ? Math.min(1, remainingSec / totalSec) : 0;

  const tone =
    level === 'critical'
      ? 'bg-red-500/10 border-red-500/50 text-red-600 dark:text-red-400'
      : level === 'warning'
        ? 'bg-amber-500/10 border-amber-500/50 text-amber-700 dark:text-amber-400'
        : 'bg-surface border-border text-foreground';

  const barTone =
    level === 'critical'
      ? 'bg-red-500'
      : level === 'warning'
        ? 'bg-amber-500'
        : 'bg-primary';

  return (
    <div
      role="timer"
      aria-live={level === 'critical' ? 'assertive' : 'polite'}
      aria-label={t('mockExam.session.timer.ariaLabel', {
        time: formatMMSS(remainingSec),
      })}
      className={cn(
        'flex items-center gap-3 rounded-lg border px-4 py-2 transition-colors',
        tone,
        className
      )}
    >
      <Clock
        className={cn(
          'h-5 w-5 shrink-0',
          level === 'critical' && 'animate-pulse'
        )}
      />
      <div className="flex flex-col min-w-[120px]">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-xl font-semibold tabular-nums">
            {formatMMSS(remainingSec)}
          </span>
          {state === 'paused' && (
            <span className="text-xs uppercase tracking-wide opacity-70">
              {t('mockExam.session.timer.paused')}
            </span>
          )}
        </div>
        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
          <div
            className={cn('h-full transition-all duration-500', barTone)}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
      {state === 'running' && onPause && (
        <button
          type="button"
          onClick={onPause}
          className="rounded-md p-1.5 hover:bg-black/5 dark:hover:bg-white/10"
          aria-label={t('mockExam.session.timer.pause')}
        >
          <Pause className="h-4 w-4" />
        </button>
      )}
      {state === 'paused' && onResume && (
        <button
          type="button"
          onClick={onResume}
          className="rounded-md p-1.5 hover:bg-black/5 dark:hover:bg-white/10"
          aria-label={t('mockExam.session.timer.resume')}
        >
          <Play className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default Timer;
