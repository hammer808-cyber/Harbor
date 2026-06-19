/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared option metadata (labels, copy, icons) used across the task forms and
 * the "What Should I Do Now?" flow. Centralised so the harbor language stays
 * consistent everywhere.
 */

import {
  TaskCategory,
  EnergyLevel,
  FrictionLevel,
  LocationType,
  Urgency,
  Importance,
  EmotionalWeight,
  Mode,
  TimeBucket,
} from '../types';

export const CATEGORY_OPTIONS: { value: TaskCategory; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'creative', label: 'Creative' },
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'errand', label: 'Errand' },
  { value: 'planning', label: 'Planning' },
  { value: 'health', label: 'Health' },
  { value: 'finance', label: 'Finance' },
];

export const ENERGY_OPTIONS: { value: EnergyLevel; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const FRICTION_OPTIONS: { value: FrictionLevel; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

export const LOCATION_OPTIONS: { value: LocationType; label: string }[] = [
  { value: 'home', label: 'Home' },
  { value: 'work', label: 'Work' },
  { value: 'car', label: 'Car / Errands' },
  { value: 'anywhere', label: 'Anywhere' },
];

export const URGENCY_OPTIONS: { value: Urgency; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'this-week', label: 'This week' },
  { value: 'flexible', label: 'Flexible' },
  { value: 'overdue', label: 'Overdue' },
];

export const IMPORTANCE_OPTIONS: { value: Importance; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const EMOTION_OPTIONS: { value: EmotionalWeight; label: string }[] = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'annoying', label: 'Annoying' },
  { value: 'overwhelming', label: 'Overwhelming' },
  { value: 'rewarding', label: 'Rewarding' },
];

export const TIME_OPTIONS: { value: TimeBucket; label: string }[] = [
  { value: 5, label: '5 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2+ hours' },
];

export const MODE_OPTIONS: { value: Mode; label: string; blurb: string }[] = [
  { value: 'focus', label: 'Focus', blurb: 'Deep, single-task work' },
  { value: 'tidy', label: 'Tidy', blurb: 'Clear the space around you' },
  { value: 'errands', label: 'Errands', blurb: 'Out-and-about tasks' },
  { value: 'admin', label: 'Admin', blurb: 'Calls, forms, paperwork' },
  { value: 'creative', label: 'Creative', blurb: 'Make something' },
  { value: 'survival', label: 'Survival Mode', blurb: 'Just one tiny thing' },
];

// Harbor display names for statuses + categories.
export const STATUS_LABEL: Record<string, string> = {
  active: 'Sailing',
  docked: 'Docked',
  snoozed: 'Drifting',
  completed: 'Safe Harbor',
  dumped: 'The Deep',
};

export function minutesLabel(m: number): string {
  if (m >= 120) return '2+ hrs';
  if (m >= 60) return `${Math.round(m / 60)} hr`;
  return `${m} min`;
}
