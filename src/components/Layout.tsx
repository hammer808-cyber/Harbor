import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Anchor, Edit, Waves, Layers, BookOpen, Settings, User } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ScreenType, SkyState } from '@/src/types';

interface LayoutProps {
  children: React.ReactNode;
  currentScreen: ScreenType;
  skyState: SkyState;
  onNavigate: (screen: ScreenType) => void;
}

export function Layout({ children, currentScreen, skyState, onNavigate }: LayoutProps) {
  // Atmospheric background gradients based on SkyState
  const skyGradients: Record<SkyState, string> = {
    clear: "linear-gradient(180deg, #c7e8f6 0%, #faf9fa 60%, #e5e2dd 100%)",
    foggy: "linear-gradient(180deg, #d1d5db 0%, #f3f4f6 60%, #e5e7eb 100%)",
    wired: "linear-gradient(180deg, #44636f 0%, #b8d8e6 40%, #ffffff 100%)",
    tired: "linear-gradient(180deg, #ffd1a9 0%, #ffedd5 40%, #faf9fa 100%)",
    avoiding: "linear-gradient(180deg, #2c4b56 0%, #1a1c1d 90%)",
    overstimulated: "linear-gradient(180deg, #e3e2e3 0%, #eeeeee 100%)",
  };

  return (
    <div 
      className="relative min-h-screen transition-colors duration-1000 overflow-x-hidden flex flex-col"
      style={{ background: skyGradients[skyState] }}
    >
      {/* Drifting Clouds / Mist Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <motion.div 
          animate={{ x: ["-20%", "100%"] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] w-[120%] h-[30%] bg-white/40 blur-[100px] rounded-full"
        />
        <motion.div 
          animate={{ x: ["100%", "-20%"] }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="absolute top-[30%] w-[120%] h-[20%] bg-white/20 blur-[80px] rounded-full"
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 glass">
        <div className="flex items-center gap-2">
          <Waves className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-primary">Harbor</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-primary/60 hover:text-primary transition-colors">
            <Settings className="w-6 h-6" />
          </button>
          <button className="p-2 text-primary/60 hover:text-primary transition-colors">
            <User className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
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

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-50 px-6 pb-8 pt-4 glass rounded-t-3xl border-t border-white/30">
        <div className="flex justify-around items-center max-w-2xl mx-auto">
          <NavItem 
            active={currentScreen === 'today'} 
            onClick={() => onNavigate('today')}
            icon={<Anchor className="w-6 h-6" />}
            label="Today"
          />
          <NavItem 
            active={currentScreen === 'dump'} 
            onClick={() => onNavigate('dump')}
            icon={<Edit className="w-6 h-6" />}
            label="Dump"
          />
          <NavItem 
            active={currentScreen === 'flow'} 
            onClick={() => onNavigate('flow')}
            icon={<Waves className="w-6 h-6" />}
            label="Flow"
          />
          <NavItem 
            active={currentScreen === 'library'} 
            onClick={() => onNavigate('library')}
            icon={<Layers className="w-6 h-6" />}
            label="Library"
          />
          <NavItem 
            active={currentScreen === 'logbook'} 
            onClick={() => onNavigate('logbook')}
            icon={<BookOpen className="w-6 h-6" />}
            label="Log"
          />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all duration-300",
        active ? "text-primary scale-110" : "text-primary/40 hover:text-primary/70 scale-100"
      )}
    >
      <div className={cn(
        "p-2 rounded-full transition-colors",
        active ? "bg-primary-container/40" : "bg-transparent"
      )}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}
