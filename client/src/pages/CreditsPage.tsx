import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Coins,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Loader2,
} from 'lucide-react';

import { creditService } from '../services/creditService';
import { Tabs, TabPanel, useTabListId } from '../components/Tabs';
import { cn } from '../lib/utils';

type TabId = 'balance' | 'history';

const creditKeys = {
  balance: () => ['credits', 'balance'] as const,
  history: () => ['credits', 'history'] as const,
};

const earnRules: Array<{ reason: string; amount: number; labelKey: string }> =
  [
    { reason: 'ExamApproved', amount: 10, labelKey: 'community.credit.rules.examApproved' },
    { reason: 'PostExamReport', amount: 5, labelKey: 'community.credit.rules.postExamReport' },
  ];
const spendRules: Array<{ reason: string; amount: number; labelKey: string }> =
  [
    { reason: 'MockExamGenerate', amount: 5, labelKey: 'community.credit.rules.mockExamGenerate' },
    { reason: 'StudyPackGenerate', amount: 3, labelKey: 'community.credit.rules.studyPackGenerate' },
  ];

const CreditsPage: React.FC = () => {
  const { t } = useTranslation();
  const tabListId = useTabListId('credits');
  const [active, setActive] = React.useState<TabId>('balance');

  const balanceQuery = useQuery({
    queryKey: creditKeys.balance(),
    queryFn: () => creditService.getBalance(),
  });
  const historyQuery = useQuery({
    queryKey: creditKeys.history(),
    queryFn: () => creditService.getHistory({ limit: 50 }),
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <header className="space-y-1">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary border border-primary/30 px-2.5 py-0.5 text-[11px] font-medium">
          <Coins className="w-3 h-3" />
          {t('community.credit.eyebrow')}
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {t('community.credit.title')}
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          {t('community.credit.subtitle')}
        </p>
      </header>

      <Tabs
        tabs={[
          { id: 'balance', label: t('community.credit.tabs.balance') },
          { id: 'history', label: t('community.credit.tabs.history') },
        ]}
        activeId={active}
        onChange={(id) => setActive(id as TabId)}
      />

      <TabPanel tabListId={tabListId} tabId="balance" active={active === 'balance'}>
        <div className="grid gap-4 md:grid-cols-[auto_1fr]">
          <div className="card-base p-6 flex flex-col items-center justify-center gap-1 md:min-w-[220px]">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('community.credit.balanceLabel')}
            </span>
            {balanceQuery.isLoading ? (
              <Loader2 className="w-6 h-6 text-primary animate-spin mt-1" />
            ) : (
              <span className="font-display text-5xl font-bold tabular-nums text-foreground">
                {balanceQuery.data?.balance ?? 0}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {t('community.credit.balanceUnit')}
            </span>
          </div>
          <div className="card-base p-6 space-y-4">
            <div>
              <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {t('community.credit.earnHeading')}
              </h2>
              <ul className="mt-2 space-y-1.5 text-sm">
                {earnRules.map((rule) => (
                  <li
                    key={rule.reason}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-foreground">{t(rule.labelKey)}</span>
                    <span className="font-medium text-success tabular-nums">
                      +{rule.amount}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-muted-foreground" />
                {t('community.credit.spendHeading')}
              </h2>
              <ul className="mt-2 space-y-1.5 text-sm">
                {spendRules.map((rule) => (
                  <li
                    key={rule.reason}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-foreground">{t(rule.labelKey)}</span>
                    <span className="font-medium text-muted-foreground tabular-nums">
                      −{rule.amount}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </TabPanel>

      <TabPanel tabListId={tabListId} tabId="history" active={active === 'history'}>
        {historyQuery.isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-5 h-5 text-primary animate-spin mx-auto" />
          </div>
        ) : !historyQuery.data || historyQuery.data.entries.length === 0 ? (
          <div className="card-base p-10 text-center">
            <Coins className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="font-display font-semibold text-foreground">
              {t('community.credit.empty.title')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('community.credit.empty.body')}
            </p>
          </div>
        ) : (
          <ul className="card-base divide-y divide-border">
            {historyQuery.data.entries.map((entry, idx) => (
              <li
                key={`${entry.at}-${idx}`}
                className="flex items-center justify-between gap-3 p-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
                      entry.type === 'earn'
                        ? 'bg-success/10 text-success'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {entry.type === 'earn' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {t(`community.credit.reason.${entry.reason}`, {
                        defaultValue: entry.reason,
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    'font-semibold tabular-nums',
                    entry.type === 'earn' ? 'text-success' : 'text-muted-foreground'
                  )}
                >
                  {entry.type === 'earn' ? '+' : '−'}
                  {entry.amount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </TabPanel>
    </div>
  );
};

export default CreditsPage;
