/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Local persistence for Harbor (localStorage). Safe migration: if older/partial
 * task shapes exist, missing fields are back-filled with sensible defaults so we
 * never lose a user's tasks.
 */

import { Task, Project } from '../types';

const TASKS_KEY = 'harbor.tasks.v1';
const PROJECTS_KEY = 'harbor.projects.v1';
const SEEDED_KEY = 'harbor.seeded.v1';

const now = () => new Date().toISOString();
const inDays = (d: number) =>
  new Date(Date.now() + d * 86400000).toISOString();

// ---- Seed examples so the engine has something to chew on first run ----
function seedTasks(): Task[] {
  const base = {
    status: 'active' as const,
    createdAt: now(),
    updatedAt: now(),
  };
  return [
    {
      ...base,
      id: 'seed-1',
      title: 'Reply to the school email',
      category: 'admin',
      estimatedMinutes: 5,
      energyRequired: 'low',
      location: 'anywhere',
      urgency: 'today',
      importance: 'medium',
      friction: 'easy',
      emotionalWeight: 'annoying',
      isQuickWin: true,
    },
    {
      ...base,
      id: 'seed-2',
      title: 'Clear one kitchen surface',
      category: 'cleaning',
      estimatedMinutes: 10,
      energyRequired: 'low',
      location: 'home',
      urgency: 'flexible',
      importance: 'low',
      friction: 'easy',
      emotionalWeight: 'rewarding',
      isQuickWin: true,
    },
    {
      ...base,
      id: 'seed-3',
      title: 'Finish the lesson plan draft',
      category: 'work',
      estimatedMinutes: 60,
      energyRequired: 'high',
      location: 'work',
      urgency: 'this-week',
      importance: 'high',
      friction: 'hard',
      emotionalWeight: 'overwhelming',
      isQuickWin: false,
      deadline: inDays(2),
    },
    {
      ...base,
      id: 'seed-4',
      title: 'Buy cat food',
      category: 'errand',
      estimatedMinutes: 15,
      energyRequired: 'medium',
      location: 'car',
      urgency: 'today',
      importance: 'high',
      friction: 'easy',
      emotionalWeight: 'neutral',
      isQuickWin: true,
    },
    {
      ...base,
      id: 'seed-5',
      title: 'Review the rent plan',
      category: 'finance',
      estimatedMinutes: 30,
      energyRequired: 'high',
      location: 'home',
      urgency: 'overdue',
      importance: 'high',
      friction: 'hard',
      emotionalWeight: 'overwhelming',
      isQuickWin: false,
      deadline: inDays(-3),
    },
    {
      ...base,
      id: 'seed-6',
      title: 'Sketch ideas for the new mural',
      category: 'creative',
      estimatedMinutes: 45,
      energyRequired: 'high',
      location: 'anywhere',
      urgency: 'flexible',
      importance: 'medium',
      friction: 'medium',
      emotionalWeight: 'rewarding',
      isQuickWin: false,
    },
  ] as Task[];
}

// Back-fill any missing fields on a stored task (safe migration).
function migrateTask(t: any): Task {
  const ts = now();
  return {
    id: t.id || `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: t.title || 'Untitled',
    notes: t.notes ?? t.description,
    status: t.status || 'active',
    category: t.category || 'personal',
    projectId: t.projectId,
    deadline: t.deadline,
    estimatedMinutes: t.estimatedMinutes ?? t.duration ?? 15,
    energyRequired: t.energyRequired || t.energy || 'medium',
    location: t.location || 'anywhere',
    urgency: t.urgency || 'flexible',
    importance: t.importance || 'medium',
    friction: ['easy', 'medium', 'hard'].includes(t.friction)
      ? t.friction
      : t.friction === 'low'
      ? 'easy'
      : t.friction === 'high'
      ? 'hard'
      : 'medium',
    emotionalWeight: t.emotionalWeight || 'neutral',
    isQuickWin: t.isQuickWin ?? false,
    createdAt: t.createdAt || ts,
    updatedAt: t.updatedAt || ts,
    completedAt: t.completedAt,
    snoozedUntil: t.snoozedUntil,
  };
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) {
      if (!localStorage.getItem(SEEDED_KEY)) {
        const seeded = seedTasks();
        saveTasks(seeded);
        localStorage.setItem(SEEDED_KEY, '1');
        return seeded;
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(migrateTask);
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch {
    /* ignore quota errors */
  }
}

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]) {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch {
    /* ignore */
  }
}
