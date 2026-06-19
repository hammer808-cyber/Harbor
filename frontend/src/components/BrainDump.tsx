/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * BrainDump (Drift) — pour out the mess, then review parsed task drafts before
 * they enter the harbor. Parsing is fully local (see lib/parser.ts).
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Waves, Trash2, Check, ArrowLeft, Anchor, Pencil } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ParsedDraft, parseBrainDump, draftToTask } from '@/src/lib/parser';
import { useHarbor } from '@/src/lib/store';
import { OptionPills } from './common';
import { CATEGORY_OPTIONS } from '@/src/lib/options';

interface Props {
  onDone: () => void;
}

export function BrainDump({ onDone }: Props) {
  const { addTasks } = useHarbor();
  const [content, setContent] = useState('');
  const [drafts, setDrafts] = useState<ParsedDraft[] | null>(null);

  const parse = () => {
    const parsed = parseBrainDump(content);
    setDrafts(parsed);
  };

  const updateDraft = (id: string, patch: Partial<ParsedDraft>) =>
    setDrafts((d) => (d ? d.map((x) => (x.id === id ? { ...x, ...patch } : x)) : d));
  const removeDraft = (id: string) =>
    setDrafts((d) => (d ? d.filter((x) => x.id !== id) : d));

  const saveAll = () => {
    if (drafts && drafts.length) addTasks(drafts.map(draftToTask));
    onDone();
  };

  // ---- Review step ----
  if (drafts) {
    return (
      <div className="space-y-6 py-4" data-testid="braindump-review">
        <header className="space-y-2">
          <button
            data-testid="braindump-back"
            onClick={() => setDrafts(null)}
            className="flex items-center gap-1.5 text-primary/70 font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to the page
          </button>
          <h2 className="text-3xl font-bold text-primary">We sorted {drafts.length}.</h2>
          <p className="text-on-surface-variant/70">
            Tidy, recategorize, or toss any before they dock.
          </p>
        </header>

        {drafts.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-on-surface-variant/70 font-medium">
              Couldn't find clear tasks in that. Try again with one idea per line.
            </p>
            <button
              onClick={() => setDrafts(null)}
              className="px-6 py-3 rounded-full bg-primary text-on-primary font-bold"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {drafts.map((d) => (
                <motion.div
                  key={d.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  data-testid={`draft-${d.id}`}
                  className="bg-surface-container-lowest rounded-2xl p-4 border border-surface-container-high space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-primary/50 shrink-0" />
                    <input
                      data-testid={`draft-title-${d.id}`}
                      value={d.title}
                      onChange={(e) => updateDraft(d.id, { title: e.target.value })}
                      className="flex-1 bg-transparent font-bold text-lg text-on-surface outline-none border-b-2 border-transparent focus:border-primary/40"
                    />
                    <button
                      data-testid={`draft-remove-${d.id}`}
                      onClick={() => removeDraft(d.id)}
                      className="p-2 text-on-surface-variant/50 hover:text-tertiary rounded-full"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <OptionPills
                    size="sm"
                    options={CATEGORY_OPTIONS}
                    value={d.category}
                    onChange={(v) => updateDraft(d.id, { category: v })}
                    testIdPrefix={`draft-cat-${d.id}`}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {drafts.length > 0 && (
          <button
            data-testid="braindump-save-all"
            onClick={saveAll}
            className="w-full py-5 rounded-3xl bg-primary text-on-primary font-bold text-lg flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
          >
            <Anchor className="w-5 h-5" /> Dock all {drafts.length}
          </button>
        )}
      </div>
    );
  }

  // ---- Capture step ----
  return (
    <div className="space-y-8 py-4" data-testid="braindump-capture">
      <header className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-primary tracking-tight">Drop the messy version</h2>
        <p className="text-on-surface-variant italic leading-relaxed">
          Just pour it out. We'll sort it into tasks for you.
        </p>
      </header>

      <textarea
        data-testid="braindump-textarea"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full min-h-[260px] p-6 rounded-3xl glass border border-surface-container-highest focus:ring-4 focus:ring-primary-container/20 focus:border-primary outline-none transition-all text-lg leading-relaxed resize-none"
        placeholder={`call Edison\nclean the litter box\nfinish lesson plan\nmaybe email Heidi\nfigure out rent\nbuy cat food`}
      />

      <div className="flex flex-col items-center gap-3">
        <button
          data-testid="braindump-parse-btn"
          onClick={parse}
          disabled={!content.trim()}
          className={cn(
            'w-full max-w-xs py-5 rounded-full font-bold text-lg flex items-center justify-center gap-2 shadow-xl transition-all',
            content.trim()
              ? 'bg-primary text-on-primary hover:scale-[1.02] active:scale-95'
              : 'bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed',
          )}
        >
          <Sparkles className="w-5 h-5" /> Sort into tasks
        </button>
        <p className="text-xs font-bold text-outline-variant flex items-center gap-1.5">
          <Waves className="w-3 h-3" />
          Parsed on your device — one idea per line works best
        </p>
      </div>
    </div>
  );
}
