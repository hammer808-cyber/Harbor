import { useState, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Entrance } from './components/Entrance';
import { Today } from './components/Today';
import { BrainDump } from './components/BrainDump';
import { Choose } from './components/Choose';
import { Flow } from './components/Flow';
import { Stuck } from './components/Stuck';
import { DoOrDump } from './components/DoOrDump';
import { Projects } from './components/Projects';
import { Current } from './components/Current';
import { Deep } from './components/Deep';
import { HarborProvider, useHarbor } from './lib/store';
import { contextFromSky } from './lib/engine';
import { ScreenType, SkyState, Task } from './types';

function HarborApp() {
  const { completeTask } = useHarbor();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('entrance');
  const [skyState, setSkyState] = useState<SkyState>('clear');
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const navigateTo = useCallback((screen: ScreenType) => setCurrentScreen(screen), []);

  const handleStartTask = (task: Task) => {
    setActiveTask(task);
    navigateTo('flow');
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
            onStartTask={handleStartTask}
            onNavigate={(s) => navigateTo(s)}
          />
        );
      case 'dump':
        return <BrainDump onDone={() => navigateTo('current')} />;
      case 'choose':
        return (
          <Choose
            initialContext={contextFromSky(skyState)}
            onStartTask={handleStartTask}
            onBack={() => navigateTo('today')}
          />
        );
      case 'flow':
        return activeTask ? (
          <Flow
            task={activeTask}
            onComplete={() => {
              completeTask(activeTask.id);
              setActiveTask(null);
              navigateTo('today');
            }}
            onStuck={() => navigateTo('stuck')}
          />
        ) : (
          <Today skyState={skyState} onStartTask={handleStartTask} onNavigate={(s) => navigateTo(s)} />
        );
      case 'stuck':
        return (
          <Stuck
            onMicroStep={() => navigateTo('flow')}
            onGoBack={() => navigateTo('flow')}
          />
        );
      case 'doordump':
        return <DoOrDump onStartTask={handleStartTask} onBack={() => navigateTo('today')} />;
      case 'projects':
        return <Projects onStartTask={handleStartTask} />;
      case 'current':
        return <Current onStartTask={handleStartTask} />;
      case 'deep':
        return <Deep />;
      default:
        return (
          <Today skyState={skyState} onStartTask={handleStartTask} onNavigate={(s) => navigateTo(s)} />
        );
    }
  };

  return (
    <Layout currentScreen={currentScreen} skyState={skyState} onNavigate={navigateTo}>
      {renderScreen()}
    </Layout>
  );
}

export default function App() {
  return (
    <HarborProvider>
      <HarborApp />
    </HarborProvider>
  );
}
