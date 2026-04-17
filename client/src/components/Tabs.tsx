import React, { useId, useRef, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export interface TabItem<Id extends string = string> {
  id: Id;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

interface TabsProps<Id extends string = string> {
  tabs: TabItem<Id>[];
  activeId: Id;
  onChange: (id: Id) => void;
  ariaLabel?: string;
  className?: string;
}

// Accessible pill-style tabs. Keyboard nav: Left/Right cycles focus and
// switches tab (APG "Tabs with Automatic Activation" pattern). The Home
// and End keys jump to the edges. Panels are rendered by the caller so
// transitions can be controlled per-tab.
export function Tabs<Id extends string = string>({
  tabs,
  activeId,
  onChange,
  ariaLabel,
  className,
}: TabsProps<Id>) {
  const listId = useId();
  const buttonRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());

  const focusTab = (id: Id) => {
    const el = buttonRefs.current.get(id);
    el?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const currentIdx = tabs.findIndex((t) => t.id === activeId);
    if (currentIdx === -1) return;

    let nextIdx: number | null = null;
    if (e.key === 'ArrowRight') nextIdx = (currentIdx + 1) % tabs.length;
    if (e.key === 'ArrowLeft') nextIdx = (currentIdx - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') nextIdx = 0;
    if (e.key === 'End') nextIdx = tabs.length - 1;

    if (nextIdx !== null) {
      e.preventDefault();
      const nextId = tabs[nextIdx].id;
      onChange(nextId);
      focusTab(nextId);
    }
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={cn(
        'inline-flex items-center gap-1 rounded-xl bg-secondary/60 p-1 border border-border',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              buttonRefs.current.set(tab.id, el);
            }}
            role="tab"
            type="button"
            id={`tab-${listId}-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`panel-${listId}-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {isActive && (
              <motion.span
                layoutId={`tabs-indicator-${listId}`}
                className="absolute inset-0 rounded-lg bg-background shadow-sm border border-border"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {Icon && <Icon className="w-4 h-4" />}
              {tab.label}
              {typeof tab.count === 'number' && (
                <span
                  className={cn(
                    'ml-1 text-xs font-normal rounded-full px-1.5 py-0.5',
                    isActive
                      ? 'bg-primary-soft text-primary'
                      : 'bg-background text-muted-foreground'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface TabPanelProps {
  tabListId: string;
  tabId: string;
  active: boolean;
  children: React.ReactNode;
}

export const TabPanel: React.FC<TabPanelProps> = ({
  tabListId,
  tabId,
  active,
  children,
}) => (
  <div
    role="tabpanel"
    id={`panel-${tabListId}-${tabId}`}
    aria-labelledby={`tab-${tabListId}-${tabId}`}
    hidden={!active}
  >
    {active && children}
  </div>
);

// Exposes the auto-generated list id so sibling TabPanels can match the
// Tabs component — used when a page has multiple tab groups.
export function useTabListId(prefix = 'tabs') {
  const id = useId();
  return `${prefix}-${id}`;
}
