/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Current (The Current) — the full list of live tasks with light filtering.
 */

import React, { useMemo, useState } from 'react';
import { Waves, Plus } from 'lucide-react';
import { Task } from '@/src/types';
import { useHarbor } from '@/src/lib/store';
import { TaskCard } from './TaskCard';
import { TaskEditor } from './TaskEditor';
import { EmptyState } from './common';

const FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Sailing' },
  { value: 'docked', label: 'Docked' },
  { value: 'snoozed', label: 'Drifting' },
];

export function Current({ onStartTask }: { onStartTask: (t: Task) => void }) {
  const { tasks } = useHarbor();
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState<Task | null>(null);
  const [adding, setAdding] = useState(false);

  const list = useMemo(() => {
    const live = tasks.filter((t) => t.status !== 'completed' && t.status !== 'dumped');
    if (filter === 'all') return live;
    return live.filter((t) => t.status === filter);
  }, [tasks, filter]);

  return (
    <div className="space-y-6 py-4" data-testid="current-screen">
      <header className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-primary/60 font-bold text-xs uppercase tracking-widest">
            <Waves className="w-4 h-4" /> The Current
          </div>
          <h2 className="text-3xl font-bold text-primary mt-1">Your tasks</h2>
        </div>
        <button
          data-testid="current-add-btn"
          onClick={() => setAdding(true)}
          className="p-3 rounded-full bg-primary text-on-primary shadow-lg active:scale-95"
        >
          <Plus className="w-6 h-6" />
        </button>
      </header>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            data-testid={`current-filter-${f.value}`}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2 ${
              filter === f.value
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-white/50 border-white/40 text-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          testId="current-empty"
          icon={<Waves className="w-9 h-9" />}
          title="Calm waters"
          blurb="No tasks here yet. Capture a few in a brain dump, or add one directly."
          action={
            <button
              onClick={() => setAdding(true)}
              className="px-6 py-3 rounded-full bg-primary text-on-primary font-bold active:scale-95"
            >
              Add a task
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {list.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              testId={`current-task-${t.id}`}
              onStart={onStartTask}
              onEdit={setEditing}
            />
          ))}
        </div>
      )}

      <TaskEditor open={!!editing} task={editing} onClose={() => setEditing(null)} />
      <TaskEditor open={adding} onClose={() => setAdding(false)} />
    </div>
  );
}
