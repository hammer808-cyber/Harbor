/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * RecommendationCard — a headline recommendation (Best Bet / Easy Win /
 * Future You Will Thank You) with the four core actions.
 */

import React from 'react';
import { Play, Clock, Zap, Scissors, Trash2, Moon, Compass, Sparkles, Star } from 'lucide-react';
import { Recommendation } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { minutesLabel } from '@/src/lib/options';

const SLOT_META: Record<string, { label: string; icon: React.ReactNode; tone: string }> = {
  'best-bet': { label: 'Best Bet', icon: <Compass className="w-4 h-4" />, tone: 'bg-primary text-on-primary' },
  'easy-win': { label: 'Easy Win', icon: <Sparkles className="w-4 h-4" />, tone: 'bg-secondary text-on-secondary' },
  'future-you': { label: 'Future You Will Thank You', icon: <Star className="w-4 h-4" />, tone: 'bg-tertiary text-on-tertiary' },
};

export function RecommendationCard({
  rec,
  onStart,
  onSnooze,
  onBreak,
  onDump,
  index = 0,
  testId,
}: {
  rec: Recommendation;
  onStart: (r: Recommendation) => void;
  onSnooze: (r: Recommendation) => void;
  onBreak: (r: Recommendation) => void;
  onDump: (r: Recommendation) => void;
  index?: number;
  testId?: string;
}) {
  const meta = SLOT_META[rec.slot || 'best-bet'];
  return (
    <div
      data-testid={testId}
      className="bg-surface-container-lowest rounded-3xl p-6 border border-white/60 misty-shadow space-y-5"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold', meta.tone)}>
          {meta.icon} {meta.label}
        </span>
        <span className="text-xs font-bold text-primary/60">Fit {rec.score}</span>
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-on-surface leading-tight">{rec.task.title}</h3>
        <p className="text-sm text-on-surface-variant/80 italic leading-relaxed">{rec.reason}</p>
      </div>

      <div className="flex items-center gap-4 text-xs font-bold text-on-surface-variant/70">
        <span className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" /> {minutesLabel(rec.task.estimatedMinutes)}
        </span>
        <span className="flex items-center gap-1.5 capitalize">
          <Zap className="w-4 h-4" /> {rec.task.energyRequired} energy
        </span>
      </div>

      <button
        data-testid={testId ? `${testId}-start` : undefined}
        onClick={() => onStart(rec)}
        className="w-full py-4 rounded-2xl bg-primary text-on-primary font-bold text-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
      >
        <Play className="w-5 h-5 fill-current" /> Start
      </button>

      <div className="grid grid-cols-3 gap-2">
        <MiniAction testId={testId ? `${testId}-snooze` : undefined} icon={<Moon className="w-4 h-4" />} label="Snooze" onClick={() => onSnooze(rec)} />
        <MiniAction testId={testId ? `${testId}-break` : undefined} icon={<Scissors className="w-4 h-4" />} label="Break it" onClick={() => onBreak(rec)} />
        <MiniAction testId={testId ? `${testId}-dump` : undefined} icon={<Trash2 className="w-4 h-4" />} label="Dump" onClick={() => onDump(rec)} />
      </div>
    </div>
  );
}

function MiniAction({
  icon,
  label,
  onClick,
  testId,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  testId?: string;
}) {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      className="py-2.5 rounded-xl bg-surface-container-high/70 text-on-surface-variant font-bold text-xs flex flex-col items-center gap-1 hover:bg-surface-container-high active:scale-95 transition-all"
    >
      {icon}
      {label}
    </button>
  );
}
