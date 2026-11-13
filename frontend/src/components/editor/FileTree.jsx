import { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  ChevronsUpDown,
  FileCode,
  FileText,
  FileJson,
  FileSpreadsheet,
  Image,
  Film,
  Volume2,
  File,
  Plus,
  RefreshCw,
  Search,
  PanelLeftClose,
} from 'lucide-react';
import { IconButton } from '../common/IconButton';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useFiles } from '../../hooks/useFiles';

/**
 * Transforms a flat array of file paths into a nested tree structure.
 * e.g. ["src/App.jsx", "src/assets/hero.png", "index.html"] -> Tree
 */
function buildTree(fileList) {
  const root = { name: '', path: '', isFolder: true, children: {} };

  fileList.forEach((filePath) => {
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const parts = cleanPath.split('/');
    let current = root;

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      const currentPath = parts.slice(0, index + 1).join('/');

      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          path: currentPath,
          isFolder: !isLast,
          children: {},
        };
      }
      current = current.children[part];
    });
  });

  function toSortedArray(node) {
    const items = Object.values(node.children).map((child) => {
      if (child.isFolder) {
        return {
          ...child,
          childrenList: toSortedArray(child),
        };
      }
      return child;
    });

    // Sort: Folders first alphabetically, then files alphabetically
    return items.sort((a, b) => {
      if (a.isFolder === b.isFolder) {
        return a.name.localeCompare(b.name);
      }
      return a.isFolder ? -1 : 1;
    });
  }

  return toSortedArray(root);
}

// Helper to pick file icon by extension
function getFileIcon(fileName) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.jsx') || lower.endsWith('.tsx')) {
    return <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />;
  }
  if (lower.endsWith('.js') || lower.endsWith('.ts')) {
    return <FileCode className="w-4 h-4 text-amber-300 shrink-0" />;
  }
  if (lower.endsWith('.css') || lower.endsWith('.scss')) {
    return <FileSpreadsheet className="w-4 h-4 text-teal-400 shrink-0" />;
  }
  if (lower.endsWith('.json')) {
    return <FileJson className="w-4 h-4 text-yellow-400 shrink-0" />;
  }
  if (lower.endsWith('.svg')) {
    return <Image className="w-4 h-4 text-purple-400 shrink-0" />;
  }
  if (
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.webp') ||
    lower.endsWith('.gif') ||
    lower.endsWith('.ico')
  ) {
    return <Image className="w-4 h-4 text-pink-400 shrink-0" />;
  }
  if (lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov')) {
    return <Film className="w-4 h-4 text-purple-400 shrink-0" />;
  }
  if (lower.endsWith('.mp3') || lower.endsWith('.wav') || lower.endsWith('.ogg')) {
    return <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />;
  }
  if (lower.endsWith('.md')) {
    return <FileText className="w-4 h-4 text-blue-400 shrink-0" />;
  }
  return <File className="w-4 h-4 text-[var(--text-subtle)] shrink-0" />;
}

