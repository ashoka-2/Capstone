import { useState, useCallback, useEffect } from 'react';
import './App.css';
import { Header } from '../components/layout/Header';
import { TabsHeader } from '../components/layout/TabsHeader';
import { WelcomeHero } from '../components/layout/WelcomeHero';
import { ChatPanel } from '../components/chat/ChatPanel';
import { PreviewPanel } from '../components/preview/PreviewPanel';
import { EditorPanel } from '../components/editor/EditorPanel';
import { TerminalPanel } from '../components/terminal/TerminalPanel';
import { ResizeHandle } from '../components/common/ResizeHandle';
import { useResizable } from '../hooks/useResizable';
import { useSandbox } from '../hooks/useSandbox';
import { useFiles } from '../hooks/useFiles';

export const App = () => {
  const { isReady, activeTab } = useSandbox();
  const { refreshFiles } = useFiles();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Responsive mobile detection
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  const [mobileTab, setMobileTab] = useState('chat'); // 'chat' | 'preview' | 'code' | 'terminal'

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Resizable AI Chat Panel with collapse toggle and persistence
  const {
    width: chatWidth,
    isResizing: isChatResizing,
    isCollapsed: isChatCollapsed,
    toggleCollapse: toggleChatCollapse,
    startResizing: startChatResizing,
  } = useResizable({
    initialWidth: 420,
    minWidth: 280,
    maxWidth: 720,
    storageKey: 'sandbox_chat_width',
  });

  // Triggered automatically whenever AI finishes generating or editing files
  const handleGenerationComplete = useCallback(() => {
    refreshFiles(true);
    setRefreshTrigger((prev) => prev + 1);
  }, [refreshFiles]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--text)] select-none">
      {/* Invisible overlay while dragging to prevent iframe/Monaco from capturing mouse */}
      {isChatResizing && (
        <div className="fixed inset-0 z-50 pointer-events-auto cursor-col-resize select-none" />
      )}

      {/* Top Application Bar */}
      <Header
        isChatCollapsed={isChatCollapsed}
        onToggleChatCollapse={toggleChatCollapse}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {!isReady ? (
          <WelcomeHero />
        ) : isMobile ? (
          /* Mobile Full-Screen Tabbed View */
          <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
            <TabsHeader
              isMobile={true}
              mobileTab={mobileTab}
              onSelectMobileTab={setMobileTab}
            />

            <div className="flex-1 overflow-hidden relative">
              <div className={`h-full w-full ${mobileTab === 'chat' ? 'block' : 'hidden'}`}>
                <ChatPanel onGenerationComplete={handleGenerationComplete} />
              </div>
              <div className={`h-full w-full ${mobileTab === 'preview' ? 'block' : 'hidden'}`}>
                <PreviewPanel refreshTrigger={refreshTrigger} />
              </div>
              <div className={`h-full w-full ${mobileTab === 'code' ? 'block' : 'hidden'}`}>
                <EditorPanel />
              </div>
              <div className={`h-full w-full ${mobileTab === 'terminal' ? 'block' : 'hidden'}`}>
                <TerminalPanel />
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Side-by-Side Resizable View */
          <div className="flex-1 flex flex-row overflow-hidden w-full h-full">
            {/* Left Column: AI Assistant Chat */}
            {!isChatCollapsed && (
              <>
                <aside
                  style={{ width: `${chatWidth}px` }}
                  className="h-full shrink-0 flex flex-col overflow-hidden relative"
                >
                  <ChatPanel
                    onGenerationComplete={handleGenerationComplete}
                    onToggleCollapse={toggleChatCollapse}
                  />
                </aside>

                {/* Resizable Divider Handle */}
                <ResizeHandle
                  onMouseDown={startChatResizing}
                  isResizing={isChatResizing}
                />
              </>
            )}

            {/* Right Column: Interactive Workbench (Preview, Code, Terminal) */}
            <section className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-[var(--bg)]">
              <TabsHeader
                isChatCollapsed={isChatCollapsed}
                onToggleChatCollapse={toggleChatCollapse}
              />

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
