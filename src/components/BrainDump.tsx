/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mic, Sparkles, Waves } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface BrainDumpProps {
  onComplete: (content: string) => void;
}

export function BrainDump({ onComplete }: BrainDumpProps) {
  const [content, setContent] = useState('');

  const anchors = [
    'Home', 'Work', 'Errand', 'People', 'Body care', 'Money/admin', 'School'
  ];

  return (
    <div className="space-y-8 py-4">
      <header className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-primary tracking-tight">Drop the messy version</h2>
        <p className="text-on-surface-variant italic leading-relaxed">
          Just pour it out. We'll sort it later.
        </p>
      </header>

      <div className="space-y-6">
        <div className="relative group">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[280px] p-8 rounded-3xl glass border border-surface-container-highest focus:ring-4 focus:ring-primary-container/20 focus:border-primary outline-none transition-all duration-500 text-lg leading-relaxed shadow-misty resize-none"
            placeholder="I need to call the vet about Daisy's shots, buy more detergent, and finish that draft..."
          />
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute bottom-6 right-6 w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg hover:shadow-primary/30"
          >
            <Mic className="w-6 h-6 fill-current" />
          </motion.button>
        </div>

        <div className="py-2">
          <p className="text-[10px] font-bold text-outline-variant uppercase tracking-widest mb-4 ml-2">Quick Anchors</p>
          <div className="flex flex-wrap gap-2">
            {anchors.map(anchor => (
              <button 
                key={anchor}
                className="px-5 py-2 rounded-full border-2 border-primary-container/20 bg-white/40 text-primary/80 font-bold text-sm hover:bg-primary-container/20 hover:border-primary-container/40 transition-colors"
              >
                {anchor}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent my-8" />

        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={() => onComplete(content)}
            disabled={!content.trim()}
            className={cn(
              "w-full max-w-xs py-5 rounded-full font-bold text-lg flex items-center justify-center gap-2 shadow-xl transition-all duration-500",
              content.trim() 
                ? "bg-primary text-on-primary hover:scale-[1.02] active:scale-95" 
                : "bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed"
            )}
          >
            <span>Build card</span>
            <Sparkles className="w-5 h-5" />
          </button>
          <p className="text-xs font-bold text-outline-variant flex items-center gap-1.5">
            <Waves className="w-3 h-3" />
            AI will organize your notes into structured tasks
          </p>
        </div>
      </div>
    </div>
  );
}
