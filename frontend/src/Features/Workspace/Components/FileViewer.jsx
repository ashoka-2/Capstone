import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  FileCheck2,
  Edit3,
  Eye,
  RotateCcw,
  Sparkles,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import { getFileIcon, isImageFile } from "../../../utils/fileIcons.jsx";
import { useDispatch } from "react-redux";
import { addToast } from "../../../utils/toast.slice.js";

export default function FileViewer({ agentBase, activeFile, onFileSaved }) {
  const dispatch = useDispatch();
  const [content, setContent] = useState("");
  const [initialContent, setInitialContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);

  const debounceTimerRef = useRef(null);
  const isImage = isImageFile(activeFile);

  // Fetch only the selected file's content
  useEffect(() => {
    if (!activeFile || !agentBase) {
      setContent("");
      setInitialContent("");
      setIsEditing(false);
      return;
    }

    if (isImage) {
      setLoading(false);
      setIsEditing(false);
      return;
    }

    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      setIsEditing(false);
      try {
        const cleanPath = activeFile.replace(/^\/+/, "");
        const res = await fetch(
          `${agentBase}/read-files?files=${encodeURIComponent(cleanPath)}`
        );
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();

        let fileContent = "";
        if (Array.isArray(data.files)) {
          for (const item of data.files) {
            const key = Object.keys(item)[0];
            if (
              key &&
              (key.endsWith(cleanPath) ||
                key.replace(/^\/+/, "") === cleanPath)
            ) {
              fileContent = item[key];
              break;
            }
          }
        } else if (typeof data === "string") {
          fileContent = data;
        }

        setContent(fileContent || "");
        setInitialContent(fileContent || "");
      } catch (err) {
        setError(`Failed to read file: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [activeFile, agentBase, isImage]);

  // Live Auto-save debounced while editing so preview updates live
  const saveFileContent = useCallback(
    async (newContent) => {
      if (!activeFile || !agentBase || isImage) return;
      setSaving(true);
      try {
        const cleanPath = activeFile.replace(/^\/+/, "");
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
          onFileSaved?.();
          setTimeout(() => setAutoSaved(false), 2000);
        }
      } catch (err) {
        console.error("Auto-save error:", err);
      } finally {
        setSaving(false);
      }
    },
    [activeFile, agentBase, isImage, onFileSaved]
  );

  const handleContentChange = (e) => {
    const val = e.target.value;
    setContent(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    // Debounce live preview update by 600ms
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
    dispatch(addToast({ message: "Code copied to clipboard!", type: "info" }));
    setTimeout(() => setCopied(false), 2000);
  };

  const isDirty = content !== initialContent;

  if (!activeFile) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center text-xs p-6 select-none"
        style={{
          backgroundColor: "hsl(var(--card))",
          color: "hsl(var(--muted-foreground))",
        }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
          style={{
            backgroundColor: "hsl(var(--muted) / 0.4)",
            border: "1px solid hsl(var(--border) / 0.5)",
          }}
        >
          {getFileIcon("code.jsx")}
        </div>
        <span
          className="font-medium"
          style={{ color: "hsl(var(--foreground))" }}
        >
          No file selected
        </span>
        <span className="text-[11px] opacity-70 mt-0.5">
          Select any file from the explorer to view or edit code
        </span>
      </div>
    );
  }

  const lines = content.split("\n");

  return (
    <div
      className="flex-1 flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: "hsl(var(--background))" }}
    >
      {/* File Header Bar */}
      <div
        className="h-10 px-4 border-b flex items-center justify-between shrink-0 select-none"
        style={{
          backgroundColor: "hsl(var(--card))",
          borderColor: "hsl(var(--border) / 0.6)",
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {getFileIcon(activeFile)}
          <span
            className="text-xs font-mono truncate"
            style={{ color: "hsl(var(--foreground))" }}
          >
            {activeFile}
          </span>

          {!isImage && (
            <>
              {isEditing ? (
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{
                    backgroundColor: "hsl(var(--brand-tiger-primary) / 0.15)",
                    color: "hsl(var(--brand-tiger-primary))",
                    border: "1px solid hsl(var(--brand-tiger-primary) / 0.3)",
                  }}
                >
                  Editing
                </span>
              ) : (
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{
                    backgroundColor: "hsl(var(--muted) / 0.5)",
                    color: "hsl(var(--muted-foreground))",
                  }}
                >
                  Read only
                </span>
              )}

              {saving && (
                <span
                  className="flex items-center gap-1 text-[10px] font-mono animate-pulse"
                  style={{ color: "hsl(var(--brand-tiger-primary))" }}
                >
                  <Loader2 className="w-3 h-3 animate-spin" /> Live syncing...
                </span>
              )}

              {autoSaved && !saving && (
                <span
                  className="flex items-center gap-1 text-[10px] font-mono"
                  style={{ color: "hsl(var(--success-foreground))" }}
                >
                  <FileCheck2 className="w-3 h-3" /> Live synced
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {!isImage && (
            <>
              {/* Edit Mode Toggle Button */}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                style={{
                  backgroundColor: isEditing
                    ? "hsl(var(--brand-tiger-primary) / 0.2)"
                    : "hsl(var(--muted) / 0.4)",
                  color: isEditing
                    ? "hsl(var(--brand-tiger-primary))"
                    : "hsl(var(--muted-foreground))",
                  border: `1px solid ${
                    isEditing
                      ? "hsl(var(--brand-tiger-primary) / 0.4)"
                      : "hsl(var(--border) / 0.4)"
                  }`,
                }}
                title={isEditing ? "Switch to Read Only" : "Enable Editing"}
              >
                {isEditing ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Viewing</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </>
                )}
              </button>

              {/* Copy Code */}
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg transition-colors hover:opacity-80"
                style={{ color: "hsl(var(--muted-foreground))" }}
                title="Copy Content"
              >
                {copied ? (
                  <Check
                    className="w-3.5 h-3.5"
                    style={{ color: "hsl(var(--success-foreground))" }}
                  />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Save Button */}
              {isEditing && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleManualSave}
                  disabled={saving || !isDirty}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-white font-semibold text-xs shadow-md transition-all disabled:opacity-40"
                  style={{
                    backgroundColor: "hsl(var(--primary))",
                    color: "hsl(var(--primary-foreground))",
                  }}
                >
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Save</span>
                </motion.button>
              )}
            </>
          )}

          {isImage && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setImageZoom((z) => Math.max(0.5, z - 0.25))}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "hsl(var(--muted-foreground))" }}
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span
                className="text-[10px] font-mono"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                {Math.round(imageZoom * 100)}%
              </span>
              <button
                onClick={() => setImageZoom((z) => Math.min(3, z + 0.25))}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "hsl(var(--muted-foreground))" }}
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Editor / Image Display Content */}
      <div className="flex-1 relative flex overflow-hidden font-mono text-xs">
        {loading ? (
          <div
            className="absolute inset-0 flex items-center justify-center gap-2"
            style={{
              backgroundColor: "hsl(var(--background) / 0.9)",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            <Loader2
              className="w-4 h-4 animate-spin"
              style={{ color: "hsl(var(--brand-tiger-primary))" }}
            />
            <span>Loading file content...</span>
          </div>
        ) : error ? (
          <div
            className="p-4 flex items-center gap-2 text-xs"
            style={{ color: "hsl(var(--destructive-foreground))" }}
          >
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        ) : isImage ? (
          /* ── Full Image Preview ── */
          <div
            className="flex-1 flex flex-col items-center justify-center p-8 overflow-auto select-none"
            style={{
              background:
                "repeating-conic-gradient(hsl(var(--muted) / 0.3) 0% 25%, transparent 0% 50%) 50% / 20px 20px",
            }}
          >
            <div
              className="p-3 rounded-2xl border shadow-2xl transition-transform"
              style={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border) / 0.8)",
                transform: `scale(${imageZoom})`,
              }}
            >
              <img
                src={`${agentBase}/${activeFile.replace(/^\/+/, "")}`}
                alt={activeFile}
                className="max-h-[60vh] max-w-[80vw] object-contain rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `${agentBase}/read-files?files=${encodeURIComponent(
                    activeFile
                  )}`;
                }}
              />
            </div>
            <span
              className="text-[11px] font-mono mt-4 px-3 py-1 rounded-full border shadow-sm"
              style={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border) / 0.6)",
                color: "hsl(var(--muted-foreground))",
              }}
            >
              {activeFile}
            </span>
          </div>
        ) : (
          /* ── Code Editor / Viewer ── */
          <div className="flex-1 flex overflow-auto">
            {/* Line Numbers */}
            <div
              className="py-3 px-3 border-r text-right select-none font-mono shrink-0"
              style={{
                backgroundColor: "hsl(var(--card) / 0.5)",
                borderColor: "hsl(var(--border) / 0.4)",
                color: "hsl(var(--muted-foreground) / 0.6)",
              }}
            >
              {lines.map((_, i) => (
                <div key={i} className="leading-5 text-[11px]">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code Content View / Edit */}
            {isEditing ? (
              <textarea
                value={content}
                onChange={handleContentChange}
                spellCheck="false"
                className="flex-1 p-3 bg-transparent resize-none focus:outline-none font-mono text-xs leading-5 whitespace-pre tab-4"
                style={{
                  color: "hsl(var(--foreground))",
                  tabSize: 2,
                }}
              />
            ) : (
              <pre
                className="flex-1 p-3 overflow-x-auto font-mono text-xs leading-5 select-text"
                style={{
                  color: "hsl(var(--foreground))",
                  tabSize: 2,
                }}
              >
                {lines.map((line, i) => {
                  let lineStyle = {};
                  if (line.startsWith("+")) {
                    lineStyle = {
                      color: "hsl(var(--success-foreground))",
                      backgroundColor: "hsl(var(--success) / 0.15)",
                    };
                  } else if (line.startsWith("-")) {
                    lineStyle = {
                      color: "hsl(var(--destructive-foreground))",
                      backgroundColor: "hsl(var(--destructive) / 0.15)",
                    };
                  }
                  return (
                    <div
                      key={i}
                      style={lineStyle}
                      className="px-1 -mx-1 rounded-sm"
                    >
                      {line || " "}
                    </div>
                  );
                })}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
