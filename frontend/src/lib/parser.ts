/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Brain Dump parser — turns a messy blob of thoughts into clean task drafts
 * using local heuristics only (no external AI). Splits on lines / connectors,
 * strips filler, normalises verbs, and guesses category + a few fields so the
 * review screen has sensible defaults the user can tweak.
 */

import {
  Task,
  TaskCategory,
  EnergyLevel,
  FrictionLevel,
} from '../types';

export interface ParsedDraft {
  id: string; // temp id for the review list
  title: string;
  category: TaskCategory;
  estimatedMinutes: number;
  energyRequired: EnergyLevel;
  friction: FrictionLevel;
  isQuickWin: boolean;
}

// Filler phrases we strip from the front of a captured thought.
const LEAD_FILLERS = [
  'i need to',
  'i have to',
  'i should',
  'i want to',
  'i must',
  'need to',
  'have to',
  'should',
  'maybe',
  'remember to',
  'dont forget to',
  "don't forget to",
  'gotta',
  'got to',
  'figure out',
];

// Keyword → category hints.
const CATEGORY_HINTS: Record<TaskCategory, string[]> = {
  finance: ['rent', 'pay', 'bill', 'budget', 'tax', 'bank', 'invoice', 'money', 'refund'],
  errand: ['buy', 'pick up', 'grocer', 'store', 'shop', 'return', 'drop off', 'mail', 'post office', 'gas'],
  cleaning: ['clean', 'wash', 'litter', 'laundry', 'dishes', 'tidy', 'vacuum', 'trash', 'declutter'],
  health: ['doctor', 'dentist', 'gym', 'workout', 'meds', 'medicine', 'water', 'appointment', 'therapy', 'walk'],
  creative: ['write', 'draw', 'design', 'paint', 'song', 'draft', 'sketch', 'edit video', 'photo'],
  work: ['lesson plan', 'report', 'deck', 'client', 'meeting', 'project', 'deadline', 'presentation', 'standup'],
  planning: ['plan', 'schedule', 'organize', 'organise', 'review', 'research', 'outline', 'book'],
  admin: ['email', 'call', 'text', 'reply', 'form', 'sign', 'renew', 'cancel', 'subscription', 'password'],
  personal: [],
};

// Verbs we normalise contacts to (call/email Edison etc.).
function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function guessCategory(text: string): TaskCategory {
  const lower = text.toLowerCase();
  for (const [cat, words] of Object.entries(CATEGORY_HINTS) as [TaskCategory, string[]][]) {
    if (words.some((w) => lower.includes(w))) return cat;
  }
  return 'personal';
}

function guessFields(text: string, category: TaskCategory): Omit<ParsedDraft, 'id' | 'title' | 'category'> {
  const lower = text.toLowerCase();
  const isQuickVerb = /^(call|text|email|reply|buy|pay|send|book|water|sign)/.test(lower);
  const heavy = /(plan|finish|write|report|deck|research|figure out|organi[sz]e|deep)/.test(lower);

  let estimatedMinutes = 15;
  let energyRequired: EnergyLevel = 'medium';
  let friction: FrictionLevel = 'medium';

  if (isQuickVerb) {
    estimatedMinutes = 10;
    energyRequired = 'low';
    friction = 'easy';
  }
  if (heavy) {
    estimatedMinutes = 45;
    energyRequired = 'high';
    friction = 'hard';
  }
  if (category === 'cleaning' || category === 'errand') {
    energyRequired = 'medium';
  }

  const isQuickWin = estimatedMinutes <= 15 && friction === 'easy';
  return { estimatedMinutes, energyRequired, friction, isQuickWin };
}

function cleanTitle(raw: string): string {
  let t = raw.trim();
  // strip leading bullets / numbering / dashes
  t = t.replace(/^[-*•\d.)\s]+/, '').trim();
  if (!t) return '';

  let lower = t.toLowerCase();
  // strip a leading filler phrase, longest first
  const sorted = [...LEAD_FILLERS].sort((a, b) => b.length - a.length);
  for (const f of sorted) {
    if (lower.startsWith(f + ' ')) {
      t = t.slice(f.length).trim();
      lower = t.toLowerCase();
      break;
    }
  }
  // "figure out rent" -> "Review rent" style nicety
  if (/^figure out /i.test(raw.trim())) {
    t = 'Review ' + raw.trim().replace(/^figure out /i, '');
  }
  return titleCase(t);
}

/**
 * Parse a raw brain-dump string into task drafts.
 * Splits on newlines first; then on "," / " and " / ";" within a long line.
 */
export function parseBrainDump(raw: string): ParsedDraft[] {
  if (!raw || !raw.trim()) return [];

  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const fragments: string[] = [];
  for (const line of lines) {
    // Only split a line further if it looks like a run-on list.
    const parts =
      line.length > 40 || /(,| and |;| then )/i.test(line)
        ? line.split(/\s*,\s*|\s+and\s+|\s*;\s*|\s+then\s+/i)
        : [line];
    parts.forEach((p) => {
      const cleaned = cleanTitle(p);
      if (cleaned && cleaned.length >= 2) fragments.push(cleaned);
    });
  }

  // de-duplicate by lowercase title
  const seen = new Set<string>();
  const drafts: ParsedDraft[] = [];
  fragments.forEach((title, i) => {
    const key = title.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    const category = guessCategory(title);
    drafts.push({
      id: `draft-${Date.now()}-${i}`,
      title,
      category,
      ...guessFields(title, category),
    });
  });

  return drafts;
}

/** Convert an approved draft into a full Task. */
export function draftToTask(draft: ParsedDraft): Task {
  const now = new Date().toISOString();
  return {
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: draft.title,
    status: 'active',
    category: draft.category,
    estimatedMinutes: draft.estimatedMinutes,
    energyRequired: draft.energyRequired,
    location: draft.category === 'errand' ? 'car' : 'anywhere',
    urgency: 'flexible',
    importance: 'medium',
    friction: draft.friction,
    emotionalWeight: 'neutral',
    isQuickWin: draft.isQuickWin,
    createdAt: now,
    updatedAt: now,
  };
}
