/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Small shared UI primitives for Harbor (pills, empty state, sheet, badges).
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

// A horizontal/wrapping group of selectable pills.
export function OptionPills<T extends string | number>({
  options,
  value,
  onChange,
  testIdPrefix,
  size = 'md',
}: {
  options: { value: T; label: string }[];
  value: T | undefined;
  onChange: (v: T) => void;
  testIdPrefix?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            data-testid={testIdPrefix ? `${testIdPrefix}-${o.value}` : undefined}
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-full font-bold transition-all active:scale-95 border-2',
              size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm',
              active
                ? 'bg-primary text-on-primary border-primary shadow-md'
                : 'bg-white/50 border-white/40 text-primary hover:bg-white/80',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-widest mb-2">
      {children}
    </p>
  );
}

export function EmptyState({
  icon,
  title,
  blurb,
  action,
  testId,
}: {
  icon: React.ReactNode;
  title: string;
  blurb: string;
  action?: React.ReactNode;
  testId?: string;
}) {
  return (
    <div
      data-testid={testId}
      className="flex flex-col items-center justify-center text-center py-16 px-6 space-y-4"
    >
      <div className="w-20 h-20 rounded-full glass flex items-center justify-center text-primary/50 misty-shadow">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-primary">{title}</h3>
      <p className="text-on-surface-variant/70 max-w-xs leading-relaxed">{blurb}</p>
      {action}
    </div>
  );
}

// A bottom sheet / modal that slides up on mobile.
export function Sheet({
  open,
  onClose,
  title,
  children,
  testId,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  testId?: string;
}) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-end md:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-on-surface/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            data-testid={testId}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative z-10 w-full md:max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hide bg-surface rounded-t-3xl md:rounded-3xl p-6 pb-28 md:pb-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-primary">{title}</h3>
              <button
                data-testid="sheet-close"
                onClick={onClose}
                className="p-2 -mr-2 text-on-surface-variant/60 hover:text-primary"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'warn' | 'good' | 'primary';
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-surface-container-high text-on-surface-variant/80',
    warn: 'bg-tertiary-container/40 text-on-tertiary-container',
    good: 'bg-secondary-container/60 text-on-secondary-container',
    primary: 'bg-primary-container/40 text-on-primary-container',
  };
  return (
    <span
      className={cn(
        'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide',
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
