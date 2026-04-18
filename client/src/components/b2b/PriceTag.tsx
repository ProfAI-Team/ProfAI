import React from 'react';
import { cn } from '../../lib/utils';

interface Props {
  priceTl: number;
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Canonical price display for Phase 7 marketplace + tutoring cards.
 * Formats as "₺250" in TR locale. `hint` renders under the price —
 * used for "saatlik", "ders başına" etc.
 */
export const PriceTag: React.FC<Props> = ({
  priceTl,
  hint,
  size = 'md',
  className,
}) => {
  const formatted = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(priceTl);

  return (
    <div
      className={cn(
        'inline-flex flex-col items-end leading-tight',
        className
      )}
    >
      <span
        className={cn(
          'font-display font-semibold text-foreground',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-lg',
          size === 'lg' && 'text-2xl'
        )}
      >
        {formatted}
      </span>
      {hint && (
        <span className="text-xs text-muted-foreground">{hint}</span>
      )}
    </div>
  );
};

export default PriceTag;
