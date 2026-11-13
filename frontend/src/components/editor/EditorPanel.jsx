import { useEffect } from 'react';
import { FileTree } from './FileTree';
import { CodeEditor } from './CodeEditor';
import { useFiles } from '../../hooks/useFiles';
import { useSandbox } from '../../hooks/useSandbox';

export const EditorPanel = () => {
  const { isReady } = useSandbox();
  const { fileList, refreshFiles } = useFiles();

  useEffect(() => {
    if (isReady && fileList.length === 0) {
      refreshFiles();
    }
  }, [isReady, fileList.length, refreshFiles]);

  return (
    <div className="flex h-full w-full overflow-hidden">
      <FileTree />
      <CodeEditor />
    </div>
  );
};

export default EditorPanel;
