import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSandbox } from "../Hooks/useSandbox.js";
import WorkspaceHeader from "../Components/WorkspaceHeader.jsx";
import FileExplorer from "../Components/FileExplorer.jsx";
import PreviewFrame from "../Components/PreviewFrame.jsx";
import FileViewer from "../Components/FileViewer.jsx";
import Terminal from "../Components/Terminal.jsx";
import AiChat from "../Components/AiChat.jsx";
import { Loader2 } from "lucide-react";

export default function WorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialPrompt = location.state?.initialPrompt;
  const {
    activeSandbox,
    activeFile,
    fileRefreshKey,
    selectFile,
    refreshFiles,
    exitSandbox,
    setSandbox,
  } = useSandbox();

  const [activeTab, setActiveTab] = useState("preview");
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [terminalHeight, setTerminalHeight] = useState(220);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartH = useRef(0);

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
      setTerminalHeight(
        Math.max(
          100,
          Math.min(450, dragStartH.current + (dragStartY.current - ev.clientY))
        )
      );
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
    exitSandbox();
    navigate("/");
  };

  if (!activeSandbox) {
    return (
      <div
        className="h-screen w-screen flex items-center justify-center gap-2.5 text-xs"
        style={{
          backgroundColor: "hsl(var(--background))",
          color: "hsl(var(--muted-foreground))",
        }}
      >
        <Loader2
          className="w-5 h-5 animate-spin"
          style={{ color: "hsl(var(--brand-tiger-primary))" }}
        />
        <span>Loading workspace...</span>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden select-none"
      style={{
        backgroundColor: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
      }}
    >
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
          initialPrompt={initialPrompt}
          onFilesChanged={refreshFiles}
        />
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <div className="flex-1 flex overflow-hidden relative">
            <AnimatePresence mode="wait">
              {activeTab === "preview" ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
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
                className="h-1 cursor-row-resize transition-colors"
                style={{ backgroundColor: "hsl(var(--border) / 0.3)" }}
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
