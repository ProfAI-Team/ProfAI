import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  rating: number | null;
  sampleSize?: number;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Star rating display. Rounds to nearest half-star visually but keeps
 * the numeric label precise ("4.6 · 23 değerlendirme").
 */
export const RatingStars: React.FC<Props> = ({
  rating,
  sampleSize,
  size = 'md',
  className,
}) => {
  if (rating === null) {
    return (
      <span
        className={cn(
          'text-xs text-muted-foreground',
          size === 'md' && 'text-sm',
          className
        )}
      >
        Henüz puan yok
      </span>
    );
  }

  const rounded = Math.round(rating * 2) / 2;
  const stars = [1, 2, 3, 4, 5].map((value) => {
    const filled = rounded >= value;
    const half = !filled && rounded + 0.5 >= value;
    return (
      <Star
        key={value}
        className={cn(
          size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4',
          filled || half ? 'text-amber-400' : 'text-muted-foreground/40',
          filled && 'fill-amber-400',
          half && 'fill-amber-400/50'
        )}
      />
    );
  });

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">{stars}</div>
      <span
        className={cn(
          'font-medium text-foreground',
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}
      >
        {rating.toFixed(1)}
      </span>
      {typeof sampleSize === 'number' && (
        <span className="text-xs text-muted-foreground">
          · {sampleSize}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
