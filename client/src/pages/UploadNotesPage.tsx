import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Wand2,
  FileWarning,
} from 'lucide-react';
import FileUpload, { UploadFile } from '../components/FileUpload';
import CourseCombobox from '../components/CourseCombobox';
import { useAuth } from '../context/AuthContext';
import { Course } from '../types';
import { noteService } from '../services/noteService';
import { studyPackService } from '../services/studyPackService';
import type {
  NoteUploadResponse,
  UploadedNote,
} from '../types/studyPack';
import { cn } from '../lib/utils';

type GenerationStep = 'idle' | 'uploading' | 'generating' | 'error';

const NOTE_ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
const NOTE_ACCEPTED_EXTENSIONS = '.pdf,.docx,.txt';

const UploadNotesPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [step, setStep] = useState<GenerationStep>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<NoteUploadResponse | null>(null);

  const professorId = selectedCourse?.professor?.id ?? null;

  const canSubmit = useMemo(
    () => selectedCourse !== null && files.length > 0 && step === 'idle',
    [selectedCourse, files.length, step]
  );

  const shortNotes = uploadResult?.notes.filter(
    (n) => n.warning === 'insufficient_content'
  ) ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !professorId) {
      setErrorMessage(t('uploadNotes.noCourse'));
      return;
    }
    if (files.length === 0) {
      setErrorMessage(t('uploadNotes.noFiles'));
      return;
    }

    setErrorMessage(null);
    setStep('uploading');

    let uploaded: UploadedNote[];
    try {
      const response = await noteService.upload({
        files: files.map((f) => f.file),
        courseId: selectedCourse.id,
      });
      setUploadResult(response);
      uploaded = response.notes;

      if (response.errors.length > 0) {
        setErrorMessage(
          t('uploadNotes.uploadFailed', {
            message: response.errors.map((e) => e.message).join(' · '),
          })
        );
      }
      if (uploaded.length === 0) {
        setStep('error');
        return;
      }
    } catch (err) {
      setErrorMessage(
        t('uploadNotes.uploadFailed', {
          message: (err as Error).message || '—',
        })
      );
      setStep('error');
      return;
    }

    setStep('generating');
    try {
      const result = await studyPackService.generate({
        professorId,
        noteIds: uploaded.map((n) => n.id),
      });

      if (result.status === 'insufficient_data') {
        const msg =
          result.reason === 'style_profile_missing'
            ? t('uploadNotes.insufficientStyle')
            : result.reason === 'notes_not_found'
              ? t('uploadNotes.insufficientNotes')
              : result.message;
        setErrorMessage(msg);
        setStep('error');
        return;
      }

      navigate(`/study-pack/${result.pack.id}`);
    } catch (err) {
      setErrorMessage(
        t('uploadNotes.generateFailed', {
          message: (err as Error).message || '—',
        })
      );
      setStep('error');
    }
  };

  const retry = () => {
    setErrorMessage(null);
    setUploadResult(null);
    setStep('idle');
  };

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
          {t('uploadNotes.badge')}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {t('uploadNotes.title')}
        </h1>
        <p className="text-muted-foreground mt-2">{t('uploadNotes.subtitle')}</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card-base p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('uploadNotes.selectCourse')}
            </label>
            <CourseCombobox
              value={selectedCourse}
              onChange={setSelectedCourse}
              defaultUniversity={user?.university || undefined}
            />
            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3" />
              {t('uploadNotes.selectCourseHint')}
              {selectedCourse?.professor && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-secondary text-foreground">
                  {selectedCourse.professor.name}
                </span>
              )}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('uploadNotes.fileLabel')}
            </label>
            <FileUpload
              files={files}
              onChange={setFiles}
              disabled={step !== 'idle' && step !== 'error'}
              acceptedTypes={NOTE_ACCEPTED_TYPES}
              acceptedExtensions={NOTE_ACCEPTED_EXTENSIONS}
              rejectionMessage={t('uploadNotes.fileRejection')}
              hint={t('uploadNotes.fileHint')}
            />
          </div>

          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p className="flex items-start gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
              <span>{t('uploadNotes.privacyNote')}</span>
            </p>
            <p className="flex items-start gap-1.5">
              <FileWarning className="w-3.5 h-3.5 shrink-0 mt-0.5 text-warning" />
              <span>{t('uploadNotes.copyrightNote')}</span>
            </p>
          </div>
        </div>

        {/* Short note warnings */}
        {shortNotes.length > 0 && step !== 'idle' && (
          <div className="card-base p-4 border-warning/40 bg-warning/5">
            {shortNotes.map((n) => (
              <p
                key={n.id}
                className="text-sm text-foreground flex items-start gap-1.5"
              >
                <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                {t('uploadNotes.shortWarning', {
                  title: n.title,
                  count: n.wordCount,
                })}
              </p>
            ))}
          </div>
        )}

        {/* Error banner */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-base p-4 border-destructive/40 bg-destructive/5"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-foreground">{errorMessage}</p>
                {step === 'error' && (
                  <button
                    type="button"
                    onClick={retry}
                    className="text-xs text-primary hover:underline mt-1.5"
                  >
                    ↺
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            'btn-primary w-full py-3.5 text-base',
            !canSubmit && 'opacity-50 pointer-events-none'
          )}
        >
          {step === 'uploading' || step === 'generating' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('uploadNotes.submitting')}
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              {t('uploadNotes.submit')}
            </>
          )}
        </button>
      </form>

      {/* Step progression strip */}
      <AnimatePresence>
        {(step === 'uploading' || step === 'generating') && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 card-base p-5 space-y-3"
          >
            <StepLine
              active={step === 'uploading'}
              done={step === 'generating'}
              label={t('uploadNotes.uploadStep')}
            />
            <StepLine
              active={step === 'generating'}
              done={false}
              label={t('uploadNotes.generateStep')}
              hint={t('uploadNotes.generateEta')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface StepLineProps {
  active: boolean;
  done: boolean;
  label: string;
  hint?: string;
}

const StepLine: React.FC<StepLineProps> = ({ active, done, label, hint }) => (
  <div className="flex items-start gap-3">
    <div
      className={cn(
        'w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5',
        done
          ? 'bg-success/15 text-success'
          : active
            ? 'bg-primary-soft text-primary'
            : 'bg-secondary text-muted-foreground'
      )}
    >
      {done ? (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3}>
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : active ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
      )}
    </div>
    <div>
      <p
        className={cn(
          'text-sm font-medium',
          done
            ? 'text-foreground'
            : active
              ? 'text-foreground'
              : 'text-muted-foreground'
        )}
      >
        {label}
      </p>
      {hint && active && (
        <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
      )}
    </div>
  </div>
);

export default UploadNotesPage;
