import { useState } from "react";
import {
  Code2,
  Globe,
  Terminal,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Power,
  Layers,
  Sparkles,
} from "lucide-react";

export default function TopBar({
  sandbox,
  activeTab,
  setActiveTab,
  onRestartSandbox,
  onExitSandbox,
  isTerminalOpen,
  setIsTerminalOpen,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = () => {
    if (!sandbox?.previewUrl) return;
    navigator.clipboard.writeText(sandbox.previewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="h-14 w-full bg-[#10121a]/95 border-b border-white/10 px-4 flex items-center justify-between select-none z-30 shrink-0 backdrop-blur-md">
      {/* Left: Branding & Project Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white tracking-wide leading-tight">
              {sandbox?.projectTitle || "Cloud Sandbox"}
            </span>
            <span className="text-[10px] font-mono text-gray-400 leading-tight truncate max-w-[140px] md:max-w-[200px]">
              {sandbox?.sandboxId}
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Cluster</span>
        </div>
      </div>

      {/* Center: Main View Switcher */}
      <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/5">
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
            activeTab === "preview"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Preview</span>
        </button>

        <button
          onClick={() => setActiveTab("files")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
            activeTab === "files"
              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Code & Files</span>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Live URL Pill */}
        {sandbox?.previewUrl && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-gray-300">
            <span className="font-mono text-[11px] text-gray-400 truncate max-w-[180px]">
              {sandbox.previewUrl}
            </span>
            <button
              onClick={handleCopyUrl}
              title="Copy URL"
              className="p-1 hover:text-cyan-400 transition-colors"
            >
              {copied ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
            <a
              href={sandbox.previewUrl}
              target="_blank"
              rel="noreferrer"
              title="Open in new tab"
              className="p-1 hover:text-cyan-400 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Terminal Toggle Button */}
        <button
          onClick={() => setIsTerminalOpen(!isTerminalOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            isTerminalOpen
              ? "bg-purple-500/20 border-purple-500/30 text-purple-300"
              : "bg-white/[0.03] border-white/10 text-gray-400 hover:text-gray-200"
          }`}
          title="Toggle Terminal"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Terminal</span>
        </button>

        {/* Exit Workspace Button */}
        <button
          onClick={onExitSandbox}
          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all text-xs font-medium"
          title="Exit Sandbox"
        >
          <Power className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
