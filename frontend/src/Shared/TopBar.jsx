import { useState } from "react";
import { motion } from "framer-motion";
import {
  Code2,
  Globe,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  Power,
  Sparkles,
  Cpu,
  Layers,
} from "lucide-react";

export default function TopBar({
  sandbox,
  activeTab,
  setActiveTab,
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
    <header className="h-14 w-full bg-[#07080e]/90 border-b border-white/[0.07] px-4 md:px-6 flex items-center justify-between select-none z-30 shrink-0 backdrop-blur-2xl">
      {/* Left: Branding & Sandbox Details */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full rounded-[11px] bg-[#090b12] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-300" />
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-bold text-white tracking-tight leading-tight">
              {sandbox?.projectTitle || "Cloud Sandbox"}
            </span>
            <span className="text-[10px] font-mono text-slate-400 leading-tight truncate max-w-[130px] md:max-w-[220px]">
              {sandbox?.sandboxId}
            </span>
          </div>
        </div>

        {/* Live Cluster Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-medium text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span>K8s Live</span>
        </div>
      </div>

      {/* Center: Floating Segmented Dock */}
      <div className="flex items-center bg-[#0d0f18] p-1 rounded-2xl border border-white/[0.08] shadow-inner">
        <button
          onClick={() => setActiveTab("preview")}
          className={`relative flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-medium transition-colors z-10 ${
            activeTab === "preview"
              ? "text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {activeTab === "preview" && (
            <motion.div
              layoutId="topbar-active-pill"
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/25 to-indigo-500/25 border border-cyan-500/40 shadow-sm"
              transition={{ type: "spring", stiffness: 450, damping: 35 }}
            />
          )}
          <Globe className="w-3.5 h-3.5" />
          <span>Live Preview</span>
        </button>

        <button
          onClick={() => setActiveTab("files")}
          className={`relative flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-medium transition-colors z-10 ${
            activeTab === "files"
              ? "text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {activeTab === "files" && (
            <motion.div
              layoutId="topbar-active-pill"
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/25 to-purple-500/25 border border-indigo-500/40 shadow-sm"
              transition={{ type: "spring", stiffness: 450, damping: 35 }}
            />
          )}
          <Code2 className="w-3.5 h-3.5" />
          <span>Source & Files</span>
        </button>
      </div>

      {/* Right: Action Utilities */}
      <div className="flex items-center gap-2.5">
        {/* Live URL Display */}
        {sandbox?.previewUrl && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.07] text-xs text-slate-300">
            <span className="font-mono text-[11px] text-slate-400 truncate max-w-[200px]">
              {sandbox.previewUrl}
            </span>
            <button
              onClick={handleCopyUrl}
              title="Copy URL"
              className="p-1 hover:text-cyan-300 transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
            <a
              href={sandbox.previewUrl}
              target="_blank"
              rel="noreferrer"
              title="Open in new tab"
              className="p-1 hover:text-cyan-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Terminal Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsTerminalOpen(!isTerminalOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
            isTerminalOpen
              ? "bg-purple-500/20 border-purple-500/30 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
              : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white"
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Terminal</span>
        </motion.button>

        {/* Exit Workspace */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onExitSandbox}
          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all shadow-sm"
          title="Exit Workspace"
        >
          <Power className="w-3.5 h-3.5" />
        </motion.button>
      </div>
    </header>
  );
}
