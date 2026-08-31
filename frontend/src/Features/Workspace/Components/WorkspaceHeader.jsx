import { useState } from "react";
import {
  ChevronLeft,
  ChevronDown,
  History,
  Code2,
  Eye,
  FolderCode,
  Terminal as TermIcon,
  X,
  Copy,
  Check,
  Globe,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { addToast } from "../../../utils/toast.slice.js";

export default function WorkspaceHeader({
  sandbox,
  activeTab,
  setActiveTab,
  onExitSandbox,
  isTerminalOpen,
  setIsTerminalOpen,
}) {
  const dispatch = useDispatch();
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
    <header
      className="h-12 w-full px-3 flex items-center justify-between select-none z-30 shrink-0 border-b"
      style={{
        backgroundColor: "hsl(var(--card))",
        borderColor: "hsl(var(--border) / 0.6)",
      }}
    >
      {/* Left: Project title & Back */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onExitSandbox}
          className="p-1.5 rounded-lg transition-colors hover:opacity-80"
          style={{ color: "hsl(var(--muted-foreground))" }}
          title="Back to Dashboard"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div
          className="flex items-center gap-1.5 text-xs font-semibold min-w-0"
          style={{ color: "hsl(var(--foreground))" }}
        >
          <span className="truncate max-w-[140px] md:max-w-[220px]">
            {sandbox?.projectTitle || "Project Workspace"}
          </span>
          <span style={{ color: "hsl(var(--muted-foreground) / 0.4)" }}>·</span>
          <span
            className="flex items-center gap-1 text-[11px] font-normal"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            main <ChevronDown className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Center tabs: Preview vs Code */}
      <div
        className="flex items-center gap-0.5 p-0.5 rounded-xl border shadow-sm"
        style={{
          backgroundColor: "hsl(var(--muted) / 0.4)",
          borderColor: "hsl(var(--border) / 0.5)",
        }}
      >
        {[
          { key: "preview", icon: Eye, label: "Preview" },
          { key: "files", icon: Code2, label: "Code" },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all"
            style={{
              backgroundColor:
                activeTab === key ? "hsl(var(--card))" : "transparent",
              color:
                activeTab === key
                  ? "hsl(var(--foreground))"
                  : "hsl(var(--muted-foreground))",
              boxShadow:
                activeTab === key
                  ? "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)"
                  : "none",
            }}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}

        <button
          onClick={() => setIsTerminalOpen(!isTerminalOpen)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all"
          style={{
            backgroundColor: isTerminalOpen
              ? "hsl(var(--card))"
              : "transparent",
            color: isTerminalOpen
              ? "hsl(var(--foreground))"
              : "hsl(var(--muted-foreground))",
          }}
          title={isTerminalOpen ? "Hide Terminal" : "Show Terminal"}
        >
          <TermIcon className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Terminal</span>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {sandbox?.previewUrl && (
          <button
            onClick={handleCopyPreview}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all"
            style={{
              backgroundColor: "hsl(var(--muted) / 0.3)",
              borderColor: "hsl(var(--border) / 0.5)",
              color: "hsl(var(--muted-foreground))",
            }}
            title="Copy Preview URL"
          >
            {copied ? (
              <Check
                className="w-3 h-3"
                style={{ color: "hsl(var(--success-foreground))" }}
              />
            ) : (
              <Globe className="w-3 h-3" />
            )}
            <span>{copied ? "Copied" : "Share"}</span>
          </button>
        )}

        <button
          onClick={onExitSandbox}
          className="p-1.5 rounded-lg transition-colors hover:opacity-80"
          style={{ color: "hsl(var(--muted-foreground))" }}
          title="Exit Workspace"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
