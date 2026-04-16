import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, ChevronDown, Sparkles, ArrowRight, Gauge, ListChecks,
  BookMarked, FileText,
} from 'lucide-react';
import FileUpload, { UploadFile } from '../components/FileUpload';
import CourseCombobox from '../components/CourseCombobox';
import { examService } from '../services/examService';
import { useAuth } from '../context/AuthContext';
import { Course, Exam } from '../types';
import { cn } from '../lib/utils';

interface UploadResult {
  fileName: string;
  exam: Exam;
}

const UploadPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [examType, setExamType] = useState<'MIDTERM' | 'FINAL' | 'MAKEUP'>('MIDTERM');
  const [year, setYear] = useState(new Date().getFullYear());
  const [semester, setSemester] = useState('Fall');
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);

  const counts = useMemo(() => ({
    total: files.length,
    pending: files.filter((f) => f.status === 'pending').length,
    success: files.filter((f) => f.status === 'success').length,
    error: files.filter((f) => f.status === 'error').length,
  }), [files]);

  const updateFileStatus = (id: string, patch: Partial<UploadFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || files.length === 0 || submitting) return;

    setSubmitting(true);
    const pending = files.filter((f) => f.status === 'pending' || f.status === 'error');

    await Promise.all(
      pending.map(async (uf) => {
        updateFileStatus(uf.id, { status: 'uploading', errorMessage: undefined });
        try {
          const exam = await examService.upload({
            courseId: selectedCourse.id,
            examType,
            year,
            semester,
            file: uf.file,
          });
          updateFileStatus(uf.id, { status: 'success', examId: exam.id });
          setResults((prev) => [...prev, { fileName: uf.file.name, exam }]);
        } catch (err: any) {
          updateFileStatus(uf.id, {
            status: 'error',
            errorMessage: err.response?.data?.message || 'Yükleme başarısız.',
          });
        }
      })
    );

    setSubmitting(false);
  };

  const startNewBatch = () => {
    setFiles([]);
    setResults([]);
    setSelectedCourse(null);
  };

  const SelectField: React.FC<{
    label: string;
    value: string;
    onChange: (v: string) => void;
    children: React.ReactNode;
  }> = ({ label, value, onChange, children }) => (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full input-field appearance-none pr-10"
          disabled={submitting}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  );

  const buttonLabel = () => {
    if (submitting) return 'Analiz ediliyor…';
    const toUpload = counts.pending + counts.error;
    if (toUpload === 0 && counts.success > 0) return 'Tümü tamamlandı';
    if (toUpload === 0) return t('upload.submit');
    return `${toUpload} dosyayı yükle ve analiz et`;
  };

  const allDone = counts.total > 0 && counts.pending === 0 && counts.error === 0;
  const canSubmit = !submitting && !!selectedCourse && (counts.pending + counts.error) > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          AI analysis
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {t('upload.title')}
        </h1>
        <p className="text-muted-foreground mt-2">{t('upload.subtitle')}</p>
      </motion.div>

      {/* Upload form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card-base p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('upload.selectCourse')}
            </label>
            <CourseCombobox
              value={selectedCourse}
              onChange={setSelectedCourse}
              defaultUniversity={user?.university || undefined}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SelectField label={t('upload.examType')} value={examType} onChange={(v) => setExamType(v as any)}>
              {(['MIDTERM', 'FINAL', 'MAKEUP'] as const).map((tp) => (
                <option key={tp} value={tp}>{t(`upload.examTypes.${tp}`)}</option>
              ))}
            </SelectField>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('upload.year')}</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={2000}
                max={2030}
                className="input-field"
                disabled={submitting}
              />
            </div>

            <SelectField label={t('upload.semester')} value={semester} onChange={setSemester}>
              {(['Fall', 'Spring', 'Summer'] as const).map((s) => (
                <option key={s} value={s}>{t(`upload.semesters.${s.toLowerCase()}`)}</option>
              ))}
            </SelectField>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('upload.fileLabel')}
            </label>
            <FileUpload files={files} onChange={setFiles} disabled={submitting} />
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className={cn('btn-primary w-full py-3.5 text-base', !canSubmit && 'opacity-50 pointer-events-none')}
        >
          {submitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              {buttonLabel()}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              {buttonLabel()}
            </>
          )}
        </button>
      </form>

      {/* Post-upload results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-10"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Analiz tamamlandı
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {results.length} sınav AI tarafından çözümlendi. İncelemek için tıkla.
                </p>
              </div>
              {allDone && (
                <button onClick={startNewBatch} className="btn-secondary text-sm">
                  Yeni yükleme
                </button>
              )}
            </div>

            <div className="space-y-3">
              {results.map((r, i) => (
                <ResultCard key={r.exam.id} result={r} course={selectedCourse} index={i} />
              ))}
            </div>

            <div className="card-base p-5 mt-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-foreground">Bu hocanın tüm sınavları</p>
                <p className="text-sm text-muted-foreground">
                  Toplu analizini gör — soru tipi trendi, ağırlıklı konular, zorluk dağılımı
                </p>
              </div>
              {selectedCourse?.professor && (
                <Link
                  to={`/professors/${selectedCourse.professor.id}`}
                  className="btn-primary shrink-0"
                >
                  Hocayı incele
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ResultCard: React.FC<{
  result: UploadResult;
  course: Course | null;
  index: number;
}> = ({ result, course, index }) => {
  const a = result.exam.analysis;
  if (!a) return null;

  // a.questionTypes is Record<string, number>
  const types = Object.entries(a.questionTypes || {});
  const dominantType =
    types.length > 0
      ? types.sort((x, y) => (y[1] as number) - (x[1] as number))[0]
      : null;

  // a.topicDistribution is Record<string, number>
  const topics = Object.entries(a.topicDistribution || {})
    .sort((x, y) => (y[1] as number) - (x[1] as number))
    .slice(0, 3);

  const diffColor =
    a.difficultyScore < 4 ? 'text-success bg-success/10'
      : a.difficultyScore <= 7 ? 'text-warning bg-warning/10'
      : 'text-destructive bg-destructive/10';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card-base p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{result.fileName}</p>
            {course && (
              <p className="text-xs text-muted-foreground truncate">
                {course.code} · {course.name}
              </p>
            )}
          </div>
        </div>
        <span className={cn('flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium shrink-0', diffColor)}>
          <Gauge className="w-3 h-3" />
          {a.difficultyScore.toFixed(1)}/10
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <Stat icon={ListChecks} label="Soru" value={String(a.questionCount)} />
        <Stat
          icon={ListChecks}
          label="Baskın tip"
          value={dominantType ? `${translateType(dominantType[0])} %${dominantType[1]}` : '—'}
        />
        <Stat
          icon={BookMarked}
          label="Ana konu"
          value={topics[0] ? topics[0][0] : '—'}
        />
      </div>

      {a.summary && (
        <p className="text-sm text-muted-foreground leading-relaxed mt-4 pt-4 border-t border-border">
          {a.summary}
        </p>
      )}

      {topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {topics.map(([topic, pct]) => (
            <span
              key={topic}
              className="text-xs px-2 py-0.5 rounded-full bg-secondary text-foreground"
            >
              {topic} · %{pct as number}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
};

const Stat: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}> = ({ icon: Icon, label, value }) => (
  <div className="rounded-lg bg-secondary/50 p-3">
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
      <Icon className="w-3 h-3" />
      {label}
    </div>
    <p className="text-sm font-medium text-foreground truncate">{value}</p>
  </div>
);

function translateType(raw: string): string {
  if (raw === 'Multiple Choice') return 'Çoktan seçmeli';
  if (raw === 'Classic/Open-ended') return 'Klasik';
  if (raw === 'True/False') return 'Doğru/Yanlış';
  return raw;
}

export default UploadPage;
