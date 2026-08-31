import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  FolderPlus,
  Trash2,
  RefreshCw,
  Search,
  ChevronRight,
  ChevronDown,
  Loader2,
  X,
  FileCode2,
} from "lucide-react";
import { getFileIcon } from "../../../utils/fileIcons.jsx";

export default function FileExplorer({
  agentBase,
  activeFile,
  onSelectFile,
  refreshKey,
  onFilesChanged,
}) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState("file"); // 'file' | 'folder'
  const [newPath, setNewPath] = useState("");
  const [newContent, setNewContent] = useState("");
  const [creating, setCreating] = useState(false);
  const [collapsedFolders, setCollapsedFolders] = useState({});

  const fetchFiles = useCallback(
    async (retryCount = 0) => {
      if (!agentBase) return;
      setLoading(true);
      try {
        const res = await fetch(`${agentBase}/list-files`);
        if (res.ok) {
          const data = await res.json();
          setFiles(data.files || []);
        } else if (retryCount < 5) {
          setTimeout(() => fetchFiles(retryCount + 1), 2000);
        }
      } catch (err) {
        if (retryCount < 5) {
          setTimeout(() => fetchFiles(retryCount + 1), 2000);
        } else {
          console.warn(
            "Pod agent initializing, will retry on action:",
            err.message
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [agentBase]
  );

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles, refreshKey]);

  // Create new file or folder
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const path = newPath.trim().replace(/^\/+/, "");
    if (!path || creating || !agentBase) return;

    setCreating(true);
    try {
      if (createType === "folder") {
        const res = await fetch(`${agentBase}/create-folder`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder: path }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        const res = await fetch(`${agentBase}/create-files`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            files: [{ file: path, content: newContent }],
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        onSelectFile?.(path);
      }

      setShowCreateModal(false);
      setNewPath("");
      setNewContent("");
      fetchFiles();
      onFilesChanged?.();
    } catch (err) {
      alert(`Create error: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  // Delete file or folder
  const handleDelete = async (e, filePath) => {
    e.stopPropagation();
    const cleanPath = filePath.replace(/^\/+/, "");
    if (
      !window.confirm(`Are you sure you want to delete "${cleanPath}"?`) ||
      !agentBase
    ) {
      return;
    }

    try {
      const res = await fetch(`${agentBase}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths: [cleanPath] }),
      });
      if (res.ok) {
        if (activeFile === cleanPath) onSelectFile?.(null);
        fetchFiles();
        onFilesChanged?.();
      } else {
        alert("Failed to delete file");
      }
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const toggleFolder = (folderPath) => {
    setCollapsedFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  // Build tree structure
  const fileTree = useMemo(() => {
    const root = {};
    const filtered = files.filter((f) =>
      f.toLowerCase().includes(search.toLowerCase())
    );

    filtered.forEach((filePath) => {
      const parts = filePath.split("/").filter(Boolean);
      let current = root;
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          current[part] = { __isFile: true, path: filePath };
        } else {
          if (!current[part]) {
            current[part] = { __isFile: false, __path: parts.slice(0, index + 1).join("/") };
          }
          current = current[part];
        }
      });
    });
    return root;
  }, [files, search]);

  const renderTree = (node, depth = 0, currentPath = "") => {
    return Object.keys(node)
      .filter((key) => !key.startsWith("__"))
      .sort((a, b) => {
        const aIsFile = !!node[a].__isFile;
        const bIsFile = !!node[b].__isFile;
        if (aIsFile === bIsFile) return a.localeCompare(b);
        return aIsFile ? 1 : -1;
      })
      .map((key) => {
        const item = node[key];
        const isFile = !!item.__isFile;
        const itemPath = isFile ? item.path : item.__path || `${currentPath}/${key}`;
        const isCollapsed = !!collapsedFolders[itemPath];
        const isSelected = activeFile === itemPath;

        if (!isFile) {
          return (
            <div key={itemPath} className="flex flex-col">
              <div
                onClick={() => toggleFolder(itemPath)}
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
                className="group flex items-center justify-between py-1.5 pr-2 rounded-lg cursor-pointer transition-colors hover:opacity-85 select-none"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {isCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  )}
                  {getFileIcon(key, true, !isCollapsed)}
                  <span
                    className="text-xs truncate font-medium"
                    style={{ color: "hsl(var(--foreground))" }}
                  >
                    {key}
                  </span>
                </div>
                <button
                  onClick={(e) => handleDelete(e, itemPath)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity hover:text-red-400"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                  title="Delete Folder"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {!isCollapsed && (
                <div className="flex flex-col">
                  {renderTree(item, depth + 1, itemPath)}
                </div>
              )}
            </div>
          );
        }

        return (
          <div
            key={itemPath}
            onClick={() => onSelectFile?.(itemPath)}
            style={{
              paddingLeft: `${depth * 12 + 20}px`,
              backgroundColor: isSelected
                ? "hsl(var(--muted))"
                : "transparent",
            }}
            className={`group flex items-center justify-between py-1.5 pr-2 rounded-lg cursor-pointer transition-all select-none ${
              isSelected ? "font-semibold" : "hover:bg-[hsl(var(--muted)/0.4)]"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {getFileIcon(key)}
              <span
                className="text-xs truncate font-mono"
                style={{
                  color: isSelected
                    ? "hsl(var(--foreground))"
                    : "hsl(var(--muted-foreground))",
                }}
              >
                {key}
              </span>
            </div>
            <button
              onClick={(e) => handleDelete(e, itemPath)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity hover:text-red-400"
              style={{ color: "hsl(var(--muted-foreground))" }}
              title="Delete File"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        );
      });
  };

  return (
    <div
      className="w-64 border-r flex flex-col h-full shrink-0 select-none overflow-hidden"
      style={{
        backgroundColor: "hsl(var(--card))",
        borderColor: "hsl(var(--border) / 0.6)",
      }}
    >
      {/* Explorer Header */}
      <div
        className="p-3 border-b flex items-center justify-between shrink-0"
        style={{ borderColor: "hsl(var(--border) / 0.5)" }}
      >
        <span
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: "hsl(var(--foreground))" }}
        >
          Workspace Explorer
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setCreateType("file");
              setShowCreateModal(true);
            }}
            className="p-1 rounded-lg transition-colors hover:opacity-80"
            style={{ color: "hsl(var(--muted-foreground))" }}
            title="New File"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setCreateType("folder");
              setShowCreateModal(true);
            }}
            className="p-1 rounded-lg transition-colors hover:opacity-80"
            style={{ color: "hsl(var(--muted-foreground))" }}
            title="New Folder"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => fetchFiles()}
            className="p-1 rounded-lg transition-colors hover:opacity-80"
            style={{ color: "hsl(var(--muted-foreground))" }}
            title="Refresh Files"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-2 border-b" style={{ borderColor: "hsl(var(--border) / 0.4)" }}>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs"
          style={{
            backgroundColor: "hsl(var(--muted) / 0.3)",
            borderColor: "hsl(var(--border) / 0.5)",
          }}
        >
          <Search
            className="w-3 h-3"
            style={{ color: "hsl(var(--muted-foreground))" }}
          />
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs focus:outline-none w-full font-mono"
            style={{ color: "hsl(var(--foreground))" }}
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X
                className="w-3 h-3"
                style={{ color: "hsl(var(--muted-foreground))" }}
              />
            </button>
          )}
        </div>
      </div>

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {loading && files.length === 0 ? (
          <div
            className="py-12 flex flex-col items-center justify-center gap-2 text-xs"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            <Loader2
              className="w-4 h-4 animate-spin"
              style={{ color: "hsl(var(--brand-tiger-primary))" }}
            />
            <span>Loading workspace files...</span>
          </div>
        ) : files.length === 0 ? (
          <div
            className="py-12 text-center text-xs"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            No files found.
          </div>
        ) : (
          renderTree(fileTree)
        )}
      </div>

      {/* Create File / Folder Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-5 rounded-2xl border shadow-2xl flex flex-col gap-4"
              style={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
              }}
            >
              <div className="flex items-center justify-between border-b pb-3">
                <span
                  className="font-bold text-sm"
                  style={{ color: "hsl(var(--foreground))" }}
                >
                  Create New {createType === "folder" ? "Folder" : "File"}
                </span>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label
                    className="text-xs font-semibold"
                    style={{ color: "hsl(var(--foreground))" }}
                  >
                    Path (e.g. src/components/Button.jsx)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      createType === "folder"
                        ? "src/components"
                        : "src/components/MyComponent.jsx"
                    }
                    value={newPath}
                    onChange={(e) => setNewPath(e.target.value)}
                    className="p-2.5 rounded-xl border text-xs font-mono focus:outline-none"
                    style={{
                      backgroundColor: "hsl(var(--muted) / 0.4)",
                      borderColor: "hsl(var(--border))",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                </div>

                {createType === "file" && (
                  <div className="flex flex-col gap-1">
                    <label
                      className="text-xs font-semibold"
                      style={{ color: "hsl(var(--foreground))" }}
                    >
                      Initial Content (Optional)
                    </label>
                    <textarea
                      rows={5}
                      placeholder="// Write code here..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="p-2.5 rounded-xl border text-xs font-mono resize-none focus:outline-none"
                      style={{
                        backgroundColor: "hsl(var(--muted) / 0.4)",
                        borderColor: "hsl(var(--border))",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newPath.trim()}
                    className="px-4 py-2 rounded-xl text-white font-semibold text-xs shadow-md transition-all disabled:opacity-40"
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(var(--brand-tiger-primary)), hsl(var(--brand-flamingo-primary)))",
                    }}
                  >
                    {creating ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
