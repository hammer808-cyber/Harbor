/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * TaskEditor — a bottom sheet to create or edit a task with every Harbor field.
 */

import React, { useState } from 'react';
import { Anchor } from 'lucide-react';
import { Task } from '@/src/types';
import { useHarbor } from '@/src/lib/store';
import { Sheet, OptionPills, FieldLabel } from './common';
import {
  CATEGORY_OPTIONS,
  ENERGY_OPTIONS,
  FRICTION_OPTIONS,
  LOCATION_OPTIONS,
  URGENCY_OPTIONS,
  IMPORTANCE_OPTIONS,
  EMOTION_OPTIONS,
  TIME_OPTIONS,
} from '@/src/lib/options';

interface Props {
  open: boolean;
  onClose: () => void;
  task?: Task | null; // when present we're editing
}

export function TaskEditor({ open, onClose, task }: Props) {
  const { addTask, updateTask } = useHarbor();
  const [draft, setDraft] = useState<Partial<Task>>(blank());

  // re-seed the form whenever the sheet opens
  React.useEffect(() => {
    if (open) setDraft(task ? { ...task } : blank());
  }, [open, task]);

  const set = (patch: Partial<Task>) => setDraft((d) => ({ ...d, ...patch }));

  const save = () => {
    if (!draft.title || !draft.title.trim()) return;
    if (task) updateTask(task.id, draft);
    else addTask({ ...(draft as any), title: draft.title.trim() });
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={task ? 'Edit task' : 'New task'}
      testId="task-editor-sheet"
    >
      <div className="space-y-5">
        <div>
          <FieldLabel>Title</FieldLabel>
          <input
            data-testid="task-title-input"
            value={draft.title || ''}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="What needs doing?"
            className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border-2 border-surface-container-high focus:border-primary outline-none font-semibold text-lg"
          />
        </div>

        <div>
          <FieldLabel>Notes</FieldLabel>
          <textarea
            data-testid="task-notes-input"
            value={draft.notes || ''}
            onChange={(e) => set({ notes: e.target.value })}
            placeholder="Anything to remember…"
            className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border-2 border-surface-container-high focus:border-primary outline-none resize-none min-h-[70px]"
          />
        </div>

        <Group label="Category">
          <OptionPills size="sm" options={CATEGORY_OPTIONS} value={draft.category} onChange={(v) => set({ category: v })} testIdPrefix="cat" />
        </Group>

        <div className="grid grid-cols-2 gap-4">
          <Group label="Time needed">
            <OptionPills size="sm" options={TIME_OPTIONS} value={draft.estimatedMinutes as any} onChange={(v) => set({ estimatedMinutes: Number(v) })} testIdPrefix="time" />
          </Group>
          <Group label="Energy">
            <OptionPills size="sm" options={ENERGY_OPTIONS} value={draft.energyRequired} onChange={(v) => set({ energyRequired: v })} testIdPrefix="energy" />
          </Group>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Group label="Location">
            <OptionPills size="sm" options={LOCATION_OPTIONS} value={draft.location} onChange={(v) => set({ location: v })} testIdPrefix="loc" />
          </Group>
          <Group label="Friction">
            <OptionPills size="sm" options={FRICTION_OPTIONS} value={draft.friction} onChange={(v) => set({ friction: v })} testIdPrefix="friction" />
          </Group>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Group label="Urgency">
            <OptionPills size="sm" options={URGENCY_OPTIONS} value={draft.urgency} onChange={(v) => set({ urgency: v })} testIdPrefix="urgency" />
          </Group>
          <Group label="Importance">
            <OptionPills size="sm" options={IMPORTANCE_OPTIONS} value={draft.importance} onChange={(v) => set({ importance: v })} testIdPrefix="importance" />
          </Group>
        </div>

        <Group label="Emotional weight">
          <OptionPills size="sm" options={EMOTION_OPTIONS} value={draft.emotionalWeight} onChange={(v) => set({ emotionalWeight: v })} testIdPrefix="emotion" />
        </Group>

        <div>
          <FieldLabel>Deadline (optional)</FieldLabel>
          <input
            data-testid="task-deadline-input"
            type="date"
            value={draft.deadline ? draft.deadline.slice(0, 10) : ''}
            onChange={(e) =>
              set({ deadline: e.target.value ? new Date(e.target.value).toISOString() : undefined })
            }
            className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border-2 border-surface-container-high focus:border-primary outline-none font-semibold"
          />
        </div>

        <label className="flex items-center gap-3 py-1 cursor-pointer">
          <input
            data-testid="task-quickwin-input"
            type="checkbox"
            checked={!!draft.isQuickWin}
            onChange={(e) => set({ isQuickWin: e.target.checked })}
            className="w-5 h-5 accent-primary"
          />
          <span className="font-bold text-on-surface">Mark as a quick win</span>
        </label>

        <button
          data-testid="task-save-btn"
          onClick={save}
          disabled={!draft.title || !draft.title.trim()}
          className="w-full py-4 rounded-2xl bg-primary text-on-primary font-bold text-lg flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all disabled:opacity-40"
        >
          <Anchor className="w-5 h-5" />
          {task ? 'Save changes' : 'Add to Harbor'}
        </button>
      </div>
    </Sheet>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

function blank(): Partial<Task> {
  return {
    title: '',
    notes: '',
    category: 'personal',
    estimatedMinutes: 15,
    energyRequired: 'medium',
    location: 'anywhere',
    urgency: 'flexible',
    importance: 'medium',
    friction: 'medium',
    emotionalWeight: 'neutral',
    isQuickWin: false,
  };
}
