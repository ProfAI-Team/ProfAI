import React from 'react';
import { Users } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  used: number;
  total: number;
  className?: string;
}

export const SeatCounter: React.FC<Props> = ({ used, total, className }) => {
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;
  const almostFull = pct >= 90;
  const full = used >= total;

  return (
    <div className={cn('rounded-xl border border-border bg-surface p-4', className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-primary" />
          <span className="font-medium text-foreground">Kullanılan koltuk</span>
        </div>
        <div className="text-sm font-display font-semibold">
          {used} / {total}
        </div>
      </div>
      <div className="mt-3 h-1.5 w-full rounded-full bg-border/60 overflow-hidden">
        <div
          className={cn(
            'h-full transition-all',
            full
              ? 'bg-red-500'
              : almostFull
              ? 'bg-amber-500'
              : 'bg-primary'
          )}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      {full && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-300">
          Koltuk doldu — yeni öğrenci eklemek için planınızı yükseltin.
        </p>
      )}
      {almostFull && !full && (
        <p className="mt-2 text-xs text-amber-600 dark:text-amber-300">
          Kapasitenin %90'ı kullanıldı. Planı yükseltmeyi değerlendirebilirsin.
        </p>
      )}
    </div>
  );
};

export default SeatCounter;
