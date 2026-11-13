import { useEffect, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import {
  Save,
  FileCode,
  RefreshCw,
  Code2,
  Eye,
  Columns,
  Check,
} from 'lucide-react';
import { Button } from '../common/Button';
import { IconButton } from '../common/IconButton';
import { Badge } from '../common/Badge';
import { MediaViewer } from './MediaViewer';
import { useFiles } from '../../hooks/useFiles';
import { useSandbox } from '../../hooks/useSandbox';
import { useTheme } from '../../hooks/useTheme';
import { getFileCategory } from '../../utils/fileType';

export const CodeEditor = () => {
  const { sandboxId } = useSandbox();
  const {
    activeFile,
    fileContents,
    isUnsaved,
    isLoadingContent,
    isSaving,
    loadFileContent,
    reloadActiveFile,
    modifyFileLocal,
    saveActiveFile,
  } = useFiles();

  const { theme } = useTheme();
  const [svgViewMode, setSvgViewMode] = useState('split'); // 'split' | 'code' | 'vector'
  const [justSaved, setJustSaved] = useState(false);

  const fileInfo = getFileCategory(activeFile);
  const isSvg = fileInfo.isSvg;
  const isPureMedia = fileInfo.isMedia && !isSvg;

  useEffect(() => {
    if (activeFile && fileContents[activeFile] === undefined && !isPureMedia) {
      loadFileContent(activeFile);
    }
  }, [activeFile, fileContents, loadFileContent, isPureMedia]);

  const handleSave = useCallback(async () => {
    if (!activeFile || !isUnsaved[activeFile]) return;
    try {
      await saveActiveFile();
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch {
      // handled in store
    }
  }, [activeFile, isUnsaved, saveActiveFile]);

  // Handle Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  const currentContent = activeFile ? fileContents[activeFile] ?? '' : '';
  const hasUnsavedChanges = activeFile && isUnsaved[activeFile];

  // If pure media file (png, jpg, webp, mp4, mp3, etc.)
  if (isPureMedia && activeFile) {
    return <MediaViewer key={activeFile} filePath={activeFile} sandboxId={sandboxId} />;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--surface-2)] overflow-hidden">
      {/* Editor Top Bar */}
      <div className="h-12 px-4 border-b border-[var(--line)] bg-[var(--surface)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-xs font-mono">
          <FileCode className="w-4 h-4 text-[var(--accent-text)]" />
          <span className="text-[var(--text)] font-medium truncate max-w-[200px] sm:max-w-xs">
            {activeFile || 'No file selected'}
          </span>
          {hasUnsavedChanges ? (
            <Badge variant="warning" dot>
              Unsaved
            </Badge>
          ) : justSaved ? (
            <Badge variant="success" dot>
              Saved
            </Badge>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {/* SVG View Mode Switcher */}
          {isSvg && (
            <div className="flex items-center bg-[var(--surface-2)] border border-[var(--line)] rounded-[var(--r-btn)] p-0.5 mr-2">
              <button
                type="button"
                title="Split: Code + Vector Preview"
                onClick={() => setSvgViewMode('split')}
                className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded-[var(--r-btn)] cursor-pointer transition-colors ${
                  svgViewMode === 'split'
                    ? 'bg-[var(--surface)] text-[var(--text)] font-medium shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                <Columns className="w-3 h-3" />
                <span className="hidden sm:inline">Split</span>
              </button>
              <button
                type="button"
                title="Code View"
                onClick={() => setSvgViewMode('code')}
                className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded-[var(--r-btn)] cursor-pointer transition-colors ${
                  svgViewMode === 'code'
                    ? 'bg-[var(--surface)] text-[var(--text)] font-medium shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                <Code2 className="w-3 h-3" />
                <span className="hidden sm:inline">Code</span>
              </button>
              <button
                type="button"
                title="Vector Image Preview"
                onClick={() => setSvgViewMode('vector')}
                className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded-[var(--r-btn)] cursor-pointer transition-colors ${
                  svgViewMode === 'vector'
                    ? 'bg-[var(--surface)] text-[var(--text)] font-medium shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span className="hidden sm:inline">Vector</span>
              </button>
            </div>
          )}

          <IconButton
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoadingContent ? 'animate-spin' : ''}`} />}
            label="Reload file content from container"
            size="sm"
            onClick={reloadActiveFile}
            disabled={!activeFile || isLoadingContent}
          />

          <Button
            variant={hasUnsavedChanges ? 'accent' : 'secondary'}
            size="sm"
            icon={justSaved ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Save className="w-3.5 h-3.5" />}
            loading={isSaving}
            disabled={!hasUnsavedChanges || isSaving}
            onClick={handleSave}
          >
            {isSaving ? 'Saving...' : justSaved ? 'Saved!' : 'Save File (Ctrl+S)'}
          </Button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 relative overflow-hidden flex">
        {isLoadingContent ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface)] z-10">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
              <span>Fetching latest {activeFile}...</span>
            </div>
          </div>
        ) : !activeFile ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-[var(--text-subtle)]">
            Select a file from the explorer to view or edit code
          </div>
        ) : isSvg && svgViewMode === 'vector' ? (
          /* Pure Vector View for SVG */
          <div className="flex-1 h-full overflow-hidden">
            <MediaViewer filePath={activeFile} sandboxId={sandboxId} svgContent={currentContent} />
          </div>
        ) : isSvg && svgViewMode === 'split' ? (
          /* Split View for SVG: Monaco Editor on Left, Vector Graphic on Right */
          <div className="flex-1 flex h-full overflow-hidden">
            <div className="w-1/2 h-full border-r border-[var(--line)] overflow-hidden">
              <Editor
                height="100%"
                language="xml"
                value={currentContent}
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                onChange={(value) => modifyFileLocal(activeFile, value ?? '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  folding: true,
                  tabSize: 2,
                  automaticLayout: true,
                }}
              />
            </div>
            <div className="w-1/2 h-full overflow-hidden">
              <MediaViewer filePath={activeFile} sandboxId={sandboxId} svgContent={currentContent} />
            </div>
          </div>
        ) : (
          /* Standard Monaco Editor */
          <div className="flex-1 h-full overflow-hidden">
            <Editor
              height="100%"
              language={fileInfo.language || 'javascript'}
              value={currentContent}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              onChange={(value) => modifyFileLocal(activeFile, value ?? '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on',
                folding: true,
                tabSize: 2,
                automaticLayout: true,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
