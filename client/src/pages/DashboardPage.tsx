import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Upload, Star, BarChart3, FileText, ArrowRight, Inbox, Gauge,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProfAvatar from '../components/Avatar';
import { examService } from '../services/examService';
import { Exam } from '../types';
import { cn } from '../lib/utils';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    examService
      .getMine()
      .then(setExams)
      .catch(() => setExams([]))
      .finally(() => setLoading(false));
  }, []);

  const totalUploads = exams.length;
  const totalAnalyses = exams.filter((e) => e.analysis).length;
  const avgDifficulty =
    exams.length > 0
      ? exams.filter((e) => e.analysis).reduce((s, e) => s + (e.analysis?.difficultyScore || 0), 0) /
        Math.max(1, totalAnalyses)
      : 0;

  const stats = [
    { key: 'totalUploads', label: t('dashboard.totalUploads'), value: String(totalUploads), icon: Upload, color: 'text-chart-1', bg: 'bg-chart-1/10' },
    { key: 'analyses', label: 'Analiz tamamlandı', value: String(totalAnalyses), icon: BarChart3, color: 'text-chart-3', bg: 'bg-chart-3/10' },
    { key: 'avgDifficulty', label: 'Ortalama zorluk', value: avgDifficulty > 0 ? `${avgDifficulty.toFixed(1)}/10` : '—', icon: Gauge, color: 'text-warning', bg: 'bg-warning/10' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-4 mb-8"
      >
        {user && <ProfAvatar name={user.name} size={56} variant="beam" />}
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {t('dashboard.welcome', { name: user?.name?.split(' ')[0] || '' })}
          </h1>
          <p className="text-muted-foreground mt-1">{t('dashboard.subtitle')}</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.key} className="card-base p-5 flex items-center gap-4">
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', stat.bg)}>
                <Icon className={cn('w-6 h-6', stat.color)} />
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Uploads */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title flex items-center gap-2">
            <FileText className="w-5 h-5 text-muted-foreground" />
            {t('dashboard.recentUploads')}
          </h2>
          <Link
            to="/upload"
            className="text-sm font-medium text-primary hover:opacity-80 flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4" />
            Yeni yükleme
          </Link>
        </div>

        {loading ? (
          <div className="card-base p-12 text-center">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          </div>
        ) : exams.length === 0 ? (
          <div className="card-base p-12 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary text-muted-foreground mb-3">
              <Inbox className="w-7 h-7" />
            </div>
            <p className="text-foreground font-medium mb-1">{t('dashboard.empty')}</p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:opacity-80 mt-2"
            >
              {t('dashboard.emptyCta')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {exams.map((exam, i) => (
              <ExamRow key={exam.id} exam={exam} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const ExamRow: React.FC<{ exam: Exam; index: number }> = ({ exam, index }) => {
  const a = exam.analysis;
  const c = exam.course;
  const prof = c?.professor;

  const examTypeLabel: Record<string, string> = {
    MIDTERM: 'Vize',
    FINAL: 'Final',
    MAKEUP: 'Bütünleme',
  };

  const diffColor = a
    ? a.difficultyScore < 4 ? 'text-success bg-success/10'
      : a.difficultyScore <= 7 ? 'text-warning bg-warning/10'
      : 'text-destructive bg-destructive/10'
    : 'text-muted-foreground bg-secondary';

  const date = new Date(exam.createdAt).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    prof ? (
      <Link to={`/professors/${prof.id}`} className="block">
        {children}
      </Link>
    ) : (
      <div>{children}</div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Wrapper>
        <div className="card-interactive p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-secondary text-foreground">
                {c?.code}
              </span>
              <p className="font-medium text-foreground truncate">{c?.name}</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
              {prof && <span>{prof.name}</span>}
              <span>·</span>
              <span>{examTypeLabel[exam.examType] || exam.examType} · {exam.semester} {exam.year}</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {date}
              </span>
            </div>
          </div>

          {a ? (
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Soru</div>
                <div className="text-sm font-semibold text-foreground tabular-nums">
                  {a.questionCount}
                </div>
              </div>
              <span className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', diffColor)}>
                <Gauge className="w-3 h-3" />
                {a.difficultyScore.toFixed(1)}
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Analiz yok</span>
          )}

          {prof && (
            <ArrowRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
          )}
        </div>
      </Wrapper>
    </motion.div>
  );
};

export default DashboardPage;
