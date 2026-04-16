import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { cn } from '../lib/utils';

interface City {
  name: string;
  count: number;
}

interface Props {
  cities: City[];
  active: string;
  onSelect: (city: string) => void;
  /** Show only top N cities (default 8) */
  topN?: number;
}

const CityPills: React.FC<Props> = ({ cities, active, onSelect, topN = 8 }) => {
  const top = cities.slice(0, topN);

  if (top.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <PillButton
        label="Tüm şehirler"
        count={cities.reduce((s, c) => s + c.count, 0)}
        active={!active}
        onClick={() => onSelect('')}
      />
      {top.map((city, i) => (
        <motion.div
          key={city.name}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: i * 0.02 }}
        >
          <PillButton
            label={city.name}
            count={city.count}
            active={active === city.name}
            onClick={() => onSelect(active === city.name ? '' : city.name)}
            withIcon
          />
        </motion.div>
      ))}
    </div>
  );
};

const PillButton: React.FC<{
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  withIcon?: boolean;
}> = ({ label, count, active, onClick, withIcon }) => (
  <button
    onClick={onClick}
    className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
      'border transition-all',
      active
        ? 'bg-primary text-primary-foreground border-primary shadow-soft'
        : 'bg-card text-foreground border-border hover:border-primary/40 hover:bg-secondary'
    )}
  >
    {withIcon && <MapPin className="w-3 h-3" />}
    {label}
    <span
      className={cn(
        'text-xs tabular-nums',
        active ? 'text-primary-foreground/80' : 'text-muted-foreground'
      )}
    >
      {count.toLocaleString('tr-TR')}
    </span>
  </button>
);

export default CityPills;
