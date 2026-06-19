/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * DoOrDump — a gentle decision tool for stale / avoided tasks. One card at a
 * time: four honest questions, then a verdict (Do Now / Dock / Shrink / Dump).
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Anchor, Moon, Scissors, Trash2, Play, LifeBuoy } from 'lucide-react';
import { Task } from '@/src/types';
import { useHarbor } from '@/src/lib/store';
import { isOverdue } from '@/src/lib/engine';
import { EmptyState, Badge } from './common';
import { ShrinkSheet } from './ShrinkSheet';
import { minutesLabel } from '@/src/lib/options';

interface Props {
  onStartTask: (task: Task) => void;
  onBack: () => void;
}

const QUESTIONS = [
  'Is this still necessary?',
  'Is there a real consequence if it does not get done?',
  'Could it shrink to a smaller action?',
  'Could it be delegated, delayed, or deleted?',
];

export function DoOrDump({ onStartTask, onBack }: Props) {
  const { tasks, dockTask, dumpTask, snoozeTask } = useHarbor();
  const [shrinkTask, setShrinkTask] = useState<Task | null>(null);

  // Candidate pile: active/docked tasks, oldest & most avoided first.
  const stale = useMemo(() => {
    return tasks
      .filter((t) => t.status === 'active' || t.status === 'docked')
      .sort((a, b) => avoidScore(b) - avoidScore(a));
  }, [tasks]);

  const [index, setIndex] = useState(0);
  const task = stale[index];

  const advance = () => setIndex((i) => i + 1);

  if (!task || index >= stale.length) {
    return (
      <div className="py-4">
        <EmptyState
          testId="doordump-empty"
          icon={<LifeBuoy className="w-9 h-9" />}
          title="Nothing left to weigh"
          blurb="You've sorted the drifting tasks. Your harbor is clear of dead weight."
          action={
            <button
              data-testid="doordump-done"
              onClick={onBack}
              className="px-6 py-3 rounded-full bg-primary text-on-primary font-bold active:scale-95"
            >
              Back to Harbor
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4" data-testid="doordump-screen">
      <header className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-primary/60 font-bold text-xs uppercase tracking-widest">
          <LifeBuoy className="w-4 h-4" /> Do or Dump
        </div>
        <h2 className="text-3xl font-bold text-primary">Weigh the anchor.</h2>
        <p className="text-on-surface-variant/70">
          {index + 1} of {stale.length} drifting
        </p>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={task.id}
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -12 }}
          transition={{ duration: 0.25 }}
          className="bg-surface-container-lowest rounded-3xl p-6 border border-white/60 misty-shadow space-y-5"
        >
          <div className="flex flex-wrap gap-1.5">
            {isOverdue(task) && <Badge tone="warn">Overdue</Badge>}
            <Badge tone="neutral">{minutesLabel(task.estimatedMinutes)}</Badge>
            <Badge tone="primary">{task.category}</Badge>
          </div>
          <h3 className="text-2xl font-bold text-on-surface leading-tight">{task.title}</h3>

          <ul className="space-y-2">
            {QUESTIONS.map((q, i) => (
              <li
                key={i}
                className="text-on-surface-variant/80 font-medium flex gap-2 text-sm leading-relaxed"
              >
                <span className="text-primary font-bold">·</span> {q}
              </li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-3">
        <Verdict
          testId="verdict-do"
          icon={<Play className="w-5 h-5 fill-current" />}
          label="Do Now"
          tone="bg-primary text-on-primary"
          onClick={() => onStartTask(task)}
        />
        <Verdict
          testId="verdict-dock"
          icon={<Moon className="w-5 h-5" />}
          label="Dock for Later"
          tone="bg-primary-container/50 text-on-primary-container"
          onClick={() => {
            snoozeTask(task.id, new Date(Date.now() + 3 * 86400000).toISOString());
            dockTask(task.id);
            advance();
          }}
        />
        <Verdict
          testId="verdict-shrink"
          icon={<Scissors className="w-5 h-5" />}
          label="Shrink It"
          tone="bg-secondary-container/60 text-on-secondary-container"
          onClick={() => setShrinkTask(task)}
        />
        <Verdict
          testId="verdict-dump"
          icon={<Trash2 className="w-5 h-5" />}
          label="Dump It"
          tone="bg-tertiary-container/50 text-on-tertiary-container"
          onClick={() => {
            dumpTask(task.id);
            advance();
          }}
        />
      </div>

      <button
        data-testid="doordump-skip"
        onClick={advance}
        className="w-full py-3 text-on-surface-variant/60 font-bold hover:text-primary transition-colors flex items-center justify-center gap-2"
      >
        <Anchor className="w-4 h-4" /> Keep it as-is, next
      </button>

      <ShrinkSheet
        task={shrinkTask}
        onClose={() => {
          if (shrinkTask) {
            dockTask(shrinkTask.id);
            advance();
          }
          setShrinkTask(null);
        }}
      />
    </div>
  );
}

function Verdict({
  icon,
  label,
  tone,
  onClick,
  testId,
}: {
  icon: React.ReactNode;
  label: string;
  tone: string;
  onClick: () => void;
  testId: string;
}) {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      className={`py-5 rounded-2xl font-bold flex flex-col items-center gap-2 active:scale-95 transition-all shadow-md ${tone}`}
    >
      {icon}
      {label}
    </button>
  );
}

// How "avoided" a task is, for ordering the pile.
function avoidScore(t: Task): number {
  let s = 0;
  if (isOverdue(t)) s += 4;
  if (t.emotionalWeight === 'overwhelming') s += 3;
  if (t.emotionalWeight === 'annoying') s += 2;
  if (t.importance === 'low') s += 1;
  const ageDays = (Date.now() - new Date(t.createdAt).getTime()) / 86400000;
  s += Math.min(5, ageDays / 5);
  return s;
}