// Tree Item Recursive Component
const TreeItem = ({
  node,
  depth = 0,
  activeFile,
  isUnsaved,
  expandedFolders,
  onToggleFolder,
  onSelectFile,
}) => {
  const isExpanded = !!expandedFolders[node.path];
  const isActive = activeFile === node.path;
  const hasUnsaved = isUnsaved[node.path];
  const paddingLeft = `${depth * 14 + 10}px`;

  if (node.isFolder) {
    return (
      <div className="select-none">
        <button
          type="button"
          onClick={() => onToggleFolder(node.path)}
          style={{ paddingLeft }}
          className="w-full flex items-center gap-1.5 py-1.5 pr-2 text-xs text-left text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]/60 cursor-pointer transition-colors group"
        >
          <span className="text-[var(--text-subtle)] group-hover:text-[var(--text)]">
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </span>
          {isExpanded ? (
            <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-amber-400/80 shrink-0" />
          )}
          <span className="font-medium text-[var(--text)] truncate">{node.name}</span>
        </button>

        {isExpanded && node.childrenList && (
          <div>
            {node.childrenList.map((child) => (
              <TreeItem
                key={child.path}
                node={child}
                depth={depth + 1}
                activeFile={activeFile}
                isUnsaved={isUnsaved}
                expandedFolders={expandedFolders}
                onToggleFolder={onToggleFolder}
                onSelectFile={onSelectFile}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // File Item
  return (
    <button
      type="button"
      onClick={() => onSelectFile(node.path, true)}
      style={{ paddingLeft: `${depth * 14 + 24}px` }}
      className={`w-full flex items-center justify-between py-1.5 pr-2 text-xs text-left cursor-pointer transition-colors ${
        isActive
          ? 'bg-[var(--accent-soft)] text-[var(--accent-text)] font-medium border-l-2 border-[var(--accent)]'
          : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]/50'
      }`}
    >
      <div className="flex items-center gap-2 truncate">
        {getFileIcon(node.name)}
        <span className="truncate">{node.name}</span>
      </div>

      {hasUnsaved && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-[var(--warning)] shrink-0 ml-1"
          title="Unsaved changes"
        />
      )}
    </button>
  );
};

export const FileTree = ({ width = 240, isCollapsed = false, onToggleCollapse }) => {
  const {
    fileList,
    activeFile,
    isLoadingList,
    refreshFiles,
    selectFile,
    createNewFile,
    isUnsaved,
  } = useFiles();

  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFilePath, setNewFilePath] = useState('');

  // Track expanded folder paths; default expand top-level folders
  const [expandedFolders, setExpandedFolders] = useState({
    src: true,
    'src/assets': true,
    public: true,
  });

  const toggleFolder = (path) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const handleToggleExpandAll = () => {
    const isAnyExpanded = Object.values(expandedFolders).some(Boolean);
    if (isAnyExpanded) {
      setExpandedFolders({});
    } else {
      const all = {};
      fileList.forEach((f) => {
        const parts = f.split('/');
        let curr = '';
        for (let i = 0; i < parts.length - 1; i++) {
          curr = curr ? `${curr}/${parts[i]}` : parts[i];
          all[curr] = true;
        }
      });
      setExpandedFolders(all);
    }
  };

  const tree = useMemo(() => {
    const list = filter
      ? fileList.filter((f) => f.toLowerCase().includes(filter.toLowerCase()))
      : fileList;
    return buildTree(list);
  }, [fileList, filter]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newFilePath.trim()) return;
    await createNewFile(newFilePath.trim(), '// New file created\n');
    setNewFilePath('');
    setIsModalOpen(false);
  };

  if (isCollapsed) return null;

  return (
    <div
      style={{ width: `${width}px` }}
      className="border-r border-[var(--line)] bg-[var(--surface)] flex flex-col h-full shrink-0 select-none overflow-hidden"
    >
      {/* File Tree Header */}
      <div className="h-12 px-3 border-b border-[var(--line)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Explorer
          </span>
          <span className="text-[10px] text-[var(--text-subtle)] font-mono">
            ({fileList.length})
          </span>
        </div>

        <div className="flex items-center gap-1">
          <IconButton
            icon={<ChevronsUpDown className="w-3.5 h-3.5" />}
            label="Toggle expand/collapse all"
            size="sm"
            onClick={handleToggleExpandAll}
          />
          <IconButton
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoadingList ? 'animate-spin' : ''}`} />}
            label="Refresh files"
            size="sm"
            onClick={() => refreshFiles(true)}
          />
          <IconButton
            icon={<Plus className="w-3.5 h-3.5" />}
            label="Create file"
            size="sm"
            onClick={() => setIsModalOpen(true)}
          />
          {onToggleCollapse && (
            <IconButton
              icon={<PanelLeftClose className="w-3.5 h-3.5" />}
              label="Collapse Explorer"
              size="sm"
              onClick={onToggleCollapse}
            />
          )}
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="px-2.5 py-2 border-b border-[var(--line)] shrink-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[var(--text-subtle)] pointer-events-none" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search files..."
            className="w-full h-8 pl-8 pr-2 text-xs bg-[var(--surface-2)] border border-[var(--line)] rounded-lg outline-none text-[var(--text)] placeholder:text-[var(--text-subtle)] focus:border-[var(--accent)] transition-colors"
          />
        </div>
      </div>

      {/* Tree View Scroll Area */}
      <div className="flex-1 overflow-y-auto py-2">
        {fileList.length === 0 ? (
          <div className="p-4 text-center text-xs text-[var(--text-subtle)] space-y-2">
            <div>{isLoadingList ? 'Listing files in container...' : 'No files found.'}</div>
            <Button variant="secondary" size="sm" onClick={refreshFiles}>
              Load Files
            </Button>
          </div>
        ) : tree.length === 0 ? (
          <div className="p-4 text-center text-xs text-[var(--text-subtle)]">
            No files match "{filter}"
          </div>
        ) : (
          tree.map((node) => (
            <TreeItem
              key={node.path}
              node={node}
              depth={0}
              activeFile={activeFile}
              isUnsaved={isUnsaved}
              expandedFolders={expandedFolders}
              onToggleFolder={toggleFolder}
              onSelectFile={selectFile}
            />
          ))
        )}
      </div>

      {/* Create File Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New File"
        subtitle="Provide relative path (e.g. src/components/Navbar.jsx)"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            value={newFilePath}
            onChange={(e) => setNewFilePath(e.target.value)}
            placeholder="src/components/Navbar.jsx"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="accent"
              type="submit"
              disabled={!newFilePath.trim()}
            >
              Create File
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FileTree;
