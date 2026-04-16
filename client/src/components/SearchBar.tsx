import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SearchBar: React.FC<Props> = ({
  placeholder,
  onSearch,
  debounceMs = 400,
  size = 'md',
  className,
}) => {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(value);
    }, debounceMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, debounceMs, onSearch]);

  const sizeClasses = {
    sm: 'pl-10 pr-4 py-2 text-sm',
    md: 'pl-11 pr-4 py-2.5 text-sm',
    lg: 'pl-12 pr-5 py-3.5 text-base',
  }[size];

  const iconSize = size === 'lg' ? 'w-5 h-5 left-4' : 'w-4 h-4 left-3.5';

  return (
    <div className={cn('relative w-full max-w-xl', className)}>
      <Search className={cn('absolute top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none', iconSize)} />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder ?? t('professors.search')}
        className={cn(
          'w-full bg-card border border-input rounded-xl text-foreground placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring',
          'shadow-soft transition-all',
          sizeClasses
        )}
      />
    </div>
  );
};

export default SearchBar;
