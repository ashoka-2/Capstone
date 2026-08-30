import { useState, useEffect, useCallback } from "react";
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  File,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  ChevronRight,
  ChevronDown,
  Loader2,
} from "lucide-react";

function getFileIcon(filename) {
  if (filename.endsWith(".jsx") || filename.endsWith(".tsx") || filename.endsWith(".js") || filename.endsWith(".ts")) {
    return <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />;
  }
  if (filename.endsWith(".css") || filename.endsWith(".scss")) {
    return <FileCode className="w-4 h-4 text-purple-400 shrink-0" />;
  }
  if (filename.endsWith(".json")) {
    return <FileJson className="w-4 h-4 text-amber-400 shrink-0" />;
  }
  if (filename.endsWith(".html")) {
    return <FileCode className="w-4 h-4 text-orange-400 shrink-0" />;
  }
  return <FileText className="w-4 h-4 text-gray-400 shrink-0" />;
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

  // Build tree from flat file list
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
        {/* Render Directories */}
        {Object.keys(node.dirs)
          .sort()
          .map((dirName) => {
            const folderPath = currentPath ? `${currentPath}/${dirName}` : dirName;
            const isCollapsed = collapsedFolders[folderPath];

            return (
              <div key={folderPath} className="flex flex-col">
                <button
                  onClick={() => toggleFolder(folderPath)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-gray-300 hover:bg-white/[0.05] hover:text-white transition-all text-left"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  )}
                  {isCollapsed ? (
                    <Folder className="w-4 h-4 text-indigo-400 shrink-0" />
                  ) : (
                    <FolderOpen className="w-4 h-4 text-indigo-400 shrink-0" />
                  )}
                  <span className="font-medium truncate">{dirName}</span>
                </button>

                {!isCollapsed && (
                  <div className="pl-3.5 ml-2 border-l border-white/5 flex flex-col space-y-0.5">
                    {renderTree(node.dirs[dirName], folderPath)}
                  </div>
                )}
              </div>
            );
          })}

        {/* Render Files */}
        {node.files
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((file) => {
            const isSelected = activeFile === file.fullPath;
            return (
              <div
                key={file.fullPath}
                onClick={() => onSelectFile(file.fullPath)}
                className={`group flex items-center justify-between px-2 py-1 rounded-md text-xs cursor-pointer transition-all ${
                  isSelected
                    ? "bg-cyan-500/20 text-cyan-300 font-medium border border-cyan-500/30"
                    : "text-gray-400 hover:bg-white/[0.04] hover:text-gray-200"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-1">
                  {getFileIcon(file.name)}
                  <span className="truncate">{file.name}</span>
                </div>

                <button
                  onClick={(e) => handleDeleteFile(file.fullPath, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                  title="Delete file"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
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
    <div className="h-full w-64 bg-[#0e1017] border-r border-white/10 flex flex-col select-none shrink-0">
      {/* Explorer Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
          Explorer
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="p-1 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="New File"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={fetchFiles}
            disabled={loading}
            className="p-1 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Refresh Files"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* New File Inline Form */}
      {isCreating && (
        <form onSubmit={handleCreateFile} className="p-2 border-b border-white/10">
          <input
            type="text"
            placeholder="src/components/MyComp.jsx"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            autoFocus
            className="w-full px-2 py-1 rounded bg-black/60 border border-cyan-500/50 text-xs text-white placeholder-gray-500 focus:outline-none"
          />
        </form>
      )}

      {/* Search Input */}
      <div className="p-2 border-b border-white/5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-gray-500" />
          <input
            type="text"
            placeholder="Filter files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-7 pr-2 py-1 rounded bg-white/[0.03] border border-white/5 text-[11px] text-gray-300 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading && files.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-gray-500 gap-2 text-xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading files...
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-xs">No files in project</div>
        ) : (
          renderTree(fileTree)
        )}
      </div>
    </div>
  );
}
