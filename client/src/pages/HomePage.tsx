import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Upload,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Users,
  FileText,
  GraduationCap,
} from 'lucide-react';
import SearchBar from '../components/SearchBar';
import ProfessorCard from '../components/ProfessorCard';
import { professorService } from '../services/professorService';
import { Professor } from '../types';
import { cn } from '../lib/utils';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await professorService.getAll();
        if (!cancelled) setProfessors(data.slice(0, 6));
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      if (query.trim()) navigate(`/professors?search=${encodeURIComponent(query)}`);
    },
    [navigate]
  );

  const stats = [
    { key: 'professors', value: '150+', icon: Users, color: 'text-chart-1', bg: 'bg-chart-1/10' },
    { key: 'exams', value: '1,200+', icon: FileText, color: 'text-chart-3', bg: 'bg-chart-3/10' },
    { key: 'students', value: '800+', icon: GraduationCap, color: 'text-chart-2', bg: 'bg-chart-2/10' },
  ];

  const steps = [
    { key: 'step1', icon: Upload, color: 'bg-chart-1' },
    { key: 'step2', icon: Sparkles, color: 'bg-chart-5' },
    { key: 'step3', icon: TrendingUp, color: 'bg-chart-3' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Decorative gradient blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-20 w-[36rem] h-[36rem] bg-primary/[0.08] dark:bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute -top-20 -right-32 w-[32rem] h-[32rem] bg-chart-2/[0.08] dark:bg-chart-2/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-6 border border-primary/15"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t('home.hero.badge')}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.05] mb-6"
          >
            {t('home.hero.title1')}
            <br />
            <span className="text-gradient">{t('home.hero.title2')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            {t('home.hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex justify-center mb-6"
          >
            <SearchBar
              size="lg"
              placeholder={t('home.hero.searchPlaceholder')}
              onSearch={handleSearch}
            />
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/upload" className="btn-primary">
              <Upload className="w-4 h-4" />
              {t('home.hero.ctaPrimary')}
            </Link>
            <Link to="/professors" className="btn-secondary">
              {t('home.hero.ctaSecondary')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.key}
                className="card-base p-5 flex items-center gap-4"
              >
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', stat.bg)}>
                  <Icon className={cn('w-6 h-6', stat.color)} />
                </div>
                <div>
                  <div className="text-2xl font-display font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t(`home.stats.${stat.key}`)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="section-title text-3xl sm:text-4xl mb-3">
            {t('home.howItWorks.title')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t('home.howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.key}
                className="card-base p-6 relative"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={cn('w-11 h-11 rounded-xl text-white flex items-center justify-center', step.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-muted-foreground/60">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-foreground text-lg mb-1.5">
                  {t(`home.howItWorks.${step.key}Title`)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`home.howItWorks.${step.key}Desc`)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Popular Professors */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-title">{t('home.popular.title')}</h2>
          <Link
            to="/professors"
            className="text-sm font-medium text-primary hover:opacity-80 transition-opacity flex items-center gap-1.5"
          >
            {t('home.popular.viewAll')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-base p-5 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-secondary rounded-full" />
                  <div className="w-8 h-8 bg-secondary rounded-lg" />
                </div>
                <div className="h-5 bg-secondary rounded w-3/4 mb-2" />
                <div className="h-4 bg-secondary rounded w-1/2 mb-1" />
                <div className="h-3 bg-secondary rounded w-1/3 mt-4 pt-3" />
              </div>
            ))}
          </div>
        ) : professors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {professors.map((prof, i) => (
              <ProfessorCard key={prof.id} professor={prof} index={i} />
            ))}
          </div>
        ) : (
          <div className="card-base p-12 text-center">
            <p className="text-muted-foreground">{t('home.empty')}</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
