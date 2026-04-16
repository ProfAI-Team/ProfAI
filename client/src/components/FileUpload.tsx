import React, { useState, useRef, DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud, FileCheck2, X, AlertCircle, FileText, Image as ImageIcon,
  Loader2, CheckCircle2,
} from 'lucide-react';
import { cn } from '../lib/utils';

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png';
const MAX_SIZE = 10 * 1024 * 1024;

export type FileStatus = 'pending' | 'uploading' | 'success' | 'error';

export interface UploadFile {
  id: string;
  file: File;
  status: FileStatus;
  errorMessage?: string;
  /** Exam id returned from backend on success */
  examId?: string;
}

interface Props {
  files: UploadFile[];
  onChange: (files: UploadFile[]) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<Props> = ({ files, onChange, disabled = false }) => {
  const { t } = useTranslation();
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) return 'Sadece PDF, JPG veya PNG kabul edilir.';
    if (file.size > MAX_SIZE) return 'Dosya 10 MB altında olmalı.';
    return null;
  };

  const addFiles = (newFiles: File[]) => {
    if (disabled) return;
    setError('');
    const validated: UploadFile[] = [];
    for (const file of newFiles) {
      const err = validateFile(file);
      if (err) {
        setError(err);
        continue;
      }
      // De-duplicate by name+size
      const isDup =
        files.some((f) => f.file.name === file.name && f.file.size === file.size) ||
        validated.some((v) => v.file.name === file.name && v.file.size === file.size);
      if (isDup) continue;
      validated.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        status: 'pending',
      });
    }
    if (validated.length > 0) onChange([...files, ...validated]);
  };

  const removeFile = (id: string) => {
    if (disabled) return;
    onChange(files.filter((f) => f.id !== id));
  };

  const clearAll = () => {
    if (disabled) return;
    onChange([]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    addFiles(Array.from(e.dataTransfer.files));
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-7 text-center transition-all duration-200',
          disabled
            ? 'border-input bg-muted/30 cursor-not-allowed opacity-60'
            : 'cursor-pointer',
          !disabled && (dragOver
            ? 'border-primary bg-primary-soft scale-[1.01]'
            : 'border-input hover:border-primary/50 hover:bg-primary-soft/40')
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          multiple
          onChange={(e) => {
            if (e.target.files) addFiles(Array.from(e.target.files));
          }}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-foreground font-medium">{t('upload.drag')}</p>
          <p className="text-sm text-muted-foreground">
            {t('upload.fileHint')} · birden fazla seçebilirsin
          </p>
        </div>
      </div>

      {/* File list */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 space-y-2"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-muted-foreground">
                {files.length} dosya seçildi
              </p>
              {!disabled && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Hepsini kaldır
                </button>
              )}
            </div>

            {files.map((uf) => (
              <FileRow
                key={uf.id}
                upload={uf}
                onRemove={() => removeFile(uf.id)}
                formatSize={formatSize}
                disabled={disabled}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
};

const FileRow: React.FC<{
  upload: UploadFile;
  onRemove: () => void;
  formatSize: (bytes: number) => string;
  disabled: boolean;
}> = ({ upload, onRemove, formatSize, disabled }) => {
  const { file, status, errorMessage } = upload;
  const isImage = file.type.startsWith('image/');
  const Icon = isImage ? ImageIcon : FileText;

  const statusBadge = (() => {
    switch (status) {
      case 'uploading':
        return (
          <span className="flex items-center gap-1.5 text-xs text-primary">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Analiz ediliyor…
          </span>
        );
      case 'success':
        return (
          <span className="flex items-center gap-1.5 text-xs text-success">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Başarılı
          </span>
        );
      case 'error':
        return (
          <span
            className="flex items-center gap-1.5 text-xs text-destructive"
            title={errorMessage}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Hata
          </span>
        );
      default:
        return null;
    }
  })();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border transition-colors',
        status === 'success' && 'border-success/30 bg-success/5',
        status === 'error' && 'border-destructive/30 bg-destructive/5',
        status === 'uploading' && 'border-primary/30 bg-primary-soft/40',
        status === 'pending' && 'border-border bg-card'
      )}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
          status === 'success' ? 'bg-success/15 text-success'
            : status === 'error' ? 'bg-destructive/15 text-destructive'
            : status === 'uploading' ? 'bg-primary/15 text-primary'
            : 'bg-secondary text-muted-foreground'
        )}
      >
        {status === 'success' ? <FileCheck2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <span>{file.type.split('/')[1].toUpperCase()}</span>
          <span>·</span>
          <span>{formatSize(file.size)}</span>
          {statusBadge && (
            <>
              <span>·</span>
              {statusBadge}
            </>
          )}
        </div>
        {status === 'error' && errorMessage && (
          <p className="text-xs text-destructive mt-1">{errorMessage}</p>
        )}
      </div>

      {!disabled && status !== 'uploading' && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Dosyayı kaldır"
          className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
};

export default FileUpload;
