import { useState, useCallback } from 'react';
import './App.css';
import { Header } from '../components/layout/Header';
import { TabsHeader } from '../components/layout/TabsHeader';
import { WelcomeHero } from '../components/layout/WelcomeHero';
import { ChatPanel } from '../components/chat/ChatPanel';
import { PreviewPanel } from '../components/preview/PreviewPanel';
import { EditorPanel } from '../components/editor/EditorPanel';
import { TerminalPanel } from '../components/terminal/TerminalPanel';
import { useSandbox } from '../hooks/useSandbox';
import { useFiles } from '../hooks/useFiles';

export const App = () => {
  const { isReady, activeTab } = useSandbox();
  const { refreshFiles } = useFiles();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Triggered automatically whenever AI finishes generating or editing files
  const handleGenerationComplete = useCallback(() => {
    refreshFiles(true);
    setRefreshTrigger((prev) => prev + 1);
  }, [refreshFiles]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      {/* Top Application Bar */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {!isReady ? (
          <WelcomeHero />
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Column: AI Assistant Chat */}
            <aside className="w-full md:w-[380px] lg:w-[440px] xl:w-[480px] h-1/2 md:h-full shrink-0 flex flex-col overflow-hidden">
              <ChatPanel onGenerationComplete={handleGenerationComplete} />
            </aside>

            {/* Right Column: Interactive Workbench (Preview, Code, Terminal) */}
            <section className="flex-1 flex flex-col h-1/2 md:h-full min-w-0 overflow-hidden bg-[var(--bg)]">
              <TabsHeader />

              <div className="flex-1 overflow-hidden relative">
                <div className={`h-full w-full ${activeTab === 'preview' ? 'block' : 'hidden'}`}>
                  <PreviewPanel refreshTrigger={refreshTrigger} />
                </div>
                <div className={`h-full w-full ${activeTab === 'code' ? 'block' : 'hidden'}`}>
                  <EditorPanel />
                </div>
                <div className={`h-full w-full ${activeTab === 'terminal' ? 'block' : 'hidden'}`}>
                  <TerminalPanel />
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
