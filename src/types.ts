/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SkyState = 'clear' | 'foggy' | 'wired' | 'tired' | 'avoiding' | 'overstimulated';

export type ScreenType = 'entrance' | 'today' | 'dump' | 'flow' | 'stuck' | 'library' | 'logbook';

export interface Task {
  id: string;
  title: string;
  description?: string;
  duration: number; // minutes
  energy: 'low' | 'medium' | 'high';
  friction: 'low' | 'medium' | 'high';
  category?: string;
  completedAt?: string;
}

export interface AppState {
  currentScreen: ScreenType;
  skyState: SkyState;
  currentTask?: Task;
  tasks: Task[];
  history: Task[];
}
