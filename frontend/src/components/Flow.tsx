/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Flow — a calm focus timer for the task the user launched.
 */

import React, { useState, useEffect } from 'react';
import { CircleCheck, HelpCircle, Scissors, PauseCircle, PlayCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Task } from '@/src/types';
import { ShrinkSheet } from './ShrinkSheet';

interface FlowProps {
  task: Task;
  onComplete: () => void;
  onStuck: () => void;
}

export function Flow({ task, onComplete, onStuck }: FlowProps) {
  const totalSeconds = Math.max(1, task.estimatedMinutes) * 60;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [isActive, setIsActive] = useState(true);
  const [shrinkOpen, setShrinkOpen] = useState(false);

  useEffect(() => {
    setTimeLeft(totalSeconds);
    setIsActive(true);
  }, [task.id, totalSeconds]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / totalSeconds) * 100;

  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-8 text-center" data-testid="flow-screen">
      <div className="space-y-3">
        <h2 className="text-3xl font-bold text-primary tracking-tight">{task.title}</h2>
        <p className="text-on-surface-variant italic font-medium leading-relaxed max-w-xs mx-auto">
          "You are not doing the whole task. You are docking the first boat."
        </p>
      </div>

      <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center">
        <div className="absolute inset-0 border-8 border-primary-container/10 rounded-full misty-shadow ring-8 ring-white/20" />
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle className="text-primary-container/20" cx="50%" cy="50%" r="46%" fill="none" stroke="currentColor" strokeWidth="12" />
          <motion.circle
            className="text-primary"
            cx="50%" cy="50%" r="46%"
            fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round"
            initial={{ strokeDasharray: '0 1000' }}
            animate={{ strokeDasharray: `${(progress * 10).toFixed(0)} 1000` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </svg>
        <div className="relative flex flex-col items-center">
          <span data-testid="flow-timer" className="text-7xl font-bold text-primary tracking-tighter">{formatTime(timeLeft)}</span>
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] mt-2">Remaining</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        <button
          data-testid="flow-complete"
          onClick={onComplete}
          className="col-span-2 py-5 bg-primary text-on-primary rounded-3xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:opacity-90 active:scale-95 transition-all"
        >
          <CircleCheck className="w-6 h-6" /> Dock it
        </button>
        <button
          data-testid="flow-stuck"
          onClick={onStuck}
          className="py-5 bg-tertiary-container/30 border-2 border-tertiary-container/30 text-on-tertiary-container rounded-3xl font-bold hover:bg-tertiary-container/40 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <HelpCircle className="w-5 h-5" /> Stuck
        </button>
        <button
          data-testid="flow-shrink"
          onClick={() => setShrinkOpen(true)}
          className="py-5 bg-surface-container border-2 border-surface-container-highest text-primary rounded-3xl font-bold hover:bg-surface-container-high active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Scissors className="w-5 h-5" /> Shrink it
        </button>
        <button
          onClick={() => setIsActive(!isActive)}
          className="col-span-2 py-4 text-on-surface-variant font-bold hover:text-primary transition-colors flex items-center justify-center gap-2"
        >
          {isActive ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
          {isActive ? 'Pause Journey' : 'Resume Journey'}
        </button>
      </div>

      <ShrinkSheet task={shrinkOpen ? task : null} onClose={() => setShrinkOpen(false)} />
    </div>
  );
}
