/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ShrinkSheet — "Break into a smaller step". Offers the four shrink moves and
 * can save the chosen tiny step as its own quick-win task.
 */

import React from 'react';
import { Scissors, Plus } from 'lucide-react';
import { Task } from '@/src/types';
import { useHarbor } from '@/src/lib/store';
import { shrinkSuggestions } from '@/src/lib/engine';
import { Sheet } from './common';

export function ShrinkSheet({
  task,
  onClose,
}: {
  task: Task | null;
  onClose: () => void;
}) {
  const { addTask } = useHarbor();
  if (!task) return null;
  const suggestions = shrinkSuggestions(task);

  const saveStep = (text: string) => {
    addTask({
      title: text.replace(/^[^:]*:\s*/, ''),
      category: task.category,
      estimatedMinutes: 10,
      energyRequired: 'low',
      friction: 'easy',
      location: task.location,
      isQuickWin: true,
      importance: task.importance,
      notes: `Shrunk from: ${task.title}`,
    });
    onClose();
  };

  return (
    <Sheet
      open={!!task}
      onClose={onClose}
      title="Shrink it down"
      testId="shrink-sheet"
    >
      <p className="text-on-surface-variant/80 mb-5 flex items-center gap-2 font-medium">
        <Scissors className="w-4 h-4" />
        Pick one tiny move for "{task.title}".
      </p>
      <div className="space-y-3">
        {suggestions.map((s, i) => (
          <button
            key={i}
            data-testid={`shrink-option-${i}`}
            onClick={() => saveStep(s)}
            className="w-full text-left p-4 rounded-2xl bg-surface-container-low border-2 border-surface-container-high hover:border-primary transition-all active:scale-[0.98] flex items-start gap-3"
          >
            <Plus className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <span className="font-semibold text-on-surface">{s}</span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}
