import { useEffect } from 'react';
import { FileTree } from './FileTree';
import { CodeEditor } from './CodeEditor';
import { ResizeHandle } from '../common/ResizeHandle';
import { useResizable } from '../../hooks/useResizable';
import { useFiles } from '../../hooks/useFiles';
import { useSandbox } from '../../hooks/useSandbox';

export const EditorPanel = () => {
  const { isReady } = useSandbox();
  const { fileList, refreshFiles } = useFiles();

  const {
    width: treeWidth,
    isResizing: isTreeResizing,
    isCollapsed: isTreeCollapsed,
    toggleCollapse: toggleTreeCollapse,
    startResizing: startTreeResizing,
  } = useResizable({
    initialWidth: 240,
    minWidth: 160,
    maxWidth: 440,
    storageKey: 'sandbox_tree_width',
  });

  useEffect(() => {
    if (isReady && fileList.length === 0) {
      refreshFiles();
    }
  }, [isReady, fileList.length, refreshFiles]);

  return (
    <div className="flex h-full w-full overflow-hidden relative">
      <FileTree
        width={treeWidth}
        isCollapsed={isTreeCollapsed}
        onToggleCollapse={toggleTreeCollapse}
      />

      {!isTreeCollapsed && (
        <ResizeHandle onMouseDown={startTreeResizing} isResizing={isTreeResizing} />
      )}

      <CodeEditor
        isTreeCollapsed={isTreeCollapsed}
        onToggleTree={toggleTreeCollapse}
      />
    </div>
  );
};

export default EditorPanel;
