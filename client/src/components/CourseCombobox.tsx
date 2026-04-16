import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check, Loader2, BookOpen, GraduationCap, Building2, X } from 'lucide-react';
import { courseService } from '../services/courseService';
import { Course } from '../types';
import { cn } from '../lib/utils';

interface Props {
  value: Course | null;
  onChange: (course: Course | null) => void;
  defaultUniversity?: string;
  placeholder?: string;
}

const CourseCombobox: React.FC<Props> = ({
  value,
  onChange,
  defaultUniversity,
  placeholder,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch on query change (debounced)
  useEffect(() => {
    if (!open) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params: Parameters<typeof courseService.getAll>[0] = { limit: 50 };
        if (query.trim()) {
          params.search = query.trim();
        } else if (defaultUniversity) {
          params.university = defaultUniversity;
        }
        const data = await courseService.getAll(params);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open, defaultUniversity]);

  const handleSelect = (course: Course) => {
    onChange(course);
    setOpen(false);
    setQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const openPicker = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Selected display / trigger */}
      {value && !open ? (
        <button
          type="button"
          onClick={openPicker}
          className={cn(
            'w-full input-field text-left flex items-center justify-between gap-3'
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-xs font-semibold px-2 py-1 rounded-md bg-primary-soft text-primary shrink-0">
              {value.code}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-foreground font-medium truncate">{value.name}</div>
              {value.professor && (
                <div className="text-xs text-muted-foreground truncate">
                  {value.professor.name} · {value.professor.university}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            aria-label="Seçimi kaldır"
            className="shrink-0 p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </button>
      ) : (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder={
              placeholder ?? 'Ders adı, kodu, profesör veya üniversite ara...'
            }
            className="input-field pl-10 pr-10"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
          )}
        </div>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute left-0 right-0 top-full mt-2 z-50',
              'bg-popover border border-border rounded-xl shadow-elevated',
              'max-h-[400px] overflow-y-auto'
            )}
          >
            {!query.trim() && defaultUniversity && (
              <div className="sticky top-0 bg-popover border-b border-border px-3 py-2 text-xs text-muted-foreground flex items-center gap-1.5">
                <Building2 className="w-3 h-3" />
                {defaultUniversity} dersleri gösteriliyor — başka üniversite için ad/kod ile ara
              </div>
            )}

            {loading && results.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin" />
                {t('common.loading')}
              </div>
            ) : results.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                Sonuç bulunamadı
              </div>
            ) : (
              <ul className="py-1">
                {results.map((course) => {
                  const isSelected = value?.id === course.id;
                  return (
                    <li key={course.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(course)}
                        className={cn(
                          'w-full text-left px-3 py-2.5 flex items-start gap-3 hover:bg-secondary transition-colors',
                          isSelected && 'bg-primary-soft'
                        )}
                      >
                        <span className="font-mono text-xs font-semibold px-2 py-1 rounded-md bg-secondary text-foreground shrink-0 mt-0.5">
                          {course.code}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground truncate">
                              {course.name}
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                          </div>
                          {course.professor && (
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <GraduationCap className="w-3 h-3" />
                                {course.professor.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {course.professor.university}
                              </span>
                            </div>
                          )}
                        </div>
                        <BookOpen className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseCombobox;
