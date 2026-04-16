import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Building2,
  BookOpen,
  Star,
  Scale,
  AlertCircle,
  ChevronLeft,
  ChevronDown,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AnalysisCard from '../components/AnalysisCard';
import RatingForm from '../components/RatingForm';
import ProfAvatar from '../components/Avatar';
import StyleHero, { StyleHeroSkeleton } from '../components/StyleHero';
import MetricsCards, { MetricsCardsSkeleton } from '../components/MetricsCards';
import EvolutionChart, { EvolutionChartSkeleton } from '../components/EvolutionChart';
import TopicBadges, { TopicBadgesSkeleton } from '../components/TopicBadges';
import {
  professorService,
  type StyleProfileResponse,
} from '../services/professorService';
import { ratingService } from '../services/ratingService';
import { Professor, ExamAnalysis, ProfessorRating, Course } from '../types';
import { cn } from '../lib/utils';

const ProfessorDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [analyses, setAnalyses] = useState<ExamAnalysis[]>([]);
  const [ratings, setRatings] = useState<ProfessorRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [styleProfile, setStyleProfile] = useState<StyleProfileResponse | null>(
    null
  );
  const [styleLoading, setStyleLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const [prof, anal, rats] = await Promise.allSettled([
          professorService.getById(id),
          professorService.getAnalysis(id),
          ratingService.getByProfessor(id),
        ]);
        if (prof.status === 'fulfilled') setProfessor(prof.value);
        else setError(t('common.error'));
        if (anal.status === 'fulfilled') setAnalyses(anal.value);
        if (rats.status === 'fulfilled') setRatings(rats.value);
      } catch {
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, t]);

  // Style profile loads independently so a cold Gemini rebuild doesn't
  // block the hero + ratings on the rest of the page.
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setStyleLoading(true);
    professorService
      .getStyleProfile(id)
      .then((data) => {
        if (!cancelled) setStyleProfile(data);
      })
      .catch(() => {
        if (!cancelled) setStyleProfile(null);
      })
      .finally(() => {
        if (!cancelled) setStyleLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleRatingSubmit = async (data: {
    difficulty: number;
    fairness: number;
    comment: string;
  }) => {
    if (!id) return;
    await ratingService.create({
      professorId: id,
      difficultyScore: data.difficulty,
      fairnessScore: data.fairness,
      comment: data.comment,
    });
    const updated = await ratingService.getByProfessor(id);
    setRatings(updated);
  };

  const avgDifficulty =
    ratings.length > 0
      ? ratings.reduce((s, r) => s + r.difficultyScore, 0) / ratings.length
      : 0;
  const avgFairness =
    ratings.length > 0
      ? ratings.reduce((s, r) => s + r.fairnessScore, 0) / ratings.length
      : 0;

  const courses: Course[] = professor?.courses || [];

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="card-base p-6 sm:p-8 animate-pulse">
          <div className="flex gap-6">
            <div className="w-20 h-20 rounded-2xl bg-secondary" />
            <div className="flex-1 space-y-3">
              <div className="h-8 w-1/2 bg-secondary rounded" />
              <div className="h-4 w-1/3 bg-secondary rounded" />
              <div className="h-3 w-1/4 bg-secondary rounded" />
            </div>
          </div>
        </div>
        <MetricsCardsSkeleton />
        <StyleHeroSkeleton />
      </div>
    );
  }

  if (error || !professor) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="card-base p-12 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-destructive/10 text-destructive mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <p className="text-foreground font-medium">{error || t('common.error')}</p>
          <Link to="/professors" className="btn-secondary mt-4 inline-flex">
            {t('common.back')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back link */}
      <Link
        to="/professors"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        {t('professor.detail.backToList')}
      </Link>

      {/* Identity hero — slim, no stats (metrics come from the style profile block) */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card-base p-6 sm:p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/[0.05] rounded-full blur-[80px] -z-10" />
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <ProfAvatar name={professor.name} size={80} variant="beam" />
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {professor.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                {professor.department}
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                {professor.university}
              </span>
            </div>
            {ratings.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <Pill color="warning" icon={Star}>
                  {avgDifficulty.toFixed(1)}/5 ·{' '}
                  <span className="text-muted-foreground font-normal">
                    {t('professors.detail.averageDifficulty').toLowerCase()}
                  </span>
                </Pill>
                <Pill color="success" icon={Scale}>
                  {avgFairness.toFixed(1)}/5 ·{' '}
                  <span className="text-muted-foreground font-normal">
                    {t('professors.detail.averageFairness').toLowerCase()}
                  </span>
                </Pill>
                <span className="text-xs text-muted-foreground">
                  · {t('professors.detail.ratingsCount', { count: ratings.length })}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Style Profile — the main event */}
      {styleLoading && (
        <section className="space-y-4">
          <MetricsCardsSkeleton />
          <StyleHeroSkeleton />
          <TopicBadgesSkeleton />
          <EvolutionChartSkeleton />
        </section>
      )}

      {!styleLoading && styleProfile?.status === 'ready' && (
        <section className="space-y-4">
          <MetricsCards metrics={styleProfile.profile.metrics} />
          <StyleHero profile={styleProfile.profile} />
          <TopicBadges topics={styleProfile.profile.topTopics} />
          <EvolutionChart evolution={styleProfile.profile.evolution} />
        </section>
      )}

      {!styleLoading && styleProfile?.status === 'insufficient_data' && (
        <section className="card-base p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-foreground mb-1">
                {t('professor.style.insufficientTitle')}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('professor.style.insufficientBody', {
                  count: styleProfile.examSourceCount,
                  min: styleProfile.minRequired,
                })}
              </p>
              {isAuthenticated && (
                <Link
                  to="/upload"
                  className="btn-primary mt-4 inline-flex text-sm"
                >
                  {t('professor.detail.contributeExam')}
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Courses — compact reference */}
      {courses.length > 0 && (
        <section>
          <h2 className="section-title mb-3 text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-muted-foreground" />
            {t('professor.detail.coursesTitle', { count: courses.length })}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="card-base p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center font-mono text-xs font-semibold shrink-0">
                  {course.code.slice(0, 4)}
                </div>
                <div className="min-w-0">
                  <p className="text-foreground font-medium truncate">
                    {course.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{course.code}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Per-exam analyses — collapsed by default, detail view for power users */}
      {analyses.length > 0 && (
        <section>
          <details className="group card-base overflow-hidden">
            <summary className="list-none cursor-pointer p-5 sm:p-6 flex items-center gap-3 select-none hover:bg-secondary/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display font-semibold text-foreground">
                  {t('professor.detail.perExamTitle')}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {t('professor.detail.perExamHint', { count: analyses.length })}
                </p>
              </div>
              <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <div className="border-t border-border p-5 sm:p-6 space-y-5">
              {analyses.map((a, i) => (
                <AnalysisCard key={a.id} analysis={a} index={i} />
              ))}
            </div>
          </details>
        </section>
      )}

      {/* Rating form */}
      {isAuthenticated ? (
        <section>
          <RatingForm onSubmit={handleRatingSubmit} />
        </section>
      ) : (
        <div className="card-base p-5 text-center">
          <p className="text-sm text-muted-foreground">
            <Link to="/login" className="text-primary font-medium hover:opacity-80">
              {t('rating.loginRequired')}
            </Link>
          </p>
        </div>
      )}

      {/* Student ratings */}
      {ratings.length > 0 && (
        <section>
          <h2 className="section-title mb-4 text-lg">
            {t('professors.detail.ratingsTitle')}{' '}
            <span className="text-muted-foreground font-normal text-base">
              ({ratings.length})
            </span>
          </h2>
          <div className="space-y-3">
            {ratings.map((rating, i) => (
              <motion.div
                key={rating.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="card-base p-5"
              >
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <ProfAvatar
                    name={rating.user?.name || 'A'}
                    size={28}
                    variant="beam"
                  />
                  <span className="text-sm font-medium text-foreground">
                    {rating.user?.name || 'Anonymous'}
                  </span>
                  <Pill color="warning" icon={Star}>
                    {rating.difficultyScore}/5
                  </Pill>
                  <Pill color="success" icon={Scale}>
                    {rating.fairnessScore}/5
                  </Pill>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {rating.comment && (
                  <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                    {rating.comment}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

interface PillProps {
  color: 'warning' | 'success' | 'primary';
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

const Pill: React.FC<PillProps> = ({ color, icon: Icon, children }) => {
  const colors = {
    warning: 'bg-warning/10 text-warning',
    success: 'bg-success/10 text-success',
    primary: 'bg-primary/10 text-primary',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        colors[color]
      )}
    >
      <Icon className="w-3 h-3" />
      {children}
    </span>
  );
};

export default ProfessorDetailPage;
