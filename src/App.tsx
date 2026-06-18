import { useState, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Entrance } from './components/Entrance';
import { Today } from './components/Today';
import { BrainDump } from './components/BrainDump';
import { Flow } from './components/Flow';
import { Stuck } from './components/Stuck';
import { ScreenType, SkyState, Task } from './types';

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Update morning routine',
    duration: 15,
    energy: 'medium',
    friction: 'low',
    category: 'Focus',
  },
  {
    id: '2',
    title: 'Sort through photo inbox',
    duration: 20,
    energy: 'low',
    friction: 'high',
    category: 'Low Energy',
  },
  {
    id: '3',
    title: 'Draft gratitude log',
    duration: 10,
    energy: 'medium',
    friction: 'low',
    category: 'Calm',
  },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('entrance');
  const [skyState, setSkyState] = useState<SkyState>('clear');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const navigateTo = useCallback((screen: ScreenType) => {
    setCurrentScreen(screen);
  }, []);

  const handleStartTask = (task: Task) => {
    setActiveTask(task);
    navigateTo('flow');
  };

  const handleBrainDumpComplete = (content: string) => {
    // In a real app, this would trigger an AI categorization
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
      description: content,
      duration: 10,
      energy: 'medium',
      friction: 'medium',
    };
    setTasks([newTask, ...tasks]);
    navigateTo('today');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'entrance':
        return (
          <Entrance 
            skyState={skyState} 
            onSetSky={setSkyState} 
            onContinue={() => navigateTo('today')} 
          />
        );
      case 'today':
        return (
          <Today 
            skyState={skyState}
            tasks={tasks}
            onStartTask={handleStartTask}
            onBrainDump={() => navigateTo('dump')}
            onLibrary={() => navigateTo('library')}
          />
        );
      case 'dump':
        return <BrainDump onComplete={handleBrainDumpComplete} />;
      case 'flow':
        return activeTask ? (
          <Flow 
            task={activeTask}
            onComplete={() => {
              setActiveTask(null);
              navigateTo('today');
            }}
            onStuck={() => navigateTo('stuck')}
            onShrink={() => {}}
          />
        ) : null;
      case 'stuck':
        return (
          <Stuck 
            onMicroStep={() => navigateTo('flow')}
            onGoBack={() => navigateTo('flow')}
          />
        );
      case 'library':
      case 'logbook':
        return (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-primary/40 space-y-4">
            <h2 className="text-2xl font-bold italic tracking-tight">The {currentScreen} is coming soon.</h2>
            <p>We are currently moored. Check back at the next tide.</p>
            <button 
              onClick={() => navigateTo('today')}
              className="text-primary font-bold underline"
            >
              Return Home
            </button>
          </div>
        );
      default:
        return <Today 
          skyState={skyState}
          tasks={tasks}
          onStartTask={handleStartTask}
          onBrainDump={() => navigateTo('dump')}
          onLibrary={() => navigateTo('library')}
        />;
    }
  };

  return (
    <Layout currentScreen={currentScreen} skyState={skyState} onNavigate={navigateTo}>
      {renderScreen()}
    </Layout>
  );
}
