/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ListOrdered, Sparkles, Map, Mountain, Key, Waves, BrainCircuit, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface StuckProps {
  onMicroStep: () => void;
  onGoBack: () => void;
}

export function Stuck({ onMicroStep, onGoBack }: StuckProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const reasons = [
    { label: 'Too many steps', icon: <ListOrdered className="w-6 h-6" /> },
    { label: 'I got distracted', icon: <Sparkles className="w-6 h-6" /> },
    { label: 'Don’t know where to start', icon: <Map className="w-6 h-6" /> },
    { label: 'Feels bigger than expected', icon: <Mountain className="w-6 h-6" /> },
    { label: 'I need something first', icon: <Key className="w-6 h-6" /> },
    { label: 'I’m overwhelmed', icon: <Waves className="w-6 h-6" /> },
  ];

  return (
    <div className="space-y-12 py-4">
      <AnimatePresence mode="wait">
        {!selectedReason ? (
          <motion.div 
            key="selection"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-on-surface tracking-tight">What happened?</h1>
              <p className="text-on-surface-variant font-medium opacity-60">It’s okay to pause. Let’s find where the wind shifted.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reasons.map((reason, idx) => (
                <button 
                  key={reason.label}
                  onClick={() => setSelectedReason(reason.label)}
                  className="glass p-6 rounded-3xl text-left hover:bg-secondary-container/30 transition-all duration-300 group flex items-center gap-4 misty-shadow"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/50 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                    {reason.icon}
                  </div>
                  <p className="font-bold text-lg text-primary">{reason.label}</p>
                </button>
              ))}
            </div>

            <button 
              onClick={onGoBack}
              className="w-full py-4 text-primary font-bold opacity-60 hover:opacity-100 transition-opacity"
            >
              Cancel and go back
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="solution"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center text-center space-y-10 min-h-[400px]"
          >
            <div className="w-24 h-24 bg-primary-container/20 rounded-full flex items-center justify-center mb-4 ring-8 ring-white/10">
              <BrainCircuit className="w-12 h-12 text-primary" />
            </div>
            
            <div className="space-y-6 max-w-sm">
              <h2 className="text-3xl font-bold text-primary tracking-tight">Calming the noise.</h2>
              
              <div className="p-8 bg-surface-container rounded-[2.5rem] shadow-2xl border border-white/50 relative">
                <p className="text-2xl font-bold text-on-surface italic leading-relaxed">
                  “Put one item in one place. Then stop.”
                </p>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary/20 rounded-full" />
              </div>

              <p className="text-on-surface-variant font-medium leading-relaxed px-4">
                The horizon is wide, but your feet only need to take one step. This is the only thing that matters right now.
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-xs">
              <button 
                onClick={onMicroStep}
                className="bg-primary text-on-primary font-bold py-5 px-10 rounded-full shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Try this micro-step
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
              
              <button 
                onClick={() => setSelectedReason(null)}
                className="text-primary font-bold opacity-60 hover:opacity-100 transition-opacity text-sm"
              >
                Wait, I want to choose another reason
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
