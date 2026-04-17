import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md';
  className?: string;
}

export const VerifiedBadge = ({ size = 'sm', className }: VerifiedBadgeProps) => {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-success/10 text-success border border-success/30 font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        className
      )}
      title={t('community.verifiedBadge.tooltip')}
    >
      <ShieldCheck
        className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'}
        strokeWidth={2.2}
      />
      {t('community.verifiedBadge.label')}
    </span>
  );
};

export default VerifiedBadge;
