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
  Download,
  ExternalLink,
  Grid,
  FileImage,
  Code,
  RefreshCw,
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

  // Revoke object URL on unmount or file switch
  const cleanupObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  // Main loader for both text files and images
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
      // 1. Fetch file content from /read-files (which returns base64 data URLs for binary images)
      const res = await fetch(
        `${agentBase}/read-files?files=${encodeURIComponent(cleanPath)}`
      );

      let retrieved = null;

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.files) && data.files.length > 0) {
          // If 1 file was requested, pick its value directly
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

      // Check if retrieved is an error string
      const isErrorString = typeof retrieved === "string" && retrieved.startsWith("Error reading file");

      if (isImage) {
        if (!isErrorString && retrieved) {
          if (isSvg) {
            // For SVG: store raw text for editor and create blob/data url for visual preview
            setContent(retrieved);
            setInitialContent(retrieved);
            const blob = new Blob([retrieved], { type: "image/svg+xml" });
            const objUrl = URL.createObjectURL(blob);
            objectUrlRef.current = objUrl;
            setImageSrc(objUrl);
          } else if (retrieved.startsWith("data:image/")) {
            // Self-contained base64 data URL
            setImageSrc(retrieved);
          } else {
            // Fallback blob fetch
            await tryBlobFetch();
          }
        } else {
          // Fallback direct blob fetch
          await tryBlobFetch();
        }
      } else {
        if (isErrorString) {
          throw new Error(retrieved);
        }
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

  // Secondary Fallback: Fetch raw bytes and convert to Blob Object URL
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
          // continue to next candidate
        }
      }

      // If all fallbacks failed, set direct link
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

  // Live Auto-save debounced while editing
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

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
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

  const handleDownload = () => {
    if (!imageSrc) return;
    const a = document.createElement("a");
    a.href = imageSrc;
    a.download = activeFile.split("/").pop() || "image";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
          Select any file or image from the explorer to view or edit
        </span>
      </div>
    );
  }

  const lines = content.split("\n");
  const ext = activeFile.split(".").pop()?.toUpperCase() || "IMG";

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
            className="text-xs font-mono truncate max-w-[180px] sm:max-w-xs"
            style={{ color: "hsl(var(--foreground))" }}
          >
            {activeFile}
          </span>

          {/* Format Badge */}
          {isImage && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
              {ext}
            </span>
          )}

          {/* Image Dimensions tag */}
          {isImage && imageDimensions && (
            <span className="hidden sm:inline text-[10px] font-mono text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
              {imageDimensions.width} × {imageDimensions.height} px
            </span>
          )}

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

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Refresh file */}
          <button
            onClick={loadActiveFile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            title="Reload File"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* SVG Mode Toggle (Preview vs Code) */}
          {isSvg && (
            <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-lg p-0.5 mr-1">
              <button
                onClick={() => setSvgViewMode("preview")}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all flex items-center gap-1 ${
                  svgViewMode === "preview"
                    ? "bg-purple-500/20 text-purple-300 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
              <button
                onClick={() => setSvgViewMode("code")}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all flex items-center gap-1 ${
                  svgViewMode === "code"
                    ? "bg-purple-500/20 text-purple-300 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Code className="w-3.5 h-3.5" /> Code
              </button>
            </div>
          )}

          {/* Standard Text File Controls */}
          {(!isImage || (isSvg && svgViewMode === "code")) && (
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

          {/* Image Toolbar Controls */}
          {isImage && svgViewMode === "preview" && (
            <div className="flex items-center gap-1">
              {/* Checkered Background Toggle */}
              <button
                onClick={() => setShowCheckerboard(!showCheckerboard)}
                className={`p-1.5 rounded-lg transition-colors ${
                  showCheckerboard
                    ? "bg-purple-500/15 text-purple-400 border border-purple-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
                title={showCheckerboard ? "Solid Background" : "Checkerboard Background"}
              >
                <Grid className="w-3.5 h-3.5" />
              </button>

              {/* Zoom Out */}
              <button
                onClick={() => setImageZoom((z) => Math.max(0.25, Number((z - 0.25).toFixed(2))))}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              {/* Zoom Label / Reset */}
              <button
                onClick={() => setImageZoom(1)}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-300 hover:text-white"
                title="Reset Zoom (100%)"
              >
                {Math.round(imageZoom * 100)}%
              </button>

              {/* Zoom In */}
              <button
                onClick={() => setImageZoom((z) => Math.min(4, Number((z + 0.25).toFixed(2))))}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              {/* Download */}
              <button
                onClick={handleDownload}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Download Image"
              >
                <Download className="w-3.5 h-3.5" />
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
            <span>Loading content...</span>
          </div>
        ) : error ? (
          <div
            className="p-4 flex items-center gap-2 text-xs"
            style={{ color: "hsl(var(--destructive-foreground))" }}
          >
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        ) : isImage && svgViewMode === "preview" ? (
          /* ── Enhanced Full Image Preview ── */
          <div
            className="flex-1 flex flex-col items-center justify-center p-6 overflow-auto select-none relative"
            style={{
              background: showCheckerboard
                ? "repeating-conic-gradient(rgba(255,255,255,0.03) 0% 25%, transparent 0% 50%) 50% / 24px 24px #080a11"
                : "#050609",
            }}
          >
            {imageLoading && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-[#080a11]/80 backdrop-blur-sm z-10 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                <span className="text-xs">Rendering image...</span>
              </div>
            )}

            {imageError || !imageSrc ? (
              <div className="flex flex-col items-center justify-center p-8 text-center max-w-sm">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-3">
                  <FileImage className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">Image Preview Unavailable</h4>
                <p className="text-xs text-slate-400 mb-4">
                  Unable to load <span className="font-mono text-purple-300">{activeFile}</span> from the sandbox.
                </p>
                <button
                  onClick={loadActiveFile}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.1] transition-all flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retry Loading
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center max-w-full max-h-full">
                <motion.div
                  layout
                  className="p-3 rounded-2xl border shadow-2xl transition-all duration-150 flex items-center justify-center overflow-hidden"
                  style={{
                    backgroundColor: "rgba(11, 14, 23, 0.7)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    transform: `scale(${imageZoom})`,
                    transformOrigin: "center center",
                  }}
                >
                  <img
                    src={imageSrc}
                    alt={activeFile}
                    onLoad={(e) => {
                      setImageLoading(false);
                      setImageError(false);
                      setImageDimensions({
                        width: e.target.naturalWidth,
                        height: e.target.naturalHeight,
                      });
                    }}
                    onError={() => {
                      setImageLoading(false);
                      setImageError(true);
                    }}
                    className="max-h-[65vh] max-w-[80vw] object-contain rounded-lg select-none pointer-events-auto"
                  />
                </motion.div>

                {/* File info pill */}
                <div className="mt-4 flex items-center gap-2 text-[11px] font-mono px-3 py-1 rounded-full border border-white/[0.08] bg-[#0b0e17]/80 text-slate-400 shadow-sm">
                  <span className="text-white">{activeFile}</span>
                  {imageDimensions && (
                    <span className="text-purple-400 font-semibold">
                      • {imageDimensions.width}×{imageDimensions.height}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── Code Editor / Text Viewer ── */
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
