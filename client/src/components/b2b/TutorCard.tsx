import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock } from 'lucide-react';
import type { Tutor } from '../../types/b2b';
import { RatingStars } from './RatingStars';
import { PriceTag } from './PriceTag';
import { CompatibilityScore } from './CompatibilityScore';
import { cn } from '../../lib/utils';

interface Props {
  tutor: Tutor;
  score?: number;
  reasons?: string[];
  className?: string;
}

export const TutorCard: React.FC<Props> = ({
  tutor,
  score,
  reasons,
  className,
}) => {
  const topSubject = tutor.specializations[0]?.subject ?? '—';
  const extraCount = Math.max(0, tutor.specializations.length - 1);

  return (
    <Link
      to={`/tutors/${tutor.id}`}
      className={cn(
        'block rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/40 hover:bg-primary/5',
        className
      )}
    >
      <div className="flex items-start gap-3 justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-display font-semibold text-base text-foreground line-clamp-1">
            {topSubject}
            {extraCount > 0 && (
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                +{extraCount} konu
              </span>
            )}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {tutor.bio}
          </p>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <RatingStars rating={tutor.rating} size="sm" />
            <span className="inline-flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {tutor.totalSessions} ders
            </span>
            {tutor.availability.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {tutor.availability.length} saat bandı
              </span>
            )}
          </div>
        </div>
        <PriceTag
          priceTl={tutor.hourlyRate}
          hint="saatlik"
          size="sm"
        />
      </div>
      {typeof score === 'number' && (
        <div className="mt-3">
          <CompatibilityScore score={score} reasons={reasons} />
        </div>
      )}
    </Link>
  );
};

export default TutorCard;
