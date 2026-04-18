import React from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  status: 'pending' | 'approved' | 'rejected';
  className?: string;
}

/**
 * Banner used on marketplace + tutor profile pages to communicate the
 * approval state. "Pending" tone leans calm/informational — moderation
 * is a normal part of the flow, not a failure.
 */
export const ApprovalBanner: React.FC<Props> = ({ status, className }) => {
  if (status === 'approved') {
    return (
      <div
        className={cn(
          'rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-200 flex items-center gap-2',
          className
        )}
      >
        <CheckCircle2 className="w-4 h-4" />
        Onaylandı ve yayında.
      </div>
    );
  }
  if (status === 'rejected') {
    return (
      <div
        className={cn(
          'rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-200 flex items-center gap-2',
          className
        )}
      >
        <XCircle className="w-4 h-4" />
        Reddedildi. Moderasyondan geri bildirim geldi — düzenleyip tekrar gönderebilirsin.
      </div>
    );
  }
  return (
    <div
      className={cn(
        'rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-200 flex items-start gap-2',
        className
      )}
    >
      <Clock className="w-4 h-4 mt-0.5 shrink-0" />
      <div>
        <p className="font-medium">Moderasyondayız.</p>
        <p className="text-xs opacity-80">
          Genellikle 24 saat içinde sonuç alırsın. Onay gelene kadar liste görünmez.
        </p>
      </div>
    </div>
  );
};

export default ApprovalBanner;
