/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Projects (The Fleet) — bigger efforts broken into a single visible next step.
 */

import React, { useState } from 'react';
import { Ship, Plus, Flag, ArrowRight, Anchor, CircleDot } from 'lucide-react';
import { Project, ProjectStatus, Task } from '@/src/types';
import { useHarbor } from '@/src/lib/store';
import { Sheet, EmptyState, Badge, OptionPills, FieldLabel } from './common';

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'docked', label: 'Docked' },
  { value: 'active', label: 'Active' },
  { value: 'stuck', label: 'Stuck' },
  { value: 'completed', label: 'Completed' },
];

const STATUS_TONE: Record<ProjectStatus, 'neutral' | 'primary' | 'warn' | 'good'> = {
  docked: 'neutral',
  active: 'primary',
  stuck: 'warn',
  completed: 'good',
};

export function Projects({ onStartTask }: { onStartTask: (t: Task) => void }) {
  const { projects, tasks, addProject, updateProject, addTask } = useHarbor();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [draft, setDraft] = useState<Partial<Project>>({});

  const openNew = () => {
    setEditing(null);
    setDraft({ title: '', goal: '', nextStep: '', status: 'active' });
    setOpen(true);
  };
  const openEdit = (p: Project) => {
    setEditing(p);
    setDraft({ ...p });
    setOpen(true);
  };

  const save = () => {
    if (!draft.title?.trim()) return;
    if (editing) updateProject(editing.id, draft);
    else {
      const proj = addProject({ ...(draft as any), title: draft.title.trim() });
      // If a next step exists, capture it as a quick-win task linked to project.
      if (draft.nextStep?.trim()) {
        addTask({
          title: draft.nextStep.trim(),
          projectId: proj.id,
          isQuickWin: true,
          estimatedMinutes: 15,
          energyRequired: 'low',
          friction: 'easy',
        });
      }
    }
    setOpen(false);
  };

  return (
    <div className="space-y-6 py-4" data-testid="projects-screen">
      <header className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-primary/60 font-bold text-xs uppercase tracking-widest">
            <Ship className="w-4 h-4" /> The Fleet
          </div>
          <h2 className="text-3xl font-bold text-primary mt-1">Projects</h2>
        </div>
        <button
          data-testid="project-new-btn"
          onClick={openNew}
          className="p-3 rounded-full bg-primary text-on-primary shadow-lg active:scale-95"
        >
          <Plus className="w-6 h-6" />
        </button>
      </header>

      {projects.length === 0 ? (
        <EmptyState
          testId="projects-empty"
          icon={<Ship className="w-9 h-9" />}
          title="No ships in the fleet yet"
          blurb="Big things become doable when they have one clear next step. Launch your first project."
          action={
            <button
              onClick={openNew}
              className="px-6 py-3 rounded-full bg-primary text-on-primary font-bold active:scale-95"
            >
              New project
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {projects.map((p) => {
            const linked = tasks.filter(
              (t) => t.projectId === p.id && t.status !== 'completed' && t.status !== 'dumped',
            );
            return (
              <div
                key={p.id}
                data-testid={`project-card-${p.id}`}
                className="bg-surface-container-lowest rounded-3xl p-5 border border-surface-container-high misty-shadow space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-on-surface">{p.title}</h3>
                    {p.goal && (
                      <p className="text-sm text-on-surface-variant/70 mt-1 flex items-center gap-1.5">
                        <Flag className="w-3.5 h-3.5" /> {p.goal}
                      </p>
                    )}
                  </div>
                  <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
                </div>

                {p.nextStep && (
                  <div className="bg-primary-container/20 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">
                      Next visible step
                    </p>
                    <p className="font-bold text-on-surface flex items-center gap-2">
                      <CircleDot className="w-4 h-4 text-primary" /> {p.nextStep}
                    </p>
                  </div>
                )}

                {linked.length > 0 && (
                  <div className="space-y-2">
                    {linked.slice(0, 3).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => onStartTask(t)}
                        className="w-full flex items-center justify-between text-left px-3 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container active:scale-[0.99] transition-all"
                      >
                        <span className="font-semibold text-sm text-on-surface">{t.title}</span>
                        <ArrowRight className="w-4 h-4 text-primary/60" />
                      </button>
                    ))}
                  </div>
                )}

                <button
                  data-testid={`project-edit-${p.id}`}
                  onClick={() => openEdit(p)}
                  className="text-sm font-bold text-primary/70 hover:text-primary flex items-center gap-1.5"
                >
                  <Anchor className="w-4 h-4" /> Edit project
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title={editing ? 'Edit project' : 'New project'} testId="project-sheet">
        <div className="space-y-5">
          <div>
            <FieldLabel>Project title</FieldLabel>
            <input
              data-testid="project-title-input"
              value={draft.title || ''}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="e.g. Plan the summer trip"
              className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border-2 border-surface-container-high focus:border-primary outline-none font-semibold text-lg"
            />
          </div>
          <div>
            <FieldLabel>Goal</FieldLabel>
            <input
              data-testid="project-goal-input"
              value={draft.goal || ''}
              onChange={(e) => setDraft({ ...draft, goal: e.target.value })}
              placeholder="What does done look like?"
              className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border-2 border-surface-container-high focus:border-primary outline-none"
            />
          </div>
          <div>
            <FieldLabel>Next visible step</FieldLabel>
            <input
              data-testid="project-nextstep-input"
              value={draft.nextStep || ''}
              onChange={(e) => setDraft({ ...draft, nextStep: e.target.value })}
              placeholder="The very next small move"
              className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border-2 border-surface-container-high focus:border-primary outline-none"
            />
          </div>
          <div>
            <FieldLabel>Status</FieldLabel>
            <OptionPills
              size="sm"
              options={STATUS_OPTIONS}
              value={draft.status}
              onChange={(v) => setDraft({ ...draft, status: v })}
              testIdPrefix="project-status"
            />
          </div>
          <div>
            <FieldLabel>Deadline (optional)</FieldLabel>
            <input
              data-testid="project-deadline-input"
              type="date"
              value={draft.deadline ? draft.deadline.slice(0, 10) : ''}
              onChange={(e) =>
                setDraft({ ...draft, deadline: e.target.value ? new Date(e.target.value).toISOString() : undefined })
              }
              className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border-2 border-surface-container-high focus:border-primary outline-none font-semibold"
            />
          </div>
          <button
            data-testid="project-save-btn"
            onClick={save}
            disabled={!draft.title?.trim()}
            className="w-full py-4 rounded-2xl bg-primary text-on-primary font-bold text-lg flex items-center justify-center gap-2 shadow-xl active:scale-95 disabled:opacity-40"
          >
            <Ship className="w-5 h-5" /> {editing ? 'Save project' : 'Launch project'}
          </button>
        </div>
      </Sheet>
    </div>
  );
}
