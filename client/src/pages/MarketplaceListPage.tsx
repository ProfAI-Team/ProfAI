import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Search, ShoppingBag } from 'lucide-react';

import { marketplaceService, type SearchFilters } from '../services/marketplaceService';
import PriceTag from '../components/b2b/PriceTag';
import RatingStars from '../components/b2b/RatingStars';

const TYPE_LABELS: Record<string, string> = {
  notes: 'Not',
  study_guide: 'Çalışma rehberi',
};

const MarketplaceListPage: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [queryDraft, setQueryDraft] = useState('');

  const key = useMemo(() => ['marketplace', 'list', filters], [filters]);
  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => marketplaceService.search(filters),
  });
  const items = data ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold">
          Mezun notları ve çalışma rehberleri
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          ProfAI topluluğunun paylaştığı materyaller. Satış başına %30 komisyon alınır.
        </p>
      </header>

      <form
        className="flex flex-wrap gap-3 mb-6 items-end"
        onSubmit={(e) => {
          e.preventDefault();
          setFilters((prev) => ({
            ...prev,
            query: queryDraft.trim() || undefined,
          }));
        }}
      >
        <label className="flex-1 min-w-[200px]">
          <span className="text-xs font-medium text-muted-foreground">Ara</span>
          <div className="mt-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              className="input pl-10"
              placeholder="Matematik, organik kimya, veri yapıları…"
              value={queryDraft}
              onChange={(e) => setQueryDraft(e.target.value)}
            />
          </div>
        </label>
        <label>
          <span className="text-xs font-medium text-muted-foreground">Tür</span>
          <select
            className="input mt-1"
            value={filters.type ?? ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                type:
                  e.target.value === ''
                    ? undefined
                    : (e.target.value as SearchFilters['type']),
              }))
            }
          >
            <option value="">Hepsi</option>
            <option value="notes">Notlar</option>
            <option value="study_guide">Çalışma rehberi</option>
          </select>
        </label>
        <label>
          <span className="text-xs font-medium text-muted-foreground">Sırala</span>
          <select
            className="input mt-1"
            value={filters.sort ?? 'recent'}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                sort: e.target.value as SearchFilters['sort'],
              }))
            }
          >
            <option value="recent">Yeni</option>
            <option value="popular">Popüler</option>
            <option value="price_asc">Ucuz → pahalı</option>
            <option value="price_desc">Pahalı → ucuz</option>
          </select>
        </label>
        <button type="submit" className="btn-primary">Ara</button>
      </form>

      {isLoading ? (
        <div className="py-10 text-center">
          <Loader2 className="w-6 h-6 mx-auto text-primary animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="card-base p-6 text-center">
          <ShoppingBag className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
          <h2 className="font-display font-semibold">Sonuç yok</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Arama ifadeni genişlet ya da tür filtresini kaldır.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/marketplace/${item.id}`}
              className="block card-base p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <span className="text-[11px] font-medium uppercase tracking-wide text-primary">
                {TYPE_LABELS[item.type] ?? item.type}
              </span>
              <h3 className="font-display font-semibold mt-1 line-clamp-2">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                {item.previewText || item.description.slice(0, 160)}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <RatingStars rating={item.rating} size="sm" sampleSize={item.totalSales} />
                <PriceTag priceTl={item.price} size="sm" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketplaceListPage;
