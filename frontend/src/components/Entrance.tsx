/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sun, CloudFog, Zap, Moon, EyeOff, AlertTriangle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { SkyState } from '@/src/types';

interface EntranceProps {
  skyState: SkyState;
  onSetSky: (state: SkyState) => void;
  onContinue: () => void;
}

export function Entrance({ skyState, onSetSky, onContinue }: EntranceProps) {
  const options: { id: SkyState; label: string; icon: React.ReactNode }[] = [
    { id: 'clear', label: 'Clear Enough', icon: <Sun className="w-5 h-5" /> },
    { id: 'foggy', label: 'Foggy', icon: <CloudFog className="w-5 h-5" /> },
    { id: 'wired', label: 'Wired', icon: <Zap className="w-5 h-5" /> },
    { id: 'tired', label: 'Tired', icon: <Moon className="w-5 h-5" /> },
    { id: 'avoiding', label: 'Avoiding', icon: <EyeOff className="w-5 h-5" /> },
    { id: 'overstimulated', label: 'Overstimulated', icon: <AlertTriangle className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-12 py-8 text-center">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-primary bg-white/20 backdrop-blur-md px-6 py-3 rounded-full inline-block">
          Where’s your sky right now?
        </h2>
        <p className="text-on-surface-variant italic">
          Before we decide what you should do, we check what kind of sky your brain is under.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md mx-auto">
        {options.map((option) => (
          <button
            key={option.id}
            data-testid={`sky-${option.id}`}
            onClick={() => onSetSky(option.id)}
            className={cn(
              "flex items-center justify-center gap-3 px-4 py-4 rounded-2xl transition-all duration-500",
              skyState === option.id 
                ? "bg-primary text-on-primary shadow-lg scale-105" 
                : "bg-white/40 border border-white/30 text-primary hover:bg-white/60"
            )}
          >
            {option.icon}
            <span className="text-sm font-bold uppercase tracking-wider">{option.label}</span>
          </button>
        ))}
      </div>

      <div className="pt-8 space-y-6">
        <button 
          onClick={onContinue}
          data-testid="set-sail-btn"
          className="w-full max-w-sm py-5 bg-primary text-on-primary rounded-3xl font-bold text-lg shadow-xl hover:shadow-primary/20 active:scale-95 transition-all"
        >
          Set Sail
        </button>
      </div>

      {/* Decorative Illustration Area */}
      <div className="pt-12 flex justify-center opacity-40">
        <div className="relative w-full max-w-lg aspect-[16/9] rounded-3xl overflow-hidden misty-shadow">
          <img 
            src="https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&q=80&w=1000" 
            alt="Misty harbor"
            className="w-full h-full object-cover grayscale brightness-110 contrast-75"
          />
          <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
        </div>
      </div>
    </div>
  );
}
