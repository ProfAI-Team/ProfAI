import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import { cn } from '../lib/utils';

export interface NavDropdownItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Props {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavDropdownItem[];
}

/**
 * Click-to-toggle navbar dropdown used to group logged-in study + tools
 * links. Phase 7 left the navbar with 16+ top-level entries that
 * overflowed at 1440px; this collapses the secondary links into two
 * dropdown panels so the primary nav (Home, Professors, Tutors,
 * Marketplace, Dashboard) stays comfortable on a single row.
 *
 * Highlights any item whose path prefixes the current route, and
 * closes on outside click + Escape so the panel behaves like a
 * well-mannered menu.
 */
const NavDropdown: React.FC<Props> = ({ label, icon: Icon, items }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const activeItem = items.some((item) => location.pathname.startsWith(item.to));

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          'relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap',
          activeItem
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        {label}
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 transition-transform',
            open ? 'rotate-180' : 'rotate-0'
          )}
        />
        {activeItem && (
          <span className="absolute inset-0 bg-secondary rounded-lg -z-10" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.12 }}
            role="menu"
            className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-background shadow-xl py-1.5 z-50"
          >
            {items.map((item) => {
              const ItemIcon = item.icon;
              const active = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 text-sm transition-colors',
                    active
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <ItemIcon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavDropdown;
