import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Coins } from 'lucide-react';

import { creditService } from '../services/creditService';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export const creditKeys = {
  balance: () => ['credits', 'balance'] as const,
  history: (limit: number, offset: number) =>
    ['credits', 'history', limit, offset] as const,
};

interface CreditBadgeProps {
  className?: string;
}

export const CreditBadge = ({ className }: CreditBadgeProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const enabled = Boolean(user);
  const q = useQuery({
    queryKey: creditKeys.balance(),
    queryFn: () => creditService.getBalance(),
    enabled,
    staleTime: 30_000,
  });

  if (!enabled) return null;

  const balance = q.data?.balance ?? 0;

  return (
    <Link
      to="/credits"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 text-xs font-medium hover:bg-primary/15 transition-colors',
        className
      )}
      aria-label={t('community.credit.badgeAria', { balance })}
    >
      <Coins className="w-3.5 h-3.5" strokeWidth={2.2} />
      <span className="tabular-nums">
        {q.isLoading ? '—' : balance}
      </span>
    </Link>
  );
};

export default CreditBadge;
