import { useState, useMemo, useRef, useEffect } from 'react';
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
  Trash2,
  Upload,
  FolderPlus,
  FilePlus,
} from 'lucide-react';
import { IconButton } from '../common/IconButton';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useFiles } from '../../hooks/useFiles';

/**
 * Transforms a flat array of file paths into a nested tree structure.
 * Handles both files and empty folders (ending with /)
 */
function buildTree(fileList) {
  const root = { name: '', path: '', isFolder: true, children: {} };

  fileList.forEach((filePath) => {
    const isExplicitDir = filePath.endsWith('/');
    const cleanPath = filePath.replace(/\/+$/, '').replace(/^\/+/, '');
    if (!cleanPath) return;

    const parts = cleanPath.split('/');
    let current = root;

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      const currentPath = parts.slice(0, index + 1).join('/');

      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          path: currentPath,
          isFolder: isExplicitDir ? true : !isLast,
          children: {},
        };
      } else if (isExplicitDir && isLast) {
        current.children[part].isFolder = true;
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
  dragOverFolder,
  onToggleFolder,
  onSelectFile,
  onContextMenu,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
}) => {
  const isExpanded = !!expandedFolders[node.path];
  const isActive = activeFile === node.path;
  const hasUnsaved = isUnsaved[node.path];
  const isDragOver = dragOverFolder === node.path;
  const paddingLeft = `${depth * 14 + 10}px`;

  if (node.isFolder) {
    return (
      <div className="select-none">
        <button
          type="button"
          onClick={() => onToggleFolder(node.path)}
          onContextMenu={(e) => onContextMenu(e, node)}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDragOver(e, node);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDragLeave(e);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDrop(e, node);
          }}
          style={{ paddingLeft }}
          className={`w-full flex items-center gap-1.5 py-1.5 pr-2 text-xs text-left cursor-pointer transition-colors group ${
            isDragOver
              ? 'bg-[var(--accent-soft)] border-l-2 border-[var(--accent)] text-[var(--text)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]/60'
          }`}
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
            <Folder className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span className="truncate font-medium">{node.name}</span>
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
                dragOverFolder={dragOverFolder}
                onToggleFolder={onToggleFolder}
                onSelectFile={onSelectFile}
                onContextMenu={onContextMenu}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      draggable
      onDragStart={(e) => onDragStart(e, node)}
      onClick={() => onSelectFile(node.path)}
      onContextMenu={(e) => onContextMenu(e, node)}
      style={{ paddingLeft: `${depth * 14 + 24}px` }}
      className={`w-full flex items-center justify-between py-1.5 pr-2 text-xs text-left cursor-pointer transition-colors ${
        isActive
          ? 'bg-[var(--accent-soft)] text-[var(--text)] border-l-2 border-[var(--accent)] font-medium'
          : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]/60'
      }`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
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
    createFolder,
    deleteFileOrFolder,
    uploadFile,
    moveFile,
    isUnsaved,
  } = useFiles();

  const [filter, setFilter] = useState('');
  const [modalMode, setModalMode] = useState(null); // 'file' | 'folder' | 'delete'
  const [modalPath, setModalPath] = useState('');
  const [targetFolder, setTargetFolder] = useState('');
  const [nodeToDelete, setNodeToDelete] = useState(null);
  const [dragOverFolder, setDragOverFolder] = useState('');

  // Context Menu State
  const [contextMenu, setContextMenu] = useState(null); // { x, y, node }
  const fileInputRef = useRef(null);

  // Close context menu on outside click
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Track expanded folder paths
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
    return buildTree(fileList);
  }, [fileList]);

  const filteredTree = useMemo(() => {
    if (!filter.trim()) return tree;
    const lower = filter.toLowerCase();

    function filterNodes(nodes) {
      return nodes
        .map((node) => {
          if (node.isFolder) {
            const matchedChildren = filterNodes(node.childrenList || []);
            if (matchedChildren.length > 0 || node.name.toLowerCase().includes(lower)) {
              return { ...node, childrenList: matchedChildren };
            }
            return null;
          }
          return node.name.toLowerCase().includes(lower) ? node : null;
        })
        .filter(Boolean);
    }

    return filterNodes(tree);
  }, [tree, filter]);

  // Context menu handler
  const handleContextMenu = (e, node) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      node,
    });
  };

  // Drag and drop handlers
  const handleDragStart = (e, node) => {
    e.dataTransfer.setData('text/plain', node.path);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, node) => {
    e.preventDefault();
    e.stopPropagation();
    if (node.isFolder) {
      e.dataTransfer.dropEffect = 'move';
      setDragOverFolder(node.path);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolder('');
  };

  const handleDrop = async (e, targetNode) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolder('');
    const srcPath = e.dataTransfer.getData('text/plain');
    if (!srcPath || !targetNode.isFolder) return;

    const fileName = srcPath.split('/').pop();
    const destPath = targetNode.path ? `${targetNode.path.replace(/\/+$/, '')}/${fileName}` : fileName;

    if (srcPath === destPath) return;

    try {
      await moveFile(srcPath, destPath);
    } catch {
      // handled in store
    }
  };

  // Upload handler from local computer
  const triggerUpload = (folder = '') => {
    setTargetFolder(folder);
    fileInputRef.current?.click();
  };

  const handleFileInputChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = async () => {
        const base64Data = reader.result.split(',')[1];
        const destFolder = targetFolder ? targetFolder.replace(/\/+$/, '') : 'src/assets';
        const destPath = `${destFolder}/${file.name}`;

        try {
          await uploadFile({
            file: destPath,
            content: base64Data,
            encoding: 'base64',
          });
          selectFile(destPath, true);
        } catch {
          // error handled in store
        }
      };

      reader.readAsDataURL(file);
    }

    e.target.value = '';
  };

  // Modal submit handlers
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!modalPath.trim()) return;

    const fullPath = targetFolder
      ? `${targetFolder.replace(/\/+$/, '')}/${modalPath.trim()}`
      : modalPath.trim();

    if (modalMode === 'file') {
      await createNewFile(fullPath, '// New file\n');
    } else if (modalMode === 'folder') {
      await createFolder(fullPath);
    }

    setModalMode(null);
    setModalPath('');
    setTargetFolder('');
  };

  const handleDeleteConfirm = async () => {
    if (!nodeToDelete) return;
    try {
      await deleteFileOrFolder(nodeToDelete.path);
    } finally {
      setModalMode(null);
      setNodeToDelete(null);
    }
  };

  if (isCollapsed) return null;

  return (
    <div
      style={{ width: `${width}px` }}
      className="border-r border-[var(--line)] bg-[var(--surface)] flex flex-col h-full shrink-0 select-none overflow-hidden relative"
    >
      {/* Hidden file input for uploading images & files from computer */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

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
            label="Create file or folder"
            size="sm"
            onClick={() => {
              setTargetFolder('');
              setModalMode('file');
            }}
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

      {/* Quick Action Ribbon */}
      <div className="px-3 py-1.5 border-b border-[var(--line)] flex items-center gap-1 text-[11px] text-[var(--text-muted)] bg-[var(--surface-2)]/30">
        <button
          type="button"
          onClick={() => {
            setTargetFolder('');
            setModalMode('file');
          }}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[var(--surface-2)] hover:text-[var(--text)] cursor-pointer"
          title="New File"
        >
          <FilePlus className="w-3 h-3 text-cyan-400" />
          <span>+File</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setTargetFolder('');
            setModalMode('folder');
          }}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[var(--surface-2)] hover:text-[var(--text)] cursor-pointer"
          title="New Folder"
        >
          <FolderPlus className="w-3 h-3 text-amber-400" />
          <span>+Folder</span>
        </button>
        <button
          type="button"
          onClick={() => triggerUpload('src/assets')}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[var(--surface-2)] hover:text-[var(--text)] cursor-pointer ml-auto"
          title="Upload Images from computer"
        >
          <Upload className="w-3 h-3 text-emerald-400" />
          <span>Upload</span>
        </button>
      </div>

      {/* Tree Content Area */}
      <div
        className="flex-1 overflow-y-auto py-2 font-mono"
        onContextMenu={(e) => handleContextMenu(e, { isFolder: true, path: '' })}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }}
        onDrop={(e) => {
          e.preventDefault();
          handleDrop(e, { isFolder: true, path: '' });
        }}
      >
        {filteredTree.length === 0 ? (
          <div className="p-4 text-xs text-[var(--text-subtle)] text-center">
            {isLoadingList ? 'Loading tree...' : 'No files found'}
          </div>
        ) : (
          filteredTree.map((node) => (
            <TreeItem
              key={node.path}
              node={node}
              activeFile={activeFile}
              isUnsaved={isUnsaved}
              expandedFolders={expandedFolders}
              dragOverFolder={dragOverFolder}
              onToggleFolder={toggleFolder}
              onSelectFile={selectFile}
              onContextMenu={handleContextMenu}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />
          ))
        )}
      </div>

      {/* Right-Click Context Menu Popup */}
      {contextMenu && (
        <div
          style={{ top: `${Math.min(window.innerHeight - 200, contextMenu.y)}px`, left: `${Math.min(window.innerWidth - 200, contextMenu.x)}px` }}
          className="fixed z-50 min-w-[160px] bg-[var(--surface)] border border-[var(--line-strong)] rounded-[var(--r-card)] shadow-xl p-1 text-xs select-none backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.node.isFolder ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setTargetFolder(contextMenu.node.path);
                  setModalMode('file');
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[var(--surface-2)] text-[var(--text)] cursor-pointer text-left"
              >
                <FilePlus className="w-3.5 h-3.5 text-cyan-400" />
                <span>New File...</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTargetFolder(contextMenu.node.path);
                  setModalMode('folder');
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[var(--surface-2)] text-[var(--text)] cursor-pointer text-left"
              >
                <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                <span>New Folder...</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerUpload(contextMenu.node.path);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[var(--surface-2)] text-[var(--text)] cursor-pointer text-left"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Upload Images / Files...</span>
              </button>
              {contextMenu.node.path && (
                <>
                  <div className="h-[1px] bg-[var(--line)] my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setNodeToDelete(contextMenu.node);
                      setModalMode('delete');
                      setContextMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[var(--danger-soft)] text-[var(--danger)] cursor-pointer text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Folder</span>
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  selectFile(contextMenu.node.path);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[var(--surface-2)] text-[var(--text)] cursor-pointer text-left"
              >
                <FileCode className="w-3.5 h-3.5 text-sky-400" />
                <span>Open in Editor</span>
              </button>
              <div className="h-[1px] bg-[var(--line)] my-1" />
              <button
                type="button"
                onClick={() => {
                  setNodeToDelete(contextMenu.node);
                  setModalMode('delete');
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[var(--danger-soft)] text-[var(--danger)] cursor-pointer text-left"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete File</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Create File / Folder Modal */}
      <Modal
        isOpen={modalMode === 'file' || modalMode === 'folder'}
        onClose={() => setModalMode(null)}
        title={
          modalMode === 'file'
            ? targetFolder
              ? `New File in ${targetFolder}`
              : 'Create New File'
            : targetFolder
            ? `New Folder in ${targetFolder}`
            : 'Create New Folder'
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label={modalMode === 'file' ? 'File path / name' : 'Folder path / name'}
            value={modalPath}
            onChange={(e) => setModalPath(e.target.value)}
            placeholder={
              modalMode === 'file'
                ? 'e.g. components/Button.jsx'
                : 'e.g. assets/icons'
            }
            autoFocus
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModalMode(null)}>
              Cancel
            </Button>
            <Button variant="accent" type="submit" disabled={!modalPath.trim()}>
              {modalMode === 'file' ? 'Create File' : 'Create Folder'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={modalMode === 'delete'}
        onClose={() => setModalMode(null)}
        title={nodeToDelete?.isFolder ? 'Delete Folder?' : 'Delete File?'}
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">
            Are you sure you want to permanently delete{' '}
            <span className="font-mono text-[var(--text)] font-semibold">
              {nodeToDelete?.path}
            </span>
            {nodeToDelete?.isFolder && ' and all files inside it'}?
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModalMode(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FileTree;
