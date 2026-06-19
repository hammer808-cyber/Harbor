/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * The Deep — visible archive of dumped tasks (recoverable) plus completed ones.
 */

import React, { useMemo, useState } from 'react';
import { Anchor, RotateCcw, Trash2, Waves } from 'lucide-react';
import { useHarbor } from '@/src/lib/store';
import { EmptyState, Badge } from './common';
import { minutesLabel } from '@/src/lib/options';

export function Deep() {
  const { tasks, restoreTask, deleteTask } = useHarbor();
  const [tab, setTab] = useState<'dumped' | 'completed'>('dumped');

  const dumped = useMemo(() => tasks.filter((t) => t.status === 'dumped'), [tasks]);
  const completed = useMemo(
    () =>
      tasks
        .filter((t) => t.status === 'completed')
        .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || '')),
    [tasks],
  );

  const list = tab === 'dumped' ? dumped : completed;

  return (
    <div className="space-y-6 py-4" data-testid="deep-screen">
      <header>
        <div className="inline-flex items-center gap-2 text-primary/60 font-bold text-xs uppercase tracking-widest">
          <Waves className="w-4 h-4" /> The Deep
        </div>
        <h2 className="text-3xl font-bold text-primary mt-1">
          {tab === 'dumped' ? 'Dumped, not gone' : 'Safe Harbor'}
        </h2>
        <p className="text-on-surface-variant/70 mt-1">
          {tab === 'dumped'
            ? 'Anything here can be pulled back up.'
            : 'Everything you’ve safely landed.'}
        </p>
      </header>

      <div className="flex gap-2">
        <TabBtn active={tab === 'dumped'} label="The Deep" count={dumped.length} onClick={() => setTab('dumped')} testId="deep-tab-dumped" />
        <TabBtn active={tab === 'completed'} label="Safe Harbor" count={completed.length} onClick={() => setTab('completed')} testId="deep-tab-completed" />
      </div>

      {list.length === 0 ? (
        <EmptyState
          testId="deep-empty"
          icon={tab === 'dumped' ? <Trash2 className="w-9 h-9" /> : <Anchor className="w-9 h-9" />}
          title={tab === 'dumped' ? 'Nothing in The Deep' : 'Nothing harbored yet'}
          blurb={
            tab === 'dumped'
              ? 'Tasks you dump will rest here, ready to recover if you change your mind.'
              : 'Completed tasks will gather here as proof of your tides.'
          }
        />
      ) : (
        <div className="space-y-3">
          {list.map((t) => (
            <div
              key={t.id}
              data-testid={`deep-task-${t.id}`}
              className="bg-surface-container-lowest rounded-2xl p-4 border border-surface-container-high flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p
                  className={`font-bold text-on-surface truncate ${
                    tab === 'completed' ? 'line-through opacity-60' : ''
                  }`}
                >
                  {t.title}
                </p>
                <div className="flex gap-1.5 mt-1.5">
                  <Badge tone="neutral">{t.category}</Badge>
                  <Badge tone="neutral">{minutesLabel(t.estimatedMinutes)}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  data-testid={`deep-restore-${t.id}`}
                  onClick={() => restoreTask(t.id)}
                  title="Recover"
                  className="p-2.5 rounded-full bg-primary-container/40 text-on-primary-container hover:bg-primary-container/60 active:scale-90 transition-all"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                {tab === 'dumped' && (
                  <button
                    data-testid={`deep-delete-${t.id}`}
                    onClick={() => deleteTask(t.id)}
                    title="Delete forever"
                    className="p-2.5 rounded-full bg-tertiary-container/30 text-on-tertiary-container hover:bg-tertiary-container/50 active:scale-90 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabBtn({
  active,
  label,
  count,
  onClick,
  testId,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
  testId: string;
}) {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      className={`flex-1 py-3 rounded-2xl font-bold transition-all border-2 ${
        active ? 'bg-primary text-on-primary border-primary' : 'bg-white/50 border-white/40 text-primary'
      }`}
    >
      {label} <span className="opacity-60">({count})</span>
    </button>
  );
}
