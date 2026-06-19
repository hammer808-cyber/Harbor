/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Layout — atmospheric harbor shell with header + bottom navigation.
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Anchor, Edit, Compass, Ship, Waves, Archive } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ScreenType, SkyState } from '@/src/types';

interface LayoutProps {
  children: React.ReactNode;
  currentScreen: ScreenType;
  skyState: SkyState;
  onNavigate: (screen: ScreenType) => void;
}

export function Layout({ children, currentScreen, skyState, onNavigate }: LayoutProps) {
  const skyGradients: Record<SkyState, string> = {
    clear: 'linear-gradient(180deg, #c7e8f6 0%, #faf9fa 60%, #e5e2dd 100%)',
    foggy: 'linear-gradient(180deg, #d1d5db 0%, #f3f4f6 60%, #e5e7eb 100%)',
    wired: 'linear-gradient(180deg, #44636f 0%, #b8d8e6 40%, #ffffff 100%)',
    tired: 'linear-gradient(180deg, #ffd1a9 0%, #ffedd5 40%, #faf9fa 100%)',
    avoiding: 'linear-gradient(180deg, #2c4b56 0%, #1a1c1d 90%)',
    overstimulated: 'linear-gradient(180deg, #e3e2e3 0%, #eeeeee 100%)',
  };

  return (
    <div
      className="relative min-h-screen transition-colors duration-1000 overflow-x-hidden flex flex-col"
      style={{ background: skyGradients[skyState] }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <motion.div
          animate={{ x: ['-20%', '100%'] }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute top-[10%] w-[120%] h-[30%] bg-white/40 blur-[100px] rounded-full"
        />
        <motion.div
          animate={{ x: ['100%', '-20%'] }}
          transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
          className="absolute top-[30%] w-[120%] h-[20%] bg-white/20 blur-[80px] rounded-full"
        />
      </div>

      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 glass">
        <button
          data-testid="header-home"
          onClick={() => onNavigate('today')}
          className="flex items-center gap-2"
        >
          <Waves className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-primary">Harbor</h1>
        </button>
        <button
          data-testid="nav-deep"
          onClick={() => onNavigate('deep')}
          className={cn(
            'p-2 rounded-full transition-colors',
            currentScreen === 'deep' ? 'text-primary bg-primary-container/40' : 'text-primary/60 hover:text-primary',
          )}
        >
          <Archive className="w-6 h-6" />
        </button>
      </header>

      <main className="relative z-10 flex-grow pt-24 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl mx-auto px-6"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 w-full z-50 px-6 pb-8 pt-4 glass rounded-t-3xl border-t border-white/30">
        <div className="flex justify-around items-end max-w-2xl mx-auto">
          <NavItem active={currentScreen === 'today'} onClick={() => onNavigate('today')} icon={<Anchor className="w-6 h-6" />} label="Harbor" testId="nav-today" />
          <NavItem active={currentScreen === 'dump'} onClick={() => onNavigate('dump')} icon={<Edit className="w-6 h-6" />} label="Drift" testId="nav-dump" />
          <NavItem center active={currentScreen === 'choose'} onClick={() => onNavigate('choose')} icon={<Compass className="w-7 h-7" />} label="Choose" testId="nav-choose" />
          <NavItem active={currentScreen === 'current'} onClick={() => onNavigate('current')} icon={<Waves className="w-6 h-6" />} label="Current" testId="nav-current" />
          <NavItem active={currentScreen === 'projects'} onClick={() => onNavigate('projects')} icon={<Ship className="w-6 h-6" />} label="Fleet" testId="nav-projects" />
        </div>
      </nav>
    </div>
  );
}

function NavItem({
  active, icon, label, onClick, center, testId,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  center?: boolean;
  testId?: string;
}) {
  if (center) {
    return (
      <button data-testid={testId} onClick={onClick} className="flex flex-col items-center gap-1 -mt-6">
        <div className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-90',
          active ? 'bg-primary text-on-primary scale-110' : 'bg-primary/90 text-on-primary',
        )}>
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{label}</span>
      </button>
    );
  }
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 transition-all duration-300',
        active ? 'text-primary scale-110' : 'text-primary/40 hover:text-primary/70',
      )}
    >
      <div className={cn('p-2 rounded-full transition-colors', active ? 'bg-primary-container/40' : 'bg-transparent')}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}
