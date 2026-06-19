/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Today (Daily Harbor) — the control panel. Best Bet, quick wins, overdue,
 * docked, energy-friendly tasks, a mode selector and "Help me choose".
 */

import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Compass, Plus, AlertTriangle, Moon, Sparkles, Play, LifeBuoy, Anchor, Zap, Clock,
} from 'lucide-react';
import { Task, SkyState, Mode, HarborContext } from '@/src/types';
import { useHarbor } from '@/src/lib/store';
import {
  getRecommendations, isOverdue, isAvailable, contextFromSky,
} from '@/src/lib/engine';
import { MODE_OPTIONS, minutesLabel } from '@/src/lib/options';
import { TaskEditor } from './TaskEditor';
import { EmptyState } from './common';

interface Props {
  skyState: SkyState;
  onStartTask: (t: Task) => void;
  onNavigate: (screen: 'dump' | 'choose' | 'doordump' | 'projects' | 'current' | 'deep') => void;
}

export function Today({ skyState, onStartTask, onNavigate }: Props) {
  const { tasks } = useHarbor();
  const [mode, setMode] = useState<Mode>(contextFromSky(skyState).mode);
  const [adding, setAdding] = useState(false);

  const ctx: HarborContext = useMemo(
    () => ({ ...contextFromSky(skyState), mode }),
    [skyState, mode],
  );

  const available = useMemo(() => tasks.filter(isAvailable), [tasks]);
  const recs = useMemo(() => getRecommendations(available, ctx), [available, ctx]);
  const bestBet = recs[0];

  const quickWins = useMemo(
    () => available.filter((t) => t.isQuickWin || (t.friction === 'easy' && t.estimatedMinutes <= 15)).slice(0, 3),
    [available],
  );
  const overdue = useMemo(
    () => available.filter((t) => isOverdue(t) && t.importance !== 'low').slice(0, 3),
    [available],
  );
  const docked = useMemo(
    () => tasks.filter((t) => t.status === 'docked').slice(0, 3),
    [tasks],
  );
  const energyFriendly = useMemo(
    () => available.filter((t) => t.energyRequired === ctx.energy && !t.isQuickWin).slice(0, 3),
    [available, ctx.energy],
  );

  const totalEmpty = available.length === 0 && docked.length === 0;

  return (
    <div className="space-y-8 pb-8 pt-2" data-testid="today-dashboard">
      <header className="space-y-1">
        <p className="text-sm font-bold text-primary uppercase tracking-widest opacity-60">
          Harbor Control
        </p>
        <h2 className="text-3xl font-bold text-on-surface tracking-tight">
          What's the move?
        </h2>
      </header>

      {/* Mode selector */}
      <section>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1" data-testid="mode-selector">
          {MODE_OPTIONS.map((m) => (
            <button
              key={m.value}
              data-testid={`mode-${m.value}`}
              onClick={() => setMode(m.value)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2 active:scale-95 ${
                mode === m.value
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-white/50 border-white/40 text-primary'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </section>

      {totalEmpty ? (
        <EmptyState
          testId="today-empty"
          icon={<Anchor className="w-9 h-9" />}
          title="Your harbor is empty"
          blurb="Pour your thoughts into a brain dump and Harbor will sort them into tasks."
          action={
            <button
              data-testid="today-empty-dump"
              onClick={() => onNavigate('dump')}
              className="px-6 py-3 rounded-full bg-primary text-on-primary font-bold active:scale-95"
            >
              Start a brain dump
            </button>
          }
        />
      ) : (
        <>
          {/* Best Bet */}
          {bestBet && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-3xl bg-primary p-6 text-on-primary misty-shadow"
              data-testid="today-bestbet"
            >
              <div className="relative z-10 space-y-4">
                <span className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                  <Compass className="w-3.5 h-3.5" /> Today's Best Bet
                </span>
                <div className="space-y-1.5">
                  <h3 className="text-2xl font-bold leading-tight">{bestBet.task.title}</h3>
                  <p className="text-sm opacity-90 italic">{bestBet.reason}</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold opacity-90">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{minutesLabel(bestBet.task.estimatedMinutes)}</span>
                  <span className="flex items-center gap-1.5 capitalize"><Zap className="w-4 h-4" />{bestBet.task.energyRequired}</span>
                </div>
                <button
                  data-testid="today-bestbet-start"
                  onClick={() => onStartTask(bestBet.task)}
                  className="bg-on-primary text-primary px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all"
                >
                  Launch <Play className="w-4 h-4 fill-current" />
                </button>
              </div>
              <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            </motion.section>
          )}

          {/* Help me choose + quick add */}
          <section className="grid grid-cols-2 gap-3">
            <button
              data-testid="help-me-choose"
              onClick={() => onNavigate('choose')}
              className="p-5 rounded-3xl bg-secondary-container text-on-secondary-container flex flex-col items-center gap-2 misty-shadow active:scale-95 transition-all"
            >
              <Compass className="w-7 h-7" />
              <span className="font-bold">Help me choose</span>
            </button>
            <button
              data-testid="today-braindump"
              onClick={() => onNavigate('dump')}
              className="p-5 rounded-3xl bg-tertiary-container text-on-tertiary-container flex flex-col items-center gap-2 misty-shadow active:scale-95 transition-all"
            >
              <Plus className="w-7 h-7" />
              <span className="font-bold">Brain Dump</span>
            </button>
          </section>

          {/* Quick Wins */}
          <TaskRow
            testId="row-quickwins"
            icon={<Sparkles className="w-5 h-5" />}
            title="Quick Wins"
            tasks={quickWins}
            empty="No quick wins right now — add a small task."
            onStartTask={onStartTask}
          />

          {/* Overdue but important */}
          {overdue.length > 0 && (
            <TaskRow
              testId="row-overdue"
              icon={<AlertTriangle className="w-5 h-5" />}
              title="Overdue, still worth it"
              tasks={overdue}
              tone="warn"
              onStartTask={onStartTask}
            />
          )}

          {/* Energy-friendly */}
          <TaskRow
            testId="row-energy"
            icon={<Zap className="w-5 h-5" />}
            title={`Good for ${ctx.energy} energy`}
            tasks={energyFriendly}
            empty="Nothing matched this energy — try Help me choose."
            onStartTask={onStartTask}
          />

          {/* Docked for later */}
          {docked.length > 0 && (
            <TaskRow
              testId="row-docked"
              icon={<Moon className="w-5 h-5" />}
              title="Docked for Later"
              tasks={docked}
              onStartTask={onStartTask}
            />
          )}

          {/* Do or Dump entry */}
          <button
            data-testid="today-doordump"
            onClick={() => onNavigate('doordump')}
            className="w-full py-4 rounded-2xl glass text-primary font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <LifeBuoy className="w-5 h-5" /> Do or Dump — clear the drift
          </button>
        </>
      )}

      <button
        data-testid="today-add-fab"
        onClick={() => setAdding(true)}
        className="fixed bottom-28 right-6 z-40 w-14 h-14 rounded-full bg-primary text-on-primary shadow-2xl flex items-center justify-center active:scale-90 transition-all"
      >
        <Plus className="w-7 h-7" />
      </button>

      <TaskEditor open={adding} onClose={() => setAdding(false)} />
    </div>
  );
}

function TaskRow({
  icon, title, tasks, empty, tone, onStartTask, testId,
}: {
  icon: React.ReactNode;
  title: string;
  tasks: Task[];
  empty?: string;
  tone?: 'warn';
  onStartTask: (t: Task) => void;
  testId: string;
}) {
  return (
    <section className="space-y-3" data-testid={testId}>
      <h4 className="text-lg font-bold text-on-surface flex items-center gap-2">
        <span className={tone === 'warn' ? 'text-tertiary' : 'text-primary'}>{icon}</span>
        {title}
      </h4>
      {tasks.length === 0 ? (
        empty ? (
          <p className="text-sm text-on-surface-variant/60 italic px-1">{empty}</p>
        ) : null
      ) : (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-6 px-6 pb-1">
          {tasks.map((t) => (
            <button
              key={t.id}
              data-testid={`${testId}-task-${t.id}`}
              onClick={() => onStartTask(t)}
              className="w-52 shrink-0 text-left bg-surface-container-lowest rounded-2xl p-4 border border-surface-container-high hover:misty-shadow active:scale-[0.98] transition-all space-y-3"
            >
              <p className="font-bold text-on-surface leading-snug line-clamp-2 min-h-[2.5rem]">{t.title}</p>
              <div className="flex items-center justify-between text-xs font-bold text-on-surface-variant/60">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{minutesLabel(t.estimatedMinutes)}</span>
                <span className="flex items-center gap-1 text-primary"><Play className="w-3.5 h-3.5 fill-current" />Launch</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
