import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism/index.js";
import { useTheme } from "../../../Hooks/useTheme.jsx";
import {
  Save,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Edit3,
  Eye,
  RotateCcw,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Download,
  Grid,
  FileImage,
  Code,
  CheckCircle2,
  X,
} from "lucide-react";
import { getFileIcon, isImageFile } from "../../../utils/fileIcons.jsx";
import { useDispatch, useSelector } from "react-redux";
import { addToast } from "../../../utils/toast.slice.js";
import {
  acceptFileChange,
  rejectFileChange,
} from "../State/sandbox.slice.js";

const EXTENSION_MAP = {
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  css: "css",
  html: "html",
  json: "json",
  md: "markdown",
  py: "python",
  sh: "bash",
  yaml: "yaml",
  yml: "yaml",
  svg: "xml",
};

export default function FileViewer({ agentBase, activeFile, onFileSaved }) {
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const pendingChanges = useSelector((state) => state.sandbox.pendingChanges);

  const [content, setContent] = useState("");
  const [initialContent, setInitialContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Image Viewer States
  const [imageSrc, setImageSrc] = useState(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState(null);
  const [showCheckerboard, setShowCheckerboard] = useState(true);
  const [svgViewMode, setSvgViewMode] = useState("preview"); // "preview" | "code"

  const debounceTimerRef = useRef(null);
  const objectUrlRef = useRef(null);
  const isImage = isImageFile(activeFile);
  const isSvg = activeFile ? activeFile.split("?")[0].toLowerCase().endsWith(".svg") : false;

  const cleanPath = activeFile ? activeFile.replace(/\\/g, "/").replace(/^\/+/, "") : "";

  // Check if active file has an AI pending change
  const pendingChangeEntry = useMemo(() => {
    if (!cleanPath) return null;
    return (
      pendingChanges[cleanPath] ||
      pendingChanges[`/${cleanPath}`] ||
      pendingChanges[`/app/${cleanPath}`] ||
      pendingChanges[`app/${cleanPath}`]
    );
  }, [cleanPath, pendingChanges]);

  // Derive language for syntax highlighting
  const fileLanguage = useMemo(() => {
    if (!activeFile) return "javascript";
    const ext = activeFile.split(".").pop()?.toLowerCase();
    return EXTENSION_MAP[ext] || "javascript";
  }, [activeFile]);

  // Cleanup object URL
  const cleanupObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  // Main file loader
  const loadActiveFile = useCallback(async () => {
    if (!activeFile || !agentBase) {
      setContent("");
      setInitialContent("");
      setImageSrc(null);
      setImageLoading(false);
      cleanupObjectUrl();
      return;
    }

    setLoading(true);
    setImageLoading(true);
    setImageError(false);
    setError(null);
    setImageZoom(1);
    cleanupObjectUrl();

    try {
      const res = await fetch(
        `${agentBase}/read-files?files=${encodeURIComponent(cleanPath)}`
      );

      let retrieved = null;

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.files) && data.files.length > 0) {
          if (data.files.length === 1) {
            retrieved = Object.values(data.files[0])[0];
          } else {
            for (const item of data.files) {
              const key = Object.keys(item)[0];
              if (
                key &&
                (key.endsWith(cleanPath) ||
                  key.replace(/^\/+/, "") === cleanPath ||
                  cleanPath.endsWith(key.replace(/^\/+/, "")))
              ) {
                retrieved = item[key];
                break;
              }
            }
          }
        } else if (typeof data === "string") {
          retrieved = data;
        }
      }

      const isErrorString = typeof retrieved === "string" && retrieved.startsWith("Error reading file");

      if (isImage) {
        if (!isErrorString && retrieved) {
          if (isSvg) {
            setContent(retrieved);
            setInitialContent(retrieved);
            const blob = new Blob([retrieved], { type: "image/svg+xml" });
            const objUrl = URL.createObjectURL(blob);
            objectUrlRef.current = objUrl;
            setImageSrc(objUrl);
          } else if (retrieved.startsWith("data:image/")) {
            setImageSrc(retrieved);
          } else {
            await tryBlobFetch();
          }
        } else {
          await tryBlobFetch();
        }
      } else {
        if (isErrorString) throw new Error(retrieved);
        setContent(retrieved || "");
        setInitialContent(retrieved || "");
      }
    } catch (err) {
      if (isImage) {
        await tryBlobFetch();
      } else {
        setError(`Failed to read file: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [activeFile, agentBase, isImage, isSvg, cleanPath, cleanupObjectUrl]);

  // Fallback blob fetch for binary assets
  const tryBlobFetch = async () => {
    try {
      const candidates = [
        `${agentBase}/raw-file?file=${encodeURIComponent(cleanPath)}`,
        `${agentBase}/workspace/${cleanPath}`,
        `${agentBase}/raw/${cleanPath}`,
        `${agentBase}/${cleanPath}`,
      ];

      for (const url of candidates) {
        try {
          const blobRes = await fetch(url);
          if (blobRes.ok) {
            const blob = await blobRes.blob();
            if (blob.size > 0) {
              cleanupObjectUrl();
              const objUrl = URL.createObjectURL(blob);
              objectUrlRef.current = objUrl;
              setImageSrc(objUrl);
              return;
            }
          }
        } catch {
          // continue
        }
      }
      setImageSrc(`${agentBase}/raw-file?file=${encodeURIComponent(cleanPath)}`);
    } catch (e) {
      setImageError(true);
      setImageLoading(false);
    }
  };

  useEffect(() => {
    loadActiveFile();
    return () => cleanupObjectUrl();
  }, [loadActiveFile, cleanupObjectUrl]);

  // Auto-save debounced while editing
  const saveFileContent = useCallback(
    async (newContent) => {
      if (!activeFile || !agentBase || (isImage && !isSvg)) return;
      setSaving(true);
      try {
        const res = await fetch(`${agentBase}/update-files`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            updates: [{ file: cleanPath, content: newContent }],
          }),
        });
        if (res.ok) {
          setInitialContent(newContent);
          setAutoSaved(true);
          if (isSvg) {
            cleanupObjectUrl();
            const blob = new Blob([newContent], { type: "image/svg+xml" });
            const objUrl = URL.createObjectURL(blob);
            objectUrlRef.current = objUrl;
            setImageSrc(objUrl);
          }
          onFileSaved?.();
          setTimeout(() => setAutoSaved(false), 2000);
        }
      } catch (err) {
        console.error("Auto-save error:", err);
      } finally {
        setSaving(false);
      }
    },
    [activeFile, agentBase, isImage, isSvg, cleanPath, onFileSaved, cleanupObjectUrl]
  );

  const handleContentChange = (e) => {
    const val = e.target.value;
    setContent(val);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      saveFileContent(val);
    }, 600);
  };

  const handleManualSave = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    saveFileContent(content);
    dispatch(
      addToast({
        message: `Saved changes to ${activeFile}`,
        type: "success",
      })
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    dispatch(
      addToast({
        message: "File code copied to clipboard",
        type: "success",
      })
    );
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!imageSrc) return;
    const a = document.createElement("a");
    a.href = imageSrc;
    a.download = activeFile.split("/").pop() || "image";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Accept file changes from AI
  const handleAcceptChange = () => {
    dispatch(acceptFileChange({ filePath: cleanPath }));
    dispatch(
      addToast({
        message: `Accepted AI changes for ${activeFile}`,
        type: "success",
      })
    );
  };

  // Reject and revert file changes from AI
  const handleRejectChange = async () => {
    if (!pendingChangeEntry || !agentBase) return;
    try {
      const prevContent = pendingChangeEntry.previousContent;
      if (prevContent !== null && prevContent !== undefined) {
        await fetch(`${agentBase}/update-files`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            updates: [{ file: cleanPath, content: prevContent }],
          }),
        });
        setContent(prevContent);
        setInitialContent(prevContent);
      } else {
        await fetch(`${agentBase}/delete`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paths: [cleanPath] }),
        });
      }

      dispatch(rejectFileChange({ filePath: cleanPath }));
      dispatch(
        addToast({
          message: `Reverted ${activeFile} to previous version`,
          type: "info",
        })
      );
      onFileSaved?.();
    } catch (err) {
      dispatch(
        addToast({
          message: `Revert failed: ${err.message}`,
          type: "error",
        })
      );
    }
  };

  const lines = content.split("\n");
  const isDirty = content !== initialContent;

  if (!activeFile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#171717] text-neutral-500 text-xs select-none">
        <Code className="w-8 h-8 mb-2 text-neutral-600" />
        <span>Select a file from the explorer to view or edit</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e1e1e] overflow-hidden select-none">
      {/* ── Optional AI Modification Banner ── */}
      {pendingChangeEntry && (
        <div className="px-4 py-2 bg-[#ff5a5f]/15 border-b border-[#ff5a5f]/30 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-2 text-xs text-neutral-200">
            <Sparkles className="w-4 h-4 text-[#ff7e40] animate-pulse" />
            <span className="font-semibold text-neutral-100">Modified by AI Agent</span>
            <span className="text-[11px] text-neutral-400 hidden sm:inline">
              • Review changes before accepting
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAcceptChange}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#ff5a5f] to-[#ff7e40] hover:opacity-90 text-white text-xs font-semibold flex items-center gap-1 transition-all shadow-sm shadow-[#ff5a5f]/20"
            >
              <Check className="w-3.5 h-3.5" /> Accept
            </button>
            <button
              onClick={handleRejectChange}
              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-red-500/20 hover:text-red-400 text-neutral-300 text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reject & Revert
            </button>
          </div>
        </div>
      )}

      {/* ── File Toolbar ── */}
      <div className="h-10 px-3 bg-panel border-b border-subtle flex items-center justify-between shrink-0 text-xs text-main transition-colors duration-200">
        <div className="flex items-center gap-2 min-w-0">
          {getFileIcon(activeFile)}
          <span className="font-mono text-main text-xs truncate max-w-[200px] md:max-w-md">
            {activeFile}
          </span>
          {isDirty && (
            <span className="w-2 h-2 rounded-full bg-[#ff7e40]" title="Unsaved changes" />
          )}
          {autoSaved && (
            <span className="text-[10px] text-[#ff7e40] font-mono flex items-center gap-1">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Toggle View / Edit mode */}
          {(!isImage || isSvg) && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors ${
                isEditing
                  ? "bg-[#ff5a5f]/20 text-[#ff7e40] border border-[#ff5a5f]/40 font-semibold"
                  : "hover:bg-black/5 dark:hover:bg-neutral-700 text-sub hover:text-main"
              }`}
              title={isEditing ? "Switch to Syntax Highlighting View" : "Edit File"}
            >
              {isEditing ? (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">View</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </>
              )}
            </button>
          )}

          {/* Manual Save */}
          {isEditing && (
            <button
              onClick={handleManualSave}
              disabled={saving}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-neutral-700 text-sub hover:text-main transition-colors"
              title="Save File"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {/* Copy Code */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-neutral-700 text-sub hover:text-main transition-colors"
            title="Copy Content"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-[#ff7e40]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* ── Content View Area ── */}
      <div className="flex-1 relative flex overflow-hidden font-mono text-xs bg-canvas">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-panel/90 text-sub">
            <Loader2 className="w-5 h-5 animate-spin text-[#ff7e40]" />
            <span>Loading file content...</span>
          </div>
        ) : error ? (
          <div className="p-4 flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        ) : isImage && svgViewMode === "preview" ? (
          /* Image Preview */
          <div
            className="flex-1 flex flex-col items-center justify-center p-6 overflow-auto relative"
            style={{
              background: showCheckerboard
                ? isDark
                  ? "repeating-conic-gradient(rgba(255,255,255,0.03) 0% 25%, transparent 0% 50%) 50% / 24px 24px #121212"
                  : "repeating-conic-gradient(rgba(0,0,0,0.03) 0% 25%, transparent 0% 50%) 50% / 24px 24px #f4f5f8"
                : isDark ? "#171717" : "#e9edf4",
            }}
          >
            {imageSrc && (
              <img
                src={imageSrc}
                alt={activeFile}
                className="max-h-[70vh] max-w-[80vw] object-contain rounded-lg shadow-2xl"
              />
            )}
          </div>
        ) : isEditing ? (
          /* Code Editor (Textarea with line numbers) */
          <div className="flex-1 flex overflow-auto bg-panel">
            <div className="py-3 px-3 bg-aside border-r border-subtle text-right select-none font-mono text-sub opacity-70 shrink-0">
              {lines.map((_, i) => (
                <div key={i} className="leading-5 text-[11px]">
                  {i + 1}
                </div>
              ))}
            </div>
            <textarea
              value={content}
              onChange={handleContentChange}
              spellCheck="false"
              className="flex-1 p-3 bg-transparent text-main resize-none focus:outline-none font-mono text-xs leading-5 whitespace-pre tab-4"
            />
          </div>
        ) : (
          /* Syntax Highlighted View (VS Code vscDarkPlus in Dark mode, oneLight in Light mode) */
          <div className="flex-1 overflow-auto bg-panel">
            <SyntaxHighlighter
              language={fileLanguage}
              style={isDark ? vscDarkPlus : oneLight}
              showLineNumbers={true}
              customStyle={{
                margin: 0,
                padding: "0.75rem",
                background: isDark ? "#1e1e1e" : "#fafbfe",
                fontSize: "0.8125rem",
                lineHeight: "1.6",
                minHeight: "100%",
                fontFamily:
                  "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, Consolas, monospace",
              }}
              lineNumberStyle={{
                color: isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.28)",
                fontSize: "0.75rem",
                minWidth: "2.5em",
                textAlign: "right",
                paddingRight: "1em",
              }}
            >
              {content || " "}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
    </div>
  );
}
