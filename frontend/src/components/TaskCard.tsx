/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * TaskCard — a big, tappable card showing a task and its quick actions.
 */

import React from 'react';
import { Play, Clock, Zap, MapPin, MoreHorizontal, Anchor } from 'lucide-react';
import { Task } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { Badge } from './common';
import { minutesLabel, CATEGORY_OPTIONS, LOCATION_OPTIONS } from '@/src/lib/options';
import { isOverdue } from '@/src/lib/engine';

const catLabel = (v: string) =>
  CATEGORY_OPTIONS.find((c) => c.value === v)?.label || v;
const locLabel = (v: string) =>
  LOCATION_OPTIONS.find((c) => c.value === v)?.label || v;

export function TaskCard({
  task,
  onStart,
  onEdit,
  testId,
}: {
  task: Task;
  onStart?: (t: Task) => void;
  onEdit?: (t: Task) => void;
  testId?: string;
}) {
  const overdue = isOverdue(task) && task.status !== 'completed';
  return (
    <div
      data-testid={testId}
      className="bg-surface-container-lowest rounded-3xl p-5 border border-surface-container-high misty-shadow space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1.5 mb-2">
            <Badge tone="primary">{catLabel(task.category)}</Badge>
            {task.isQuickWin && <Badge tone="good">Quick win</Badge>}
            {overdue && <Badge tone="warn">Overdue</Badge>}
          </div>
          <h4 className="text-lg font-bold text-on-surface leading-snug break-words">
            {task.title}
          </h4>
          {task.notes && (
            <p className="text-sm text-on-surface-variant/70 mt-1 line-clamp-2">
              {task.notes}
            </p>
          )}
        </div>
        {onEdit && (
          <button
            data-testid={testId ? `${testId}-edit` : undefined}
            onClick={() => onEdit(task)}
            className="p-2 -mr-1 -mt-1 text-on-surface-variant/50 hover:text-primary rounded-full"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs font-bold text-on-surface-variant/70">
        <span className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" /> {minutesLabel(task.estimatedMinutes)}
        </span>
        <span className="flex items-center gap-1.5 capitalize">
          <Zap className="w-4 h-4" /> {task.energyRequired}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4" /> {locLabel(task.location)}
        </span>
      </div>

      {onStart && task.status !== 'completed' && (
        <button
          data-testid={testId ? `${testId}-start` : undefined}
          onClick={() => onStart(task)}
          className={cn(
            'w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all',
            'bg-primary-container/40 text-on-primary-container hover:bg-primary-container/60',
          )}
        >
          <Play className="w-4 h-4 fill-current" /> Launch
        </button>
      )}
      {task.status === 'completed' && (
        <div className="w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 bg-secondary-container/40 text-on-secondary-container">
          <Anchor className="w-4 h-4" /> Safely harbored
        </div>
      )}
    </div>
  );
}
