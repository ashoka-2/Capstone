import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSandbox } from "../hooks/useSandbox.js";
import WorkspaceHeader from "../components/WorkspaceHeader.jsx";
import FileExplorer from "../components/FileExplorer.jsx";
import PreviewFrame from "../components/PreviewFrame.jsx";
import FileViewer from "../components/FileViewer.jsx";
import Terminal from "../components/Terminal.jsx";
import AiChat from "../components/AiChat.jsx";
import { Loader2 } from "lucide-react";

export default function WorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    activeSandbox,
    activeFile,
    fileRefreshKey,
    selectFile,
    refreshFiles,
    closeSandbox,
    setSandbox,
  } = useSandbox();

  const [activeTab, setActiveTab] = useState("preview");
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [terminalHeight, setTerminalHeight] = useState(220);

  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartH = useRef(0);

  // Reconstruct sandbox from URL if page refreshed
  useEffect(() => {
    if (!activeSandbox && id) {
      const host = window.location.hostname;
      const protocol = window.location.protocol;
      const isLocal = host.includes("localhost") || host === "127.0.0.1";

      const agentBase = isLocal
        ? `http://${id}.agent.localhost`
        : `${protocol}//${id}.agent.${host}`;

      const previewUrl = isLocal
        ? `http://${id}.preview.localhost`
        : `${protocol}//${id}.preview.${host}`;

      setSandbox({
        sandboxId: id,
        previewUrl,
        agentBase,
        projectId: id,
        projectTitle: "Workspace",
      });
    }
  }, [activeSandbox, id, setSandbox]);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartH.current = terminalHeight;

    const handleMouseMove = (ev) => {
      if (!isDragging.current) return;
      const delta = dragStartY.current - ev.clientY;
      const newHeight = Math.max(100, Math.min(450, dragStartH.current + delta));
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

  const handleExit = () => {
    closeSandbox();
    navigate("/");
  };

  if (!activeSandbox) {
    return (
      <div className="h-screen w-screen bg-[#0c0a09] flex items-center justify-center text-stone-400 gap-2.5 text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-orange-400" />
        <span>Loading workspace...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0c0a09] text-stone-100 overflow-hidden select-none">
      <WorkspaceHeader
        sandbox={activeSandbox}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExitSandbox={handleExit}
        isTerminalOpen={isTerminalOpen}
        setIsTerminalOpen={setIsTerminalOpen}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left: AI Chat */}
        <AiChat
          projectId={activeSandbox.projectId}
          onFilesChanged={refreshFiles}
        />

        {/* Center/Right: Preview or Code + Terminal */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <div className="flex-1 flex overflow-hidden relative">
            <AnimatePresence mode="wait">
              {activeTab === "preview" ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="w-full h-full"
                >
                  <PreviewFrame previewUrl={activeSandbox.previewUrl} />
                </motion.div>
              ) : (
                <motion.div
                  key="files"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex w-full h-full overflow-hidden"
                >
                  <FileExplorer
                    agentBase={activeSandbox.agentBase}
                    activeFile={activeFile}
                    onSelectFile={selectFile}
                    refreshKey={fileRefreshKey}
                    onFilesChanged={refreshFiles}
                  />
                  <FileViewer
                    agentBase={activeSandbox.agentBase}
                    activeFile={activeFile}
                    onFileSaved={refreshFiles}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {isTerminalOpen && (
            <div className="flex flex-col shrink-0">
              <div
                onMouseDown={handleMouseDown}
                className="h-1 bg-white/[0.04] hover:bg-orange-500/50 cursor-row-resize transition-colors select-none"
              />
              <Terminal
                agentBase={activeSandbox.agentBase}
                height={terminalHeight}
                onResize={setTerminalHeight}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
