/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Harbor store — one React context that owns all tasks + projects, persists to
 * localStorage, and exposes the CRUD/actions the screens need. Keeping this in
 * one place means there is a single task system (no duplicates).
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { Task, Project, TaskStatus } from '../types';
import {
  loadTasks,
  saveTasks,
  loadProjects,
  saveProjects,
} from './storage';

const now = () => new Date().toISOString();
const uid = (p: string) =>
  `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

interface HarborStore {
  tasks: Task[];
  projects: Project[];
  addTask: (t: Partial<Task> & { title: string }) => Task;
  addTasks: (ts: Task[]) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  setStatus: (id: string, status: TaskStatus, extra?: Partial<Task>) => void;
  completeTask: (id: string) => void;
  dumpTask: (id: string) => void;
  snoozeTask: (id: string, until?: string) => void;
  dockTask: (id: string) => void;
  restoreTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addProject: (p: Partial<Project> & { title: string }) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
}

const Ctx = createContext<HarborStore | null>(null);

export function HarborProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [ready, setReady] = useState(false);

  // hydrate once
  useEffect(() => {
    setTasks(loadTasks());
    setProjects(loadProjects());
    setReady(true);
  }, []);

  // persist on change (after hydration)
  useEffect(() => {
    if (ready) saveTasks(tasks);
  }, [tasks, ready]);
  useEffect(() => {
    if (ready) saveProjects(projects);
  }, [projects, ready]);

  const addTask = useCallback((t: Partial<Task> & { title: string }) => {
    const ts = now();
    const task: Task = {
      id: uid('task'),
      status: 'active',
      category: 'personal',
      estimatedMinutes: 15,
      energyRequired: 'medium',
      location: 'anywhere',
      urgency: 'flexible',
      importance: 'medium',
      friction: 'medium',
      emotionalWeight: 'neutral',
      isQuickWin: false,
      createdAt: ts,
      updatedAt: ts,
      ...t,
    };
    setTasks((prev) => [task, ...prev]);
    return task;
  }, []);

  const addTasks = useCallback((ts: Task[]) => {
    setTasks((prev) => [...ts, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, ...patch, updatedAt: now() } : t,
      ),
    );
  }, []);

  const setStatus = useCallback(
    (id: string, status: TaskStatus, extra: Partial<Task> = {}) => {
      updateTask(id, { status, ...extra });
    },
    [updateTask],
  );

  const completeTask = useCallback(
    (id: string) => setStatus(id, 'completed', { completedAt: now() }),
    [setStatus],
  );
  const dumpTask = useCallback((id: string) => setStatus(id, 'dumped'), [setStatus]);
  const dockTask = useCallback((id: string) => setStatus(id, 'docked'), [setStatus]);
  const restoreTask = useCallback(
    (id: string) => setStatus(id, 'active', { completedAt: undefined, snoozedUntil: undefined }),
    [setStatus],
  );
  const snoozeTask = useCallback(
    (id: string, until?: string) =>
      setStatus(id, 'snoozed', {
        snoozedUntil: until || new Date(Date.now() + 86400000).toISOString(),
      }),
    [setStatus],
  );

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addProject = useCallback((p: Partial<Project> & { title: string }) => {
    const ts = now();
    const project: Project = {
      id: uid('proj'),
      status: 'active',
      createdAt: ts,
      updatedAt: ts,
      ...p,
    };
    setProjects((prev) => [project, ...prev]);
    return project;
  }, []);

  const updateProject = useCallback((id: string, patch: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: now() } : p)),
    );
  }, []);

  const value = useMemo<HarborStore>(
    () => ({
      tasks,
      projects,
      addTask,
      addTasks,
      updateTask,
      setStatus,
      completeTask,
      dumpTask,
      snoozeTask,
      dockTask,
      restoreTask,
      deleteTask,
      addProject,
      updateProject,
    }),
    [
      tasks,
      projects,
      addTask,
      addTasks,
      updateTask,
      setStatus,
      completeTask,
      dumpTask,
      snoozeTask,
      dockTask,
      restoreTask,
      deleteTask,
      addProject,
      updateProject,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useHarbor(): HarborStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useHarbor must be used within HarborProvider');
  return ctx;
}
