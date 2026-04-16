import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { GraduationCap, Building2, Star, BookOpen, ArrowUpRight } from 'lucide-react';
import ProfAvatar from './Avatar';
import { Professor } from '../types';
import { cn } from '../lib/utils';

interface Props {
  professor: Professor;
  index?: number;
}

const ProfessorCard: React.FC<Props> = ({ professor, index = 0 }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const courseCount = professor._count?.courses ?? professor.courses?.length ?? 0;
  const ratingCount = professor._count?.ratings ?? professor.totalRatings ?? 0;
  const avgDifficulty = professor.averageDifficulty;

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      whileHover={{ y: -3 }}
      onClick={() => navigate(`/professors/${professor.id}`)}
      className={cn(
        'group relative w-full text-left',
        'card-interactive p-5',
        'flex flex-col gap-4'
      )}
    >
      {/* Top row: avatar + arrow */}
      <div className="flex items-start justify-between">
        <ProfAvatar name={professor.name} size={48} variant="beam" />
        <span
          className={cn(
            'h-8 w-8 rounded-lg flex items-center justify-center',
            'text-muted-foreground group-hover:text-primary group-hover:bg-primary-soft',
            'transition-colors'
          )}
        >
          <ArrowUpRight className="w-4 h-4" />
        </span>
      </div>

      {/* Name + dept */}
      <div className="space-y-1">
        <h3 className="text-base font-display font-semibold text-foreground leading-snug">
          {professor.name}
        </h3>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <GraduationCap className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{professor.department}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Building2 className="w-3 h-3 shrink-0" />
          <span className="truncate">{professor.university}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <BookOpen className="w-3.5 h-3.5" />
          <span className="font-medium text-foreground">{courseCount}</span>
          <span>{t(courseCount === 1 ? 'professors.card.courses' : 'professors.card.courses_other', { count: courseCount })}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Star className="w-3.5 h-3.5 text-warning fill-warning/30" />
          {ratingCount > 0 ? (
            <>
              <span className="font-medium text-foreground">
                {avgDifficulty != null ? avgDifficulty.toFixed(1) : ratingCount}
              </span>
              <span>{t('professors.card.ratings', { count: ratingCount })}</span>
            </>
          ) : (
            <span>{t('professors.card.noRatings')}</span>
          )}
        </div>
      </div>
    </motion.button>
  );
};

export default ProfessorCard;
