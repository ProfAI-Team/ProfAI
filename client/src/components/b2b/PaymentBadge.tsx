import React from 'react';
import { CheckCircle, Clock, XCircle, RotateCcw, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { PaymentStatus } from '../../types/b2b';

interface Props {
  status: PaymentStatus;
  className?: string;
}

const CONFIG: Record<
  PaymentStatus,
  { label: string; icon: React.ComponentType<{ className?: string }>; tone: string }
> = {
  pending: {
    label: 'Bekliyor',
    icon: Clock,
    tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20',
  },
  succeeded: {
    label: 'Başarılı',
    icon: CheckCircle,
    tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
  },
  failed: {
    label: 'Başarısız',
    icon: XCircle,
    tone: 'bg-red-500/10 text-red-600 dark:text-red-300 border-red-500/20',
  },
  refunded: {
    label: 'İade edildi',
    icon: RotateCcw,
    tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/20',
  },
  disputed: {
    label: 'İtirazlı',
    icon: AlertCircle,
    tone: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20',
  },
};

export const PaymentBadge: React.FC<Props> = ({ status, className }) => {
  const cfg = CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        cfg.tone,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
};

export default PaymentBadge;
