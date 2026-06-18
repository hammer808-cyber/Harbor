/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Plus, Sparkles, ArrowRight, Zap, Target, BookOpen } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Task, SkyState } from '@/src/types';

interface TodayProps {
  skyState: SkyState;
  tasks: Task[];
  onStartTask: (task: Task) => void;
  onBrainDump: () => void;
  onLibrary: () => void;
}

export function Today({ skyState, tasks, onStartTask, onBrainDump, onLibrary }: TodayProps) {
  // Mock recommended task based on state
  const recommendedTask: Task = tasks[0] || {
    id: 'rec-1',
    title: 'Clear one visible surface',
    description: 'A grounding 5-minute task to clear your immediate horizon.',
    duration: 5,
    energy: 'low',
    friction: 'medium',
  };

  return (
    <div className="space-y-10 pb-8 pt-4">
      <header className="space-y-1">
        <p className="text-sm font-bold text-primary uppercase tracking-widest opacity-60">Morning Tide</p>
        <h2 className="text-3xl font-bold text-on-surface tracking-tight">Welcome back.</h2>
      </header>

      {/* Context Tags */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <StatusTag icon={<Sparkles className="w-4 h-4" />} label={`Brain: ${skyState}`} />
        <StatusTag icon={<Zap className="w-4 h-4" />} label="Energy: Medium" />
      </div>

      {/* Recommendation Card */}
      <section className="relative overflow-hidden rounded-3xl bg-primary-container p-6 text-on-primary-container misty-shadow group">
        <div className="relative z-10 space-y-6">
          <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">Recommended for {skyState}</span>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tight">{recommendedTask.title}</h3>
            <p className="text-sm opacity-90 leading-relaxed font-medium">{recommendedTask.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onStartTask(recommendedTask)}
              className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all"
            >
              Start Now <Play className="w-4 h-4 fill-current" />
            </button>
            <button className="text-sm font-bold underline underline-offset-4 decoration-2 hover:opacity-70 transition-opacity">
              Later
            </button>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
      </section>

      {/* Quick Action Grid */}
      <section className="grid grid-cols-2 gap-4">
        <ActionButton 
          onClick={onBrainDump}
          icon={<Plus className="w-6 h-6" />}
          label="Brain Dump"
          color="bg-secondary-container text-on-secondary-container"
        />
        <ActionButton 
          onClick={() => {}}
          icon={<Sparkles className="w-6 h-6" />}
          label="Pick for me"
          color="bg-tertiary-container text-on-tertiary-container"
        />
      </section>

      {/* Library Preview */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h4 className="text-xl font-bold text-on-surface">Library</h4>
          <button onClick={onLibrary} className="flex items-center gap-1 text-primary font-bold text-sm hover:opacity-70 transition-opacity">
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
          {tasks.map((task) => (
            <div 
              key={task.id}
              className="w-56 shrink-0 bg-surface-container-low rounded-2xl p-5 space-y-4 border border-surface-container transition-all hover:bg-white hover:misty-shadow"
            >
              <div className="flex justify-between items-start">
                <StatusIcon title={task.title} />
                <span className="text-xs font-bold text-on-surface-variant/60">{task.duration}m</span>
              </div>
              <p className="text-sm font-bold leading-snug">{task.title}</p>
              <div className="flex gap-2">
                <span className="bg-surface px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight text-on-surface-variant/40">
                  {task.category || 'Focus'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatusTag({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="glass px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap misty-shadow">
      <span className="text-primary">{icon}</span>
      <span className="text-sm font-bold text-primary/80">{label}</span>
    </div>
  );
}

function ActionButton({ icon, label, color, onClick }: { icon: React.ReactNode; label: string; color: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-6 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 misty-shadow",
        color
      )}
    >
      <div className="bg-black/5 p-3 rounded-full">
        {icon}
      </div>
      <span className="text-sm font-bold">{label}</span>
    </button>
  );
}

function StatusIcon({ title }: { title: string }) {
  // Simple deterministic icon selection
  if (title.includes('routine')) return <Target className="w-5 h-5 text-primary/40" />;
  if (title.includes('photo')) return <Sparkles className="w-5 h-5 text-primary/40" />;
  return <BookOpen className="w-5 h-5 text-primary/40" />;
}
