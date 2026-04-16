import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check, ChevronDown, X, Star } from 'lucide-react';
import { cn } from '../lib/utils';

interface OptionWithCount {
  name: string;
  count?: number;
}

interface Props {
  value: string;
  onChange: (next: string) => void;
  options: Array<string | OptionWithCount>;
  placeholder: string;
  searchPlaceholder?: string;
  pinnedOption?: string;
  pinnedLabel?: string;
  emptyText?: string;
  className?: string;
}

const SearchableSelect: React.FC<Props> = ({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder = 'Yazarak ara...',
  pinnedOption,
  pinnedLabel = 'Benim üniversitem',
  emptyText = 'Sonuç yok',
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const normalized = useMemo<OptionWithCount[]>(
    () =>
      options.map((opt) =>
        typeof opt === 'string' ? { name: opt } : opt
      ),
    [options]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return normalized;
    const q = query.toLocaleLowerCase('tr');
    return normalized.filter((opt) => opt.name.toLocaleLowerCase('tr').includes(q));
  }, [normalized, query]);

  const showPinned =
    pinnedOption && normalized.some((o) => o.name === pinnedOption) && !query.trim();
  const pinnedMeta = showPinned ? normalized.find((o) => o.name === pinnedOption) : null;

  const handleSelect = (opt: string) => {
    onChange(opt);
    setOpen(false);
    setQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const openPicker = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div ref={containerRef} className={cn('relative min-w-[200px]', className)}>
      <button
        type="button"
        onClick={openPicker}
        className={cn(
          'w-full flex items-center justify-between gap-2',
          'bg-card border border-input rounded-xl px-3 py-2.5 text-sm',
          'shadow-soft transition-all',
          'hover:border-ring/50',
          open && 'ring-2 ring-ring/40 border-ring'
        )}
      >
        <span className={cn('truncate', value ? 'text-foreground' : 'text-muted-foreground')}>
          {value || placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              aria-label="Temizle"
              className="p-0.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={cn(
              'w-4 h-4 text-muted-foreground transition-transform',
              open && 'rotate-180'
            )}
          />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className={cn(
              'absolute left-0 right-0 top-full mt-2 z-50',
              'bg-popover border border-border rounded-xl shadow-elevated',
              'overflow-hidden'
            )}
          >
            <div className="relative border-b border-border">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground pl-9 pr-3 py-2.5 focus:outline-none"
              />
            </div>

            <ul className="max-h-72 overflow-y-auto py-1">
              {showPinned && pinnedMeta && (
                <>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleSelect(pinnedMeta.name)}
                      className={cn(
                        'w-full text-left flex items-center justify-between gap-2 px-3 py-2 text-sm',
                        'hover:bg-secondary transition-colors',
                        value === pinnedMeta.name && 'bg-primary-soft font-medium'
                      )}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <Star className="w-3.5 h-3.5 text-warning fill-warning shrink-0" />
                        <span className="truncate">
                          <span className="text-foreground">{pinnedMeta.name}</span>
                          <span className="text-muted-foreground text-xs ml-1.5">· {pinnedLabel}</span>
                        </span>
                      </span>
                      <span className="flex items-center gap-2 shrink-0">
                        {pinnedMeta.count != null && pinnedMeta.count > 0 && (
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {pinnedMeta.count}
                          </span>
                        )}
                        {value === pinnedMeta.name && <Check className="w-4 h-4 text-primary" />}
                      </span>
                    </button>
                  </li>
                  <li className="border-t border-border my-1" aria-hidden />
                </>
              )}

              {filtered.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                  {emptyText}
                </li>
              ) : (
                filtered
                  .filter((opt) => !showPinned || opt.name !== pinnedOption)
                  .map((opt) => {
                    const isSelected = value === opt.name;
                    return (
                      <li key={opt.name}>
                        <button
                          type="button"
                          onClick={() => handleSelect(opt.name)}
                          className={cn(
                            'w-full text-left flex items-center justify-between gap-2 px-3 py-2 text-sm',
                            'hover:bg-secondary transition-colors',
                            isSelected && 'bg-primary-soft font-medium'
                          )}
                        >
                          <span className="truncate text-foreground">{opt.name}</span>
                          <span className="flex items-center gap-2 shrink-0">
                            {opt.count != null && opt.count > 0 && (
                              <span className="text-xs text-muted-foreground tabular-nums">
                                {opt.count.toLocaleString('tr-TR')}
                              </span>
                            )}
                            {isSelected && <Check className="w-4 h-4 text-primary" />}
                          </span>
                        </button>
                      </li>
                    );
                  })
              )}
            </ul>

            {!query.trim() && filtered.length > 10 && (
              <div className="border-t border-border px-3 py-1.5 text-xs text-muted-foreground bg-secondary/30">
                {filtered.length} seçenek · daraltmak için yaz
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchableSelect;
