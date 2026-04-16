import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  SearchX, X, Loader2, Sparkles, ChevronLeft, ChevronRight,
  ArrowUpDown, TrendingUp,
} from 'lucide-react';
import SearchBar from '../components/SearchBar';
import ProfessorCard from '../components/ProfessorCard';
import SearchableSelect from '../components/SearchableSelect';
import CityPills from '../components/CityPills';
import { useAuth } from '../context/AuthContext';
import { professorService } from '../services/professorService';
import { Professor } from '../types';
import { cn } from '../lib/utils';

const PAGE_SIZE = 30;

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'A → Z (isim)' },
  { value: 'ratings-desc', label: 'En çok değerlendirilen' },
  { value: 'courses-desc', label: 'En çok ders veren' },
  { value: 'name-desc', label: 'Z → A (isim)' },
];

interface FilterOptions {
  universities: Array<{ name: string; count: number; city: string | null }>;
  departments: Array<{ name: string; count: number }>;
  cities: Array<{ name: string; count: number }>;
}

const ProfessorListPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters synced with URL
  const search = searchParams.get('q') || '';
  const department = searchParams.get('dept') || '';
  const university = searchParams.get('uni') || '';
  const city = searchParams.get('city') || '';
  const sort = searchParams.get('sort') || 'name-asc';

  const updateParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams);
      if (value) next.set(key, value);
      else next.delete(key);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // Data
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter dropdown options
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    universities: [],
    departments: [],
    cities: [],
  });

  // Discovery (top sections)
  const [discovery, setDiscovery] = useState<{
    topRated: Professor[];
    byUserUni: Professor[];
  }>({ topRated: [], byUserUni: [] });

  useEffect(() => {
    professorService.getFilterOptions().then(setFilterOptions).catch(() => {});
  }, []);

  useEffect(() => {
    professorService.getDiscovery(user?.university || undefined).then(setDiscovery).catch(() => {});
  }, [user?.university]);

  // Fetch when filters change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPage(1);
    professorService
      .getPaged({
        search: search || undefined,
        department: department || undefined,
        university: university || undefined,
        city: city || undefined,
        sort,
        page: 1,
        limit: PAGE_SIZE,
      })
      .then((data) => {
        if (cancelled) return;
        setProfessors(data.professors);
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search, department, university, city, sort]);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const next = page + 1;
      const data = await professorService.getPaged({
        search: search || undefined,
        department: department || undefined,
        university: university || undefined,
        city: city || undefined,
        sort,
        page: next,
        limit: PAGE_SIZE,
      });
      setProfessors((prev) => [...prev, ...data.professors]);
      setPage(next);
    } finally {
      setLoadingMore(false);
    }
  }, [page, search, department, university, city, sort]);

  const handleSearchChange = useCallback(
    (q: string) => updateParam('q', q),
    [updateParam]
  );

  const clearAll = () => {
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilter = !!(search || department || university || city);
  const hasMore = professors.length < total;

  // Filter universities by city if city is active (for accurate dropdown)
  const visibleUniversities = useMemo(() => {
    if (!city) return filterOptions.universities;
    return filterOptions.universities.filter((u) => u.city === city);
  }, [filterOptions.universities, city]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {t('professors.listTitle')}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {loading ? '…' : `${total.toLocaleString('tr-TR')} profesör`}
        </p>
      </motion.div>

      {/* Discovery rows (only when no active filter) */}
      {!hasActiveFilter && (
        <div className="mb-8 space-y-6">
          {discovery.byUserUni.length > 0 && user && (
            <DiscoveryRow
              icon={Sparkles}
              iconColor="text-chart-1 bg-chart-1/10"
              title="Senin için"
              subtitle={user.university || ''}
              items={discovery.byUserUni}
            />
          )}
          {discovery.topRated.length > 0 && (
            <DiscoveryRow
              icon={TrendingUp}
              iconColor="text-chart-3 bg-chart-3/10"
              title="En çok değerlendirilen"
              subtitle="Topluluk favorisi"
              items={discovery.topRated}
            />
          )}
        </div>
      )}

      {/* City pills */}
      {filterOptions.cities.length > 0 && (
        <div className="mb-5">
          <CityPills
            cities={filterOptions.cities}
            active={city}
            onSelect={(c) => updateParam('city', c)}
          />
        </div>
      )}

      {/* Search + Filters + Sort */}
      <div className="flex flex-col lg:flex-row gap-3 mb-4">
        <SearchBar
          placeholder="İsim, bölüm veya üniversite..."
          onSearch={handleSearchChange}
        />
        <div className="flex flex-wrap gap-3">
          <SearchableSelect
            value={department}
            onChange={(v) => updateParam('dept', v)}
            options={filterOptions.departments}
            placeholder={t('professors.filters.allDepartments')}
            searchPlaceholder="Bölüm ara..."
          />
          <SearchableSelect
            value={university}
            onChange={(v) => updateParam('uni', v)}
            options={visibleUniversities}
            placeholder={t('professors.filters.allUniversities')}
            searchPlaceholder="Üniversite ara..."
            pinnedOption={user?.university || undefined}
            pinnedLabel="Benim üniversitem"
          />
          <SortSelect value={sort} onChange={(v) => updateParam('sort', v === 'name-asc' ? '' : v)} />
        </div>
      </div>

      {/* Active filter chips */}
      {hasActiveFilter && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs text-muted-foreground">Aktif:</span>
          {search && (
            <Chip onClear={() => updateParam('q', '')}>
              <span className="text-muted-foreground">Arama:</span> {search}
            </Chip>
          )}
          {city && (
            <Chip onClear={() => updateParam('city', '')}>
              <span className="text-muted-foreground">Şehir:</span> {city}
            </Chip>
          )}
          {department && (
            <Chip onClear={() => updateParam('dept', '')}>
              <span className="text-muted-foreground">Bölüm:</span> {department}
            </Chip>
          )}
          {university && (
            <Chip onClear={() => updateParam('uni', '')}>
              <span className="text-muted-foreground">Üniv:</span> {university}
            </Chip>
          )}
          <button
            onClick={clearAll}
            className="text-xs text-primary hover:opacity-80 font-medium ml-1"
          >
            Tümünü temizle
          </button>
        </div>
      )}

      {/* Results */}
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {professors.map((prof, i) => (
              <ProfessorCard key={prof.id} professor={prof} index={i % 9} />
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {professors.length.toLocaleString('tr-TR')}
              </span>
              {' / '}
              {total.toLocaleString('tr-TR')} profesör gösteriliyor
            </p>
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className={cn('btn-secondary', loadingMore && 'opacity-50 pointer-events-none')}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Yükleniyor…
                  </>
                ) : (
                  `Daha fazla yükle (${(total - professors.length).toLocaleString('tr-TR')})`
                )}
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="card-base py-20 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary text-muted-foreground mb-4">
            <SearchX className="w-7 h-7" />
          </div>
          <p className="text-foreground font-medium">{t('professors.empty')}</p>
          {hasActiveFilter && (
            <button
              onClick={clearAll}
              className="mt-4 text-sm text-primary hover:opacity-80 font-medium"
            >
              Filtreleri temizle
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const DiscoveryRow: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  title: string;
  subtitle: string;
  items: Professor[];
}> = ({ icon: Icon, iconColor, title, subtitle, items }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({
      left: dir === 'left' ? -320 : 320,
      behavior: 'smooth',
    });
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', iconColor)}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            className="btn-ghost h-8 w-8 p-0"
            aria-label="Sol"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="btn-ghost h-8 w-8 p-0"
            aria-label="Sağ"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-thin"
      >
        {items.map((prof) => (
          <div
            key={prof.id}
            className="shrink-0 w-72 snap-start"
          >
            <ProfessorCard professor={prof} index={0} />
          </div>
        ))}
      </div>
    </section>
  );
};

const SortSelect: React.FC<{ value: string; onChange: (v: string) => void }> = ({
  value,
  onChange,
}) => {
  const current = SORT_OPTIONS.find((o) => o.value === value) || SORT_OPTIONS[0];
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative min-w-[200px]">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full flex items-center justify-between gap-2',
          'bg-card border border-input rounded-xl px-3 py-2.5 text-sm',
          'shadow-soft hover:border-ring/50 transition-all',
          open && 'ring-2 ring-ring/40 border-ring'
        )}
      >
        <span className="flex items-center gap-2 text-foreground">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          {current.label}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 left-0 top-full mt-2 bg-popover border border-border rounded-xl shadow-elevated z-50 py-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={cn(
                'w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors',
                opt.value === value && 'bg-primary-soft font-medium text-primary'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Chip: React.FC<{ children: React.ReactNode; onClear: () => void }> = ({
  children,
  onClear,
}) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-soft text-primary text-xs font-medium">
    {children}
    <button
      onClick={onClear}
      aria-label="Filtreyi kaldır"
      className="hover:bg-primary/15 rounded-full p-0.5 -mr-1"
    >
      <X className="w-3 h-3" />
    </button>
  </span>
);

export default ProfessorListPage;
