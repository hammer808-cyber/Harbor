/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Harbor core data model.
 * The Task model is the single source of truth for the recommendation engine.
 */

// ---- Atmosphere (kept from the original Entrance experience) ----
export type SkyState =
  | 'clear'
  | 'foggy'
  | 'wired'
  | 'tired'
  | 'avoiding'
  | 'overstimulated';

// ---- Screens ----
export type ScreenType =
  | 'entrance'
  | 'today'
  | 'dump'
  | 'choose'
  | 'flow'
  | 'stuck'
  | 'doordump'
  | 'projects'
  | 'current'
  | 'deep';

// ---- Task enums ----
export type EnergyLevel = 'low' | 'medium' | 'high';
export type FrictionLevel = 'easy' | 'medium' | 'hard';
export type TaskStatus = 'active' | 'docked' | 'completed' | 'dumped' | 'snoozed';
export type TaskCategory =
  | 'admin'
  | 'cleaning'
  | 'creative'
  | 'work'
  | 'personal'
  | 'errand'
  | 'planning'
  | 'health'
  | 'finance';
export type LocationType = 'home' | 'work' | 'car' | 'anywhere';
export type Urgency = 'today' | 'this-week' | 'flexible' | 'overdue';
export type Importance = 'low' | 'medium' | 'high';
export type EmotionalWeight = 'neutral' | 'annoying' | 'overwhelming' | 'rewarding';

// Available-time buckets (minutes) for the "What Should I Do Now?" flow.
export type TimeBucket = 5 | 15 | 30 | 60 | 120;

// The 6 daily "modes" the user can be in.
export type Mode = 'focus' | 'tidy' | 'errands' | 'admin' | 'creative' | 'survival';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  status: TaskStatus;
  category: TaskCategory;
  projectId?: string;
  deadline?: string; // ISO date
  estimatedMinutes: number;
  energyRequired: EnergyLevel;
  location: LocationType;
  urgency: Urgency;
  importance: Importance;
  friction: FrictionLevel;
  emotionalWeight: EmotionalWeight;
  isQuickWin: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  snoozedUntil?: string;
}

// A project is a container of tasks with a single visible "next step".
export type ProjectStatus = 'docked' | 'active' | 'stuck' | 'completed';

export interface Project {
  id: string;
  title: string;
  goal?: string;
  nextStep?: string;
  deadline?: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

// The user's current context, captured in the "What Should I Do Now?" flow.
export interface HarborContext {
  availableMinutes: TimeBucket;
  energy: EnergyLevel;
  location: LocationType;
  mode: Mode;
  preference: 'quick-win' | 'progress';
}

// A scored recommendation produced by the engine.
export interface Recommendation {
  task: Task;
  score: number; // 0 - 100 Harbor Fit Score
  reason: string; // human friendly "why this"
  slot?: 'best-bet' | 'easy-win' | 'future-you';
}
