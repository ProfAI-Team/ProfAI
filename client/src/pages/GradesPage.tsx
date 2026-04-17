import React, { useState } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';

import { gradeService } from '../services/gradeService';
import GpaCalculator from '../components/GpaCalculator';
import type {
  GpaResult,
  GpaSimulationResult,
  GradeRecord,
  UniversityKey,
} from '../types/dna';

const UNI_KEYS: UniversityKey[] = ['aydin', 'bogazici', 'odtu'];

const GradesPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'list' | 'simulator'>('list');
  const [university, setUniversity] = useState<UniversityKey>('aydin');
  const [draft, setDraft] = useState<{
    courseName: string;
    grade: number;
    credit: number;
    semester: string;
  }>({ courseName: '', grade: 80, credit: 3, semester: '2026-Spring' });
  const [simulation, setSimulation] = useState<GpaSimulationResult | null>(null);

  const gradesQuery = useQuery<GradeRecord[]>({
    queryKey: ['grades', 'me'],
    queryFn: () => gradeService.list(),
    staleTime: 30_000,
  });
  const gpaQuery = useQuery<GpaResult>({
    queryKey: ['grades', 'gpa', university],
    queryFn: () => gradeService.getGPA({ university }),
    staleTime: 30_000,
  });

  const addMutation = useMutation({
    mutationFn: () =>
      gradeService.add({ ...draft, university }),
    onSuccess: () => {
      setDraft({ courseName: '', grade: 80, credit: 3, semester: draft.semester });
      queryClient.invalidateQueries({ queryKey: ['grades', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['grades', 'gpa'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => gradeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['grades', 'gpa'] });
    },
  });

  const simulateMutation = useMutation({
    mutationFn: (input: {
      courseName: string;
      hypotheticalGrade: number;
      credit: number;
      university: UniversityKey;
    }) => gradeService.simulate(input),
    onSuccess: setSimulation,
  });

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-8 space-y-6">
      <header className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground">
            {t('grades.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('grades.subtitle')}
          </p>
        </div>
      </header>

      <div className="card-base p-4 sm:p-5 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-foreground">
          {t('grades.gpa.label')}
        </span>
        <span className="text-xl font-display font-semibold text-primary">
          {gpaQuery.data?.gpa?.toFixed(2) ?? '—'}
        </span>
        <span className="text-xs text-muted-foreground">
          ({gpaQuery.data?.totalCredits ?? 0} {t('grades.gpa.credits')})
        </span>
        <div className="ml-auto">
          <select
            className="input-base"
            value={university}
            onChange={(e) => setUniversity(e.target.value as UniversityKey)}
          >
            {UNI_KEYS.map((k) => (
              <option key={k} value={k}>
                {t(`grades.university.${k}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <nav className="flex gap-2 border-b border-border">
        {(['list', 'simulator'] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === k
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t(`grades.tab.${k}`)}
          </button>
        ))}
      </nav>

      {tab === 'list' && (
        <div className="space-y-4">
          <section className="card-base p-5 sm:p-6 space-y-3">
            <h2 className="font-display font-semibold text-foreground">
              {t('grades.add.title')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder={t('grades.add.courseName')}
                className="input-base sm:col-span-2"
                value={draft.courseName}
                onChange={(e) =>
                  setDraft({ ...draft, courseName: e.target.value })
                }
              />
              <input
                type="number"
                min={0}
                max={100}
                className="input-base"
                value={draft.grade}
                onChange={(e) =>
                  setDraft({ ...draft, grade: Number(e.target.value) })
                }
              />
              <input
                type="number"
                min={1}
                max={20}
                className="input-base"
                value={draft.credit}
                onChange={(e) =>
                  setDraft({ ...draft, credit: Number(e.target.value) })
                }
              />
              <input
                type="text"
                className="input-base sm:col-span-3"
                value={draft.semester}
                onChange={(e) =>
                  setDraft({ ...draft, semester: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => addMutation.mutate()}
                disabled={!draft.courseName || addMutation.isPending}
                className="btn-primary flex items-center gap-2 justify-center"
              >
                <Plus className="w-4 h-4" />
                {t('grades.add.submit')}
              </button>
            </div>
          </section>

          <section className="card-base divide-y divide-border">
            {gradesQuery.isLoading ? (
              <div className="p-5 text-sm text-muted-foreground">
                {t('common.loading')}
              </div>
            ) : !gradesQuery.data || gradesQuery.data.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                {t('grades.list.empty')}
              </div>
            ) : (
              gradesQuery.data.map((row) => (
                <div
                  key={row.id}
                  className="p-4 flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {row.courseName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {row.semester} · {row.credit} {t('grades.list.credit')}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display font-semibold text-primary">
                      {row.letterGrade}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {row.grade.toFixed(0)}/100
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-ghost text-muted-foreground"
                    onClick={() => deleteMutation.mutate(row.id)}
                    aria-label={t('grades.list.delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </section>
        </div>
      )}

      {tab === 'simulator' && (
        <div className="space-y-4">
          <section className="card-base p-5 sm:p-6">
            <h2 className="font-display font-semibold text-foreground mb-3">
              {t('grades.simulator.title')}
            </h2>
            <GpaCalculator
              submitting={simulateMutation.isPending}
              onSimulate={(input) => simulateMutation.mutate(input)}
            />
          </section>
          {simulation && (
            <section className="card-base p-5 sm:p-6">
              <p className="text-sm text-muted-foreground">
                {t('grades.simulator.result')}
              </p>
              <p className="text-2xl font-display font-semibold text-primary mt-1">
                {simulation.gpa?.toFixed(2) ?? '—'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ({simulation.totalCredits} {t('grades.gpa.credits')})
              </p>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default GradesPage;
