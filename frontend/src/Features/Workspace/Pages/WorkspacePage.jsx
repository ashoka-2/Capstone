import { useState, useRef, useEffect, useCallback } from "react";
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
  const [isChatOpen, setIsChatOpen] = useState(true);

  // Persistent panel dimensions from localStorage
  const [chatWidth, setChatWidth] = useState(() => {
    const saved = localStorage.getItem("lovable_chat_width");
    return saved ? Math.max(260, Math.min(650, parseInt(saved, 10))) : 380;
  });

  const [explorerWidth, setExplorerWidth] = useState(() => {
    const saved = localStorage.getItem("lovable_explorer_width");
    return saved ? Math.max(160, Math.min(450, parseInt(saved, 10))) : 240;
  });

  const [terminalHeight, setTerminalHeight] = useState(() => {
    const saved = localStorage.getItem("lovable_terminal_height");
    return saved ? Math.max(100, Math.min(500, parseInt(saved, 10))) : 220;
  });

  // Dragging refs
  const isDraggingChat = useRef(false);
  const isDraggingExplorer = useRef(false);
  const isDraggingTerminal = useRef(false);
  const dragStartX = useRef(0);
  const dragStartChatW = useRef(0);
  const dragStartExpW = useRef(0);
  const dragStartY = useRef(0);
  const dragStartTermH = useRef(0);

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

  // Global mouse handlers for resizing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingChat.current) {
        const delta = e.clientX - dragStartX.current;
        const newW = Math.max(260, Math.min(650, dragStartChatW.current + delta));
        setChatWidth(newW);
        localStorage.setItem("lovable_chat_width", String(newW));
      } else if (isDraggingExplorer.current) {
        const delta = e.clientX - dragStartX.current;
        const newW = Math.max(160, Math.min(450, dragStartExpW.current + delta));
        setExplorerWidth(newW);
        localStorage.setItem("lovable_explorer_width", String(newW));
      } else if (isDraggingTerminal.current) {
        const delta = dragStartY.current - e.clientY;
        const newH = Math.max(100, Math.min(500, dragStartTermH.current + delta));
        setTerminalHeight(newH);
        localStorage.setItem("lovable_terminal_height", String(newH));
      }
    };

    const handleMouseUp = () => {
      isDraggingChat.current = false;
      isDraggingExplorer.current = false;
      isDraggingTerminal.current = false;
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Chat resize start
  const handleChatResizeStart = (e) => {
    e.preventDefault();
    isDraggingChat.current = true;
    dragStartX.current = e.clientX;
    dragStartChatW.current = chatWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  // Explorer resize start
  const handleExplorerResizeStart = (e) => {
    e.preventDefault();
    isDraggingExplorer.current = true;
    dragStartX.current = e.clientX;
    dragStartExpW.current = explorerWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  // Terminal resize start
  const handleTerminalResizeStart = (e) => {
    e.preventDefault();
    isDraggingTerminal.current = true;
    dragStartY.current = e.clientY;
    dragStartTermH.current = terminalHeight;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  };

  const handleExit = () => {
    exitSandbox();
    navigate("/");
  };

  if (!activeSandbox) {
    return (
      <div className="h-screen w-screen flex items-center justify-center gap-2.5 text-xs bg-canvas text-sub">
        <Loader2 className="w-5 h-5 animate-spin text-[#ff7e40]" />
        <span>Loading workspace container...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-screen w-screen overflow-hidden select-none bg-canvas text-main transition-colors duration-200"
    >
      <WorkspaceHeader
        sandbox={activeSandbox}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExitSandbox={handleExit}
        isTerminalOpen={isTerminalOpen}
        setIsTerminalOpen={setIsTerminalOpen}
        isChatOpen={isChatOpen}
        setIsChatOpen={setIsChatOpen}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: AI Chat with resize handle */}
        <AnimatePresence initial={false}>
          {isChatOpen && (
            <motion.div
              key="chat"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: chatWidth, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="h-full flex overflow-hidden shrink-0 z-20"
            >
              <AiChat
                projectId={activeSandbox.projectId}
                initialPrompt={initialPrompt}
                onFilesChanged={refreshFiles}
                onToggleCollapse={() => setIsChatOpen(false)}
                width={chatWidth}
              />
              {/* Horizontal resize handle between Chat and Main Area */}
              <div
                onMouseDown={handleChatResizeStart}
                className="w-1 cursor-col-resize hover:bg-[#ff5a5f]/60 bg-aside border-r border-subtle transition-colors shrink-0 z-20"
                title="Drag to resize AI Assistant panel"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Main Area: Preview or Code + Terminal */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-canvas">
          <div className="flex-1 flex overflow-hidden relative">
            <AnimatePresence mode="wait">
              {activeTab === "preview" ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
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
                  transition={{ duration: 0.18 }}
                  className="flex-1 flex w-full h-full overflow-hidden"
                >
                  <FileExplorer
                    agentBase={activeSandbox.agentBase}
                    activeFile={activeFile}
                    onSelectFile={selectFile}
                    refreshKey={fileRefreshKey}
                    onFilesChanged={refreshFiles}
                    width={explorerWidth}
                  />

                  {/* Horizontal resize handle between FileExplorer and FileViewer */}
                  <div
                    onMouseDown={handleExplorerResizeStart}
                    className="w-1 cursor-col-resize hover:bg-[#ff5a5f]/60 bg-aside border-r border-subtle transition-colors shrink-0 z-10"
                    title="Drag to resize Explorer panel"
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

          {/* Terminal Panel with vertical resize handle */}
          {isTerminalOpen && (
            <div className="flex flex-col shrink-0">
              <div
                onMouseDown={handleTerminalResizeStart}
                className="h-1 cursor-row-resize bg-aside border-t border-subtle hover:bg-[#ff5a5f]/60 transition-colors"
                title="Drag to resize Terminal panel"
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
    </motion.div>
  );
}
