/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Choose — the "What Should I Do Now?" flow. Five quick questions, then three
 * tailored recommendations from the engine.
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Compass, RefreshCw, Anchor } from 'lucide-react';
import { Task, HarborContext, Recommendation, TimeBucket } from '@/src/types';
import { useHarbor } from '@/src/lib/store';
import { getRecommendations, shrinkSuggestions } from '@/src/lib/engine';
import { OptionPills } from './common';
import { RecommendationCard } from './RecommendationCard';
import { ShrinkSheet } from './ShrinkSheet';
import {
  TIME_OPTIONS,
  ENERGY_OPTIONS,
  LOCATION_OPTIONS,
  MODE_OPTIONS,
} from '@/src/lib/options';

interface Props {
  initialContext?: HarborContext;
  onStartTask: (task: Task) => void;
  onBack: () => void;
}

const DEFAULT_CTX: HarborContext = {
  availableMinutes: 30,
  energy: 'medium',
  location: 'anywhere',
  mode: 'focus',
  preference: 'progress',
};

export function Choose({ initialContext, onStartTask, onBack }: Props) {
  const { tasks, snoozeTask, dumpTask } = useHarbor();
  const [step, setStep] = useState(0);
  const [ctx, setCtx] = useState<HarborContext>(initialContext || DEFAULT_CTX);
  const [shrinkTask, setShrinkTask] = useState<Task | null>(null);

  const recs = useMemo<Recommendation[]>(
    () => (step === 5 ? getRecommendations(tasks, ctx) : []),
    [step, tasks, ctx],
  );

  const next = () => setStep((s) => Math.min(5, s + 1));
  const prev = () => (step === 0 ? onBack() : setStep((s) => s - 1));

  const steps = [
    {
      q: 'How much time do you have?',
      el: (
        <OptionPills
          options={TIME_OPTIONS}
          value={ctx.availableMinutes}
          onChange={(v) => setCtx({ ...ctx, availableMinutes: v as TimeBucket })}
          testIdPrefix="choose-time"
        />
      ),
    },
    {
      q: "What's your energy like?",
      el: (
        <OptionPills
          options={ENERGY_OPTIONS}
          value={ctx.energy}
          onChange={(v) => setCtx({ ...ctx, energy: v })}
          testIdPrefix="choose-energy"
        />
      ),
    },
    {
      q: 'Where are you?',
      el: (
        <OptionPills
          options={LOCATION_OPTIONS}
          value={ctx.location}
          onChange={(v) => setCtx({ ...ctx, location: v })}
          testIdPrefix="choose-loc"
        />
      ),
    },
    {
      q: 'What mode are you in?',
      el: (
        <div className="grid grid-cols-2 gap-3">
          {MODE_OPTIONS.map((m) => (
            <button
              key={m.value}
              data-testid={`choose-mode-${m.value}`}
              onClick={() => setCtx({ ...ctx, mode: m.value })}
              className={`text-left p-4 rounded-2xl border-2 transition-all active:scale-95 ${
                ctx.mode === m.value
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-white/50 border-white/40 text-primary hover:bg-white/80'
              }`}
            >
              <p className="font-bold">{m.label}</p>
              <p className={`text-xs mt-0.5 ${ctx.mode === m.value ? 'opacity-80' : 'opacity-60'}`}>
                {m.blurb}
              </p>
            </button>
          ))}
        </div>
      ),
    },
    {
      q: 'Quick win or meaningful progress?',
      el: (
        <OptionPills
          options={[
            { value: 'quick-win', label: 'Quick win' },
            { value: 'progress', label: 'Meaningful progress' },
          ]}
          value={ctx.preference}
          onChange={(v) => setCtx({ ...ctx, preference: v as any })}
          testIdPrefix="choose-pref"
        />
      ),
    },
  ];

  // ---- Results ----
  if (step === 5) {
    return (
      <div className="space-y-8 py-4" data-testid="choose-results">
        <header className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-primary/60 font-bold text-xs uppercase tracking-widest">
            <Compass className="w-4 h-4" /> Charted for you
          </div>
          <h2 className="text-3xl font-bold text-primary">Here's your heading.</h2>
        </header>

        {recs.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-on-surface-variant/70 font-medium">
              Nothing fits this exact moment. Try a brain dump or widen your time.
            </p>
            <button
              data-testid="choose-restart-empty"
              onClick={() => setStep(0)}
              className="px-6 py-3 rounded-full bg-primary text-on-primary font-bold"
            >
              Adjust answers
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {recs.map((rec, i) => (
              <RecommendationCard
                key={rec.task.id}
                rec={rec}
                index={i}
                testId={`rec-card-${rec.slot}`}
                onStart={(r) => onStartTask(r.task)}
                onSnooze={(r) => snoozeTask(r.task.id)}
                onBreak={(r) => setShrinkTask(r.task)}
                onDump={(r) => dumpTask(r.task.id)}
              />
            ))}
          </div>
        )}

        <button
          data-testid="choose-restart"
          onClick={() => setStep(0)}
          className="w-full py-4 rounded-2xl glass text-primary font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <RefreshCw className="w-5 h-5" /> Ask me again
        </button>

        <ShrinkSheet task={shrinkTask} onClose={() => setShrinkTask(null)} />
      </div>
    );
  }

  // ---- Questions ----
  const current = steps[step];
  return (
    <div className="space-y-10 py-4">
      <div className="flex items-center gap-3">
        <button
          data-testid="choose-back"
          onClick={prev}
          className="p-2 rounded-full glass text-primary active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 h-2 bg-white/40 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${((step + 1) / 5) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-xs font-bold text-primary/60">{step + 1}/5</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="space-y-8 min-h-[260px]"
        >
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">{current.q}</h2>
          {current.el}
        </motion.div>
      </AnimatePresence>

      <button
        data-testid="choose-next"
        onClick={next}
        className="w-full py-5 rounded-3xl bg-primary text-on-primary font-bold text-lg flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
      >
        {step === 4 ? (
          <>
            <Anchor className="w-5 h-5" /> Chart my course
          </>
        ) : (
          <>
            Next <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );
}
