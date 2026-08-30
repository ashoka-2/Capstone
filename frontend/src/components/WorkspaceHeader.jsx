import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronDown,
  History,
  Globe,
  Code2,
  Terminal as TermIcon,
  ExternalLink,
  Copy,
  Check,
  X,
  Zap,
  Eye,
  FolderCode,
  MonitorSmartphone,
  MoreHorizontal,
} from "lucide-react";

export default function WorkspaceHeader({
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
    <header className="h-12 w-full bg-[#0c0a09] border-b border-white/[0.06] px-3 flex items-center justify-between select-none z-30 shrink-0">
      {/* Left: Back + Breadcrumb */}
      <div className="flex items-center gap-2">
        <button
          onClick={onExitSandbox}
          className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/[0.05] transition-colors"
          title="Back to Dashboard"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
          <span className="truncate max-w-[140px] md:max-w-[200px]">
            {sandbox?.projectTitle || "Project"}
          </span>
          <span className="text-stone-600">·</span>
          <span className="text-stone-400 flex items-center gap-1 text-[11px] font-normal">
            main <ChevronDown className="w-3 h-3 text-stone-600" />
          </span>
        </div>

        <button className="p-1.5 rounded-lg text-stone-600 hover:text-stone-300 hover:bg-white/[0.04] transition-colors">
          <History className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center: Tabs */}
      <div className="flex items-center gap-0.5 bg-[#1c1917] p-0.5 rounded-lg border border-white/[0.05]">
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
            activeTab === "preview"
              ? "bg-white/[0.08] text-white"
              : "text-stone-500 hover:text-stone-300"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setActiveTab("files")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
            activeTab === "files"
              ? "bg-white/[0.08] text-white"
              : "text-stone-500 hover:text-stone-300"
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Code</span>
        </button>

        <button
          onClick={() => setActiveTab("preview")}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-stone-500 hover:text-stone-300 transition-all"
        >
          <FolderCode className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setIsTerminalOpen(!isTerminalOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-stone-500 hover:text-stone-300 transition-all"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-stone-500 hidden md:inline">Read only</span>

        <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold transition-all">
          Upgrade
        </button>

        <button
          onClick={onExitSandbox}
          className="p-1.5 rounded-lg text-stone-500 hover:text-stone-300 hover:bg-white/[0.05] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
