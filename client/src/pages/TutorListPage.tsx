import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, BadgeInfo, LogIn } from 'lucide-react';

import { tutorService, type MatchFilters } from '../services/tutorService';
import TutorCard from '../components/b2b/TutorCard';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const LEVELS: Array<'beginner' | 'intermediate' | 'advanced'> = [
  'beginner',
  'intermediate',
  'advanced',
];

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Başlangıç',
  intermediate: 'Orta',
  advanced: 'İleri',
};

const TutorListPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState<MatchFilters>({});
  const [subjectDraft, setSubjectDraft] = useState('');

  const queryKey = useMemo(
    () => ['tutors', 'match', filters],
    [filters]
  );

  const query = useQuery({
    queryKey,
    queryFn: () => tutorService.match(filters),
  });

  const results = query.data ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold">
          Tutor bul
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Hangi konuda takıldıysan yaz; profiline uyan tutorları buluyoruz.
        </p>
      </header>

      {!isAuthenticated && (
        <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-start gap-3">
          <LogIn className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Giriş yap, DNA uyumunu gör.</p>
            <p className="text-muted-foreground mt-0.5">
              Şu an konu, puan ve fiyat üzerinden önizleme görüyorsun. Profilinle birlikte öğrenme stilin skora eklenir.{' '}
              <Link to="/login" className="text-primary underline underline-offset-2 font-medium">
                Giriş yap
              </Link>
            </p>
          </div>
        </div>
      )}

      <form
        className="flex flex-wrap gap-3 mb-6 items-end"
        onSubmit={(e) => {
          e.preventDefault();
          setFilters((prev) => ({
            ...prev,
            subject: subjectDraft.trim() || undefined,
          }));
        }}
      >
        <label className="flex-1 min-w-[200px]">
          <span className="text-xs font-medium text-muted-foreground">
            Konu
          </span>
          <div className="mt-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={subjectDraft}
              onChange={(e) => setSubjectDraft(e.target.value)}
              placeholder="Calculus, Organik Kimya, Veri Yapıları…"
              className="input pl-10"
            />
          </div>
        </label>
        <label>
          <span className="text-xs font-medium text-muted-foreground">
            Seviye
          </span>
          <select
            className="input mt-1"
            value={filters.level ?? ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                level:
                  e.target.value === ''
                    ? undefined
                    : (e.target.value as MatchFilters['level']),
              }))
            }
          >
            <option value="">Hepsi</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {LEVEL_LABELS[l]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-xs font-medium text-muted-foreground">
            Max. saatlik (₺)
          </span>
          <input
            type="number"
            min={0}
            className="input mt-1"
            value={filters.priceMaxTl ?? ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                priceMaxTl: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              }))
            }
          />
        </label>
        <button type="submit" className="btn-primary">
          Ara
        </button>
      </form>

      {query.isLoading && (
        <div className="text-center py-10">
          <Loader2 className="w-6 h-6 mx-auto text-primary animate-spin" />
        </div>
      )}

      {!query.isLoading && results.length === 0 && (
        <div className="rounded-xl border border-border bg-surface p-6 text-center">
          <BadgeInfo className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
          <h2 className="font-display font-semibold">
            Henüz bu filtrelerle eşleşen tutor yok
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Farklı bir konu dene ya da fiyat aralığını genişlet.
          </p>
        </div>
      )}

      <div
        className={cn(
          'grid gap-4',
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        )}
      >
        {results.map((r) => (
          <TutorCard
            key={r.tutor.id}
            tutor={r.tutor}
            score={r.score}
            reasons={r.reasons}
          />
        ))}
      </div>
    </div>
  );
};

export default TutorListPage;
