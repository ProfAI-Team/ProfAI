import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../i18n';

const LANG_LABELS: Record<SupportedLanguage, { native: string; flag: string }> = {
  en: { native: 'English', flag: '🇺🇸' },
  tr: { native: 'Türkçe', flag: '🇹🇷' },
};

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = (i18n.resolvedLanguage as SupportedLanguage) || 'en';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const change = (lang: SupportedLanguage) => {
    i18n.changeLanguage(lang);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        className={cn(
          'inline-flex items-center justify-center h-9 w-9 rounded-lg',
          'text-muted-foreground hover:text-foreground hover:bg-secondary',
          'transition-colors'
        )}
      >
        <Globe className="h-[18px] w-[18px]" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 min-w-[160px] rounded-xl bg-popover border border-border shadow-elevated overflow-hidden z-50"
          >
            {SUPPORTED_LANGUAGES.map((lang) => {
              const active = lang === current;
              const meta = LANG_LABELS[lang];
              return (
                <button
                  key={lang}
                  onClick={() => change(lang)}
                  className={cn(
                    'w-full flex items-center justify-between gap-3 px-3 py-2.5 text-sm text-popover-foreground',
                    'hover:bg-secondary transition-colors',
                    active && 'font-semibold'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{meta.flag}</span>
                    {meta.native}
                  </span>
                  {active && <Check className="w-4 h-4 text-primary" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
