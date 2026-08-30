import { useState, useRef, useCallback } from "react";
import SplashScreen from "./components/SplashScreen";
import TopBar from "./components/TopBar";
import FileExplorer from "./components/FileExplorer";
import PreviewFrame from "./components/PreviewFrame";
import FileViewer from "./components/FileViewer";
import Terminal from "./components/Terminal";
import AiChat from "./components/AiChat";

export default function App() {
  // Sandbox State
  const [sandbox, setSandbox] = useState(null); // { sandboxId, previewUrl, agentBase, projectId, projectTitle }

  // UI Navigation State
  const [activeTab, setActiveTab] = useState("preview"); // 'preview' | 'files'
  const [activeFile, setActiveFile] = useState(null);
  const [fileRefreshKey, setFileRefreshKey] = useState(0);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);

  // Terminal Resize State
  const [terminalHeight, setTerminalHeight] = useState(200);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartH = useRef(0);

  const handleSandboxCreated = useCallback((data) => {
    // Determine agentBase URL based on current origin
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    const isLocal = host.includes("localhost") || host === "127.0.0.1";
    
    // In local dev, agent runs through router at http://<sandboxId>.agent.localhost
    const agentBase = isLocal
      ? `http://${data.sandboxId}.agent.localhost`
      : `${protocol}//${data.sandboxId}.agent.${host}`;

    const previewUrl = data.previewUrl || (isLocal
      ? `http://${data.sandboxId}.preview.localhost`
      : `${protocol}//${data.sandboxId}.preview.${host}`);

    setSandbox({
      sandboxId: data.sandboxId,
      previewUrl,
      agentBase,
      projectId: data.projectId,
      projectTitle: data.projectTitle || "React Workspace",
    });
  }, []);

  const handleFilesChanged = useCallback(() => {
    setFileRefreshKey((k) => k + 1);
  }, []);

  // Drag handler for terminal resize
  const handleMouseDown = (e) => {
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartH.current = terminalHeight;

    const handleMouseMove = (ev) => {
      if (!isDragging.current) return;
      const delta = dragStartY.current - ev.clientY;
      const newHeight = Math.max(100, Math.min(500, dragStartH.current + delta));
      setTerminalHeight(newHeight);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Exit back to project selection
  const handleExitSandbox = () => {
    if (window.confirm("Close current workspace and return to project select?")) {
      setSandbox(null);
      setActiveFile(null);
    }
  };

  if (!sandbox) {
    return <SplashScreen onSandboxCreated={handleSandboxCreated} />;
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0a0b10] text-gray-100 overflow-hidden select-none">
      {/* Top Navigation Bar */}
      <TopBar
        sandbox={sandbox}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExitSandbox={handleExitSandbox}
        isTerminalOpen={isTerminalOpen}
        setIsTerminalOpen={setIsTerminalOpen}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left / Center Work Column */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Main Tab Views */}
          <div className="flex-1 flex overflow-hidden">
            {activeTab === "preview" ? (
              <PreviewFrame previewUrl={sandbox.previewUrl} />
            ) : (
              <div className="flex-1 flex overflow-hidden">
                <FileExplorer
                  agentBase={sandbox.agentBase}
                  activeFile={activeFile}
                  onSelectFile={setActiveFile}
                  refreshKey={fileRefreshKey}
                  onFilesChanged={handleFilesChanged}
                />
                <FileViewer
                  agentBase={sandbox.agentBase}
                  activeFile={activeFile}
                  onFileSaved={handleFilesChanged}
                />
              </div>
            )}
          </div>

          {/* Bottom Collapsible & Resizable Terminal */}
          {isTerminalOpen && (
            <div className="flex flex-col shrink-0">
              {/* Drag Resize Handle */}
              <div
                onMouseDown={handleMouseDown}
                className="h-1 bg-white/5 hover:bg-cyan-500/50 cursor-row-resize transition-colors select-none"
                title="Drag to resize terminal"
              />
              <Terminal
                agentBase={sandbox.agentBase}
                height={terminalHeight}
                onResize={setTerminalHeight}
              />
            </div>
          )}
        </div>

        {/* Right AI Assistant Chat Column */}
        <AiChat
          projectId={sandbox.projectId}
          onFilesChanged={handleFilesChanged}
        />
      </div>
    </div>
  );
}
