import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  ChevronRight,
  ChevronDown,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";

function getFileIcon(filename) {
  if (filename.endsWith(".jsx") || filename.endsWith(".tsx") || filename.endsWith(".js") || filename.endsWith(".ts")) {
    return <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
  }
  if (filename.endsWith(".css") || filename.endsWith(".scss")) {
    return <FileCode className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
  }
  if (filename.endsWith(".json")) {
    return <FileJson className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
  }
  if (filename.endsWith(".html")) {
    return <FileCode className="w-3.5 h-3.5 text-orange-400 shrink-0" />;
  }
  if (filename.endsWith(".svg") || filename.endsWith(".png") || filename.endsWith(".jpg")) {
    return <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
  }
  return <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
}

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
  const [newFileName, setNewFileName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [collapsedFolders, setCollapsedFolders] = useState({});

  const fetchFiles = useCallback(async () => {
    if (!agentBase) return;
    setLoading(true);
    try {
      const res = await fetch(`${agentBase}/list-files`);
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (err) {
      console.error("Failed to fetch files:", err);
    } finally {
      setLoading(false);
    }
  }, [agentBase]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles, refreshKey]);

  const handleCreateFile = async (e) => {
    e.preventDefault();
    const fname = newFileName.trim();
    if (!fname) return;

    try {
      const res = await fetch(`${agentBase}/update-files`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: [{ file: fname, content: "// " + fname }],
        }),
      });
      if (res.ok) {
        setNewFileName("");
        setIsCreating(false);
        fetchFiles();
        onSelectFile(fname);
        onFilesChanged?.();
      }
    } catch (err) {
      console.error("Failed to create file:", err);
    }
  };

  const handleDeleteFile = async (filePath, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete ${filePath}?`)) return;

    try {
      const res = await fetch(`${agentBase}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths: [filePath] }),
      });
      if (res.ok) {
        fetchFiles();
        if (activeFile === filePath) onSelectFile(null);
        onFilesChanged?.();
      }
    } catch (err) {
      console.error("Failed to delete file:", err);
    }
  };

  const buildTree = (fileList) => {
    const root = { files: [], dirs: {} };
    fileList.forEach((path) => {
      const parts = path.split("/").filter(Boolean);
      let curr = root;
      for (let i = 0; i < parts.length - 1; i++) {
        const d = parts[i];
        if (!curr.dirs[d]) curr.dirs[d] = { files: [], dirs: {} };
        curr = curr.dirs[d];
      }
      curr.files.push({ name: parts[parts.length - 1], fullPath: path });
    });
    return root;
  };

  const toggleFolder = (folderPath) => {
    setCollapsedFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  const renderTree = (node, currentPath = "") => {
    return (
      <div className="flex flex-col space-y-0.5">
        {Object.keys(node.dirs)
          .sort()
          .map((dirName) => {
            const folderPath = currentPath ? `${currentPath}/${dirName}` : dirName;
            const isCollapsed = collapsedFolders[folderPath];

            return (
              <div key={folderPath} className="flex flex-col">
                <button
                  onClick={() => toggleFolder(folderPath)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs text-slate-300 hover:bg-white/[0.04] hover:text-white transition-all text-left group"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-3 h-3 text-slate-500 shrink-0 group-hover:text-slate-300" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-slate-500 shrink-0 group-hover:text-slate-300" />
                  )}
                  {isCollapsed ? (
                    <Folder className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  ) : (
                    <FolderOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  )}
                  <span className="font-medium truncate text-[11px]">{dirName}</span>
                </button>

                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pl-3 ml-2 border-l border-white/[0.06] flex flex-col space-y-0.5 overflow-hidden"
                    >
                      {renderTree(node.dirs[dirName], folderPath)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

        {node.files
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((file) => {
            const isSelected = activeFile === file.fullPath;
            return (
              <motion.div
                key={file.fullPath}
                whileHover={{ x: 2 }}
                onClick={() => onSelectFile(file.fullPath)}
                className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "bg-cyan-500/15 text-cyan-300 font-medium border border-cyan-500/30 shadow-sm"
                    : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-1">
                  {getFileIcon(file.name)}
                  <span className="truncate text-[11px] font-mono">{file.name}</span>
                </div>

                <button
                  onClick={(e) => handleDeleteFile(file.fullPath, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 rounded transition-all"
                  title="Delete file"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </motion.div>
            );
          })}
      </div>
    );
  };

  const filteredFiles = files.filter((f) =>
    f.toLowerCase().includes(search.toLowerCase())
  );
  const fileTree = buildTree(filteredFiles);

  return (
    <div className="h-full w-64 bg-[#08090f] border-r border-white/[0.07] flex flex-col select-none shrink-0">
      {/* Explorer Header */}
      <div className="p-3.5 border-b border-white/[0.07] flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
          Explorer
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="New File"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={fetchFiles}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Refresh Files"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* New File Inline Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreateFile}
            className="p-2 border-b border-white/[0.07]"
          >
            <input
              type="text"
              placeholder="src/components/MyComp.jsx"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              autoFocus
              className="w-full px-2.5 py-1.5 rounded-xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </motion.form>
        )}
      </AnimatePresence>

      {/* Search Input */}
      <div className="p-2.5 border-b border-white/[0.05]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Filter files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl glass-input text-[11px] text-slate-300 placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto p-2.5">
        {loading && files.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-slate-500 gap-2 text-xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>Scanning directory...</span>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs font-mono">No files found</div>
        ) : (
          renderTree(fileTree)
        )}
      </div>
    </div>
  );
}
