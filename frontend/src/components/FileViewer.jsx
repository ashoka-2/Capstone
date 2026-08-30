import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Copy,
  Check,
  FileCode,
  Loader2,
  AlertCircle,
  FileCheck,
} from "lucide-react";

export default function FileViewer({ agentBase, activeFile, onFileSaved }) {
  const [content, setContent] = useState("");
  const [initialContent, setInitialContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!activeFile || !agentBase) {
      setContent("");
      setInitialContent("");
      return;
    }

    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${agentBase}/read-files?files=${encodeURIComponent(activeFile)}`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();
        const fileData = data[0] || (Array.isArray(data) ? data[0] : data);
        const fileContent = typeof fileData === "string" ? fileData : fileData?.content ?? "";
        setContent(fileContent);
        setInitialContent(fileContent);
      } catch (err) {
        setError(`Failed to read file: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [activeFile, agentBase]);

  const handleSave = async () => {
    if (!activeFile || !agentBase) return;
    setSaving(true);
    try {
      const res = await fetch(`${agentBase}/update-files`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: [{ file: activeFile, content }],
        }),
      });
      if (!res.ok) throw new Error(`Save failed with status ${res.status}`);
      setInitialContent(content);
      onFileSaved?.();
    } catch (err) {
      alert(`Save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDirty = content !== initialContent;

  if (!activeFile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#07080e] text-slate-500 text-xs p-6 select-none">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-3">
          <FileCode className="w-6 h-6 text-slate-600" />
        </div>
        <span className="font-medium text-slate-400">No file selected</span>
        <span className="text-[11px] text-slate-600 mt-0.5">
          Select a file from the explorer to view or edit code
        </span>
      </div>
    );
  }

  const lines = content.split("\n");

  return (
    <div className="flex-1 flex flex-col h-full bg-[#07080e] overflow-hidden">
      {/* File Header Bar */}
      <div className="h-10 px-4 bg-[#0a0c13] border-b border-white/[0.07] flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2.5">
          <FileCode className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-mono text-slate-200">{activeFile}</span>
          {isDirty ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
              Modified
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
              <FileCheck className="w-3 h-3 text-emerald-500/70" /> Saved
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Copy Code"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-30 disabled:hover:from-cyan-500 text-white font-semibold text-xs transition-all shadow-md shadow-cyan-500/20"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save</span>
          </motion.button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 relative flex overflow-hidden font-mono text-xs">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#07080e]/90 gap-2 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Reading file from cluster...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        ) : (
          <div className="flex-1 flex overflow-auto">
            {/* Line Numbers */}
            <div className="py-3 px-3 bg-[#05060a] border-r border-white/[0.04] text-slate-600 text-right select-none font-mono">
              {lines.map((_, i) => (
                <div key={i} className="leading-5 text-[11px]">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code Textarea */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              spellCheck="false"
              className="flex-1 p-3 bg-transparent text-slate-200 resize-none focus:outline-none font-mono text-xs leading-5 whitespace-pre tab-4 selection:bg-cyan-500/30"
              style={{ tabSize: 2 }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
