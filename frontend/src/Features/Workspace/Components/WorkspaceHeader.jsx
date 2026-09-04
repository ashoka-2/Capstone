import { useState } from "react";
import {
  ChevronLeft,
  ChevronDown,
  Code2,
  Eye,
  Terminal as TermIcon,
  X,
  Copy,
  Check,
  Globe,
  PanelLeft,
  PanelLeftClose,
  Sun,
  Moon,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { addToast } from "../../../utils/toast.slice.js";
import { useTheme } from "../../../Hooks/useTheme.jsx";

export default function WorkspaceHeader({
  sandbox,
  activeTab,
  setActiveTab,
  onExitSandbox,
  isTerminalOpen,
  setIsTerminalOpen,
  isChatOpen = true,
  setIsChatOpen,
}) {
  const dispatch = useDispatch();
  const { toggleTheme, isDark } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopyPreview = () => {
    if (sandbox?.previewUrl) {
      navigator.clipboard.writeText(sandbox.previewUrl);
      setCopied(true);
      dispatch(
        addToast({
          message: "Preview link copied to clipboard!",
          type: "success",
        })
      );
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="h-12 w-full px-3 flex items-center justify-between select-none z-30 shrink-0 border-b border-subtle bg-aside text-main transition-colors duration-200">
      {/* Left: Project title & Back & Chat toggle */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onExitSandbox}
          className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-neutral-800 text-sub hover:text-main transition-colors"
          title="Back to Dashboard"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {setIsChatOpen && (
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-1.5 rounded-lg transition-colors ${
              isChatOpen
                ? "bg-black/10 dark:bg-neutral-800 text-main"
                : "text-sub hover:bg-black/5 dark:hover:bg-neutral-800 hover:text-main"
            }`}
            title={isChatOpen ? "Hide AI Assistant" : "Show AI Assistant"}
          >
            {isChatOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>
        )}

        <div className="flex items-center gap-1.5 text-xs font-semibold min-w-0">
          <span className="truncate max-w-[120px] sm:max-w-[200px] text-main">
            {sandbox?.projectTitle || "Project Workspace"}
          </span>
          <span className="text-sub opacity-50">·</span>
          <span className="flex items-center gap-1 text-[11px] font-mono text-sub">
            main <ChevronDown className="w-3 h-3 text-sub opacity-60" />
          </span>
        </div>
      </div>

      {/* Center tabs: Preview vs Code vs Terminal */}
      <div className="flex items-center gap-1 p-0.5 rounded-xl bg-panel border border-subtle shadow-sm">
        {[
          { key: "preview", icon: Eye, label: "Preview" },
          { key: "files", icon: Code2, label: "Code" },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === key
                ? "bg-gradient-to-r from-[#ff5a5f] to-[#ff7e40] text-white shadow-sm font-semibold shadow-[#ff5a5f]/20"
                : "text-sub hover:text-main"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}

        <button
          onClick={() => setIsTerminalOpen(!isTerminalOpen)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all ${
            isTerminalOpen
              ? "bg-black/10 dark:bg-neutral-700/80 text-main font-semibold"
              : "text-sub hover:text-main"
          }`}
          title={isTerminalOpen ? "Hide Terminal" : "Show Terminal"}
        >
          <TermIcon className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Terminal</span>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5">
        {sandbox?.previewUrl && (
          <button
            onClick={handleCopyPreview}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono border border-subtle bg-panel text-sub hover:text-main hover:border-[#ff5a5f]/40 transition-all"
            title="Copy Preview URL"
          >
            {copied ? (
              <Check className="w-3 h-3 text-[#ff7e40]" />
            ) : (
              <Globe className="w-3 h-3 text-[#ff7e40]" />
            )}
            <span>{copied ? "Copied" : "Share"}</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={(e) => toggleTheme(e)}
          className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-neutral-800 text-sub hover:text-main transition-transform hover:rotate-45"
          title={isDark ? "Switch to soothing light mode" : "Switch to studio dark mode"}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
        </button>

        <button
          onClick={onExitSandbox}
          className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-neutral-800 text-sub hover:text-main transition-colors"
          title="Exit Workspace"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
