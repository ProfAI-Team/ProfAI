import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Lightbulb,
  Loader2,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Tabs, TabPanel, useTabListId } from '../components/Tabs';
import PracticeQuestionCard from '../components/PracticeQuestionCard';
import { studyPackService } from '../services/studyPackService';
import { professorService } from '../services/professorService';
import type { StudyPack } from '../types/studyPack';
import type { Professor } from '../types';
import { cn } from '../lib/utils';

type TabId = 'summary' | 'practice' | 'trick';

const StudyPackPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const tabListId = useTabListId('study-pack');

  const [pack, setPack] = useState<StudyPack | null>(null);
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<'not_found' | 'generic' | null>(null);
  const [active, setActive] = useState<TabId>('summary');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    studyPackService
      .getById(id)
      .then(async (data) => {
        setPack(data);
        try {
          const prof = await professorService.getById(data.professorId);
          setProfessor(prof);
        } catch {
          // Professor lookup is cosmetic — swallow.
        }
      })
      .catch((err) => {
        const status = err?.response?.status;
        setError(status === 404 ? 'not_found' : 'generic');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const generatedLabel = useMemo(() => {
    if (!pack?.generatedAt) return '';
    const date = new Date(pack.generatedAt);
    try {
      return new Intl.DateTimeFormat(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
    } catch {
      return date.toLocaleString();
    }
  }, [pack?.generatedAt, i18n.language]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
        <p className="mt-3 text-sm text-muted-foreground">
          {t('studyPack.loading')}
        </p>
      </div>
    );
  }

  if (error === 'not_found' || !pack) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h1 className="font-display text-xl font-bold text-foreground mb-1">
          {t('studyPack.notFound.title')}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {t('studyPack.notFound.body')}
        </p>
        <Link to="/upload-notes" className="btn-primary inline-flex">
          <Sparkles className="w-4 h-4" />
          {t('studyPack.notFound.cta')}
        </Link>
      </div>
    );
  }

  const tabs = [
    {
      id: 'summary' as const,
      label: t('studyPack.tabs.summary'),
      icon: BookOpen,
      count: pack.topicSummaries.length,
    },
    {
      id: 'practice' as const,
      label: t('studyPack.tabs.practice'),
      icon: Brain,
      count: pack.practiceQuestions.length,
    },
    {
      id: 'trick' as const,
      label: t('studyPack.tabs.trick'),
      icon: Lightbulb,
      count: pack.profStylePatterns.length,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between gap-3 mb-4">
        <Link
          to="/upload-notes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('studyPack.backToUpload')}
        </Link>
      </div>

      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          {t('studyPack.headerBadge')}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {t('studyPack.headerTitleShort')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('studyPack.headerSubtitle', {
            count: pack.topicSummaries.length,
            questionCount: pack.practiceQuestions.length,
            patternCount: pack.profStylePatterns.length,
          })}
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-muted-foreground">
          {professor && (
            <Link
              to={`/professors/${professor.id}`}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary text-foreground hover:bg-primary-soft transition-colors"
            >
              <ShieldCheck className="w-3 h-3 text-primary" />
              {professor.name}
            </Link>
          )}
          <span>{t('studyPack.meta.generatedAt', { when: generatedLabel })}</span>
        </div>
      </motion.header>

      {/* Disclaimer */}
      <div className="card-base p-3 mb-6 flex items-start gap-2 bg-primary-soft/40 border-primary/20">
        <AlertTriangle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-foreground leading-relaxed">
          {t('studyPack.disclaimer')}
        </p>
      </div>

      <div className="mb-5">
        <Tabs
          tabs={tabs}
          activeId={active}
          onChange={setActive}
          ariaLabel={t('studyPack.headerTitleShort')}
          className="flex-wrap"
        />
      </div>

      <TabPanel tabListId={tabListId} tabId="summary" active={active === 'summary'}>
        {pack.topicSummaries.length === 0 ? (
          <EmptyBlock text={t('studyPack.summary.empty')} />
        ) : (
          <div className="space-y-5">
            {pack.topicSummaries.map((s) => (
              <motion.article
                key={s.topic}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-base p-6"
              >
                <h2 className="font-display text-lg font-bold text-foreground mb-3">
                  {s.topic}
                </h2>
                <div className="prose prose-sm sm:prose max-w-none dark:prose-invert text-foreground">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {s.content}
                  </ReactMarkdown>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </TabPanel>

      <TabPanel tabListId={tabListId} tabId="practice" active={active === 'practice'}>
        {pack.practiceQuestions.length === 0 ? (
          <EmptyBlock text={t('studyPack.practice.empty')} />
        ) : (
          <div className="space-y-4">
            {pack.practiceQuestions.map((q, i) => (
              <PracticeQuestionCard
                key={`${q.topic}-${i}`}
                question={q}
                index={i}
              />
            ))}
          </div>
        )}
      </TabPanel>

      <TabPanel tabListId={tabListId} tabId="trick" active={active === 'trick'}>
        {pack.profStylePatterns.length === 0 ? (
          <EmptyBlock text={t('studyPack.trick.empty')} />
        ) : (
          <div className="card-base p-6">
            <div className="mb-4">
              <h2 className="font-display text-lg font-bold text-foreground">
                {t('studyPack.trick.header')}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t('studyPack.trick.subtitle')}
              </p>
            </div>
            <ul className="space-y-3">
              {pack.profStylePatterns.map((pattern, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-2.5 text-sm text-foreground"
                >
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2'
                    )}
                  />
                  <span>{pattern}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </TabPanel>
    </div>
  );
};

const EmptyBlock: React.FC<{ text: string }> = ({ text }) => (
  <div className="card-base p-8 text-center">
    <p className="text-sm text-muted-foreground">{text}</p>
  </div>
);

export default StudyPackPage;
