import { useRef, useEffect, useCallback } from 'react';
import { Trash2, Sparkles, Loader2, PanelLeftClose } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatComposer } from './ChatComposer';
import { AgentTrajectory } from './AgentTrajectory';
import { IconButton } from '../common/IconButton';
import { useAIChat } from '../../hooks/useAIChat';
import { useSandbox } from '../../hooks/useSandbox';
import { useFiles } from '../../hooks/useFiles';

export const ChatPanel = ({ onGenerationComplete, onToggleCollapse }) => {
  const { isReady, setActiveTab } = useSandbox();
  const { selectFile, fileList } = useFiles();
  const {
    messages,
    isStreaming,
    currentStreamText,
    streamLogs,
    sendMessage,
    stopGeneration,
    clearChatHistory,
  } = useAIChat({ onGenerationComplete });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamText, streamLogs]);

  const handleFileClick = useCallback(
    (clickedPath) => {
      if (!clickedPath) return;

      // Find best match in fileList
      const normalizedClicked = clickedPath.startsWith('/') ? clickedPath.slice(1) : clickedPath;
      const matched =
        fileList.find((f) => f === normalizedClicked || f.endsWith(`/${normalizedClicked}`)) ||
        normalizedClicked;

      selectFile(matched, true);
      setActiveTab('code');
    },
    [fileList, selectFile, setActiveTab]
  );

  return (
    <div className="flex flex-col h-full bg-[var(--surface)] border-r border-[var(--line)]">
      {/* Chat Header */}
      <div className="h-12 px-4 border-b border-[var(--line)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)] flex items-center justify-center">
            <Sparkles className="w-3 h-3" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            AI Assistant
          </span>
        </div>

        <div className="flex items-center gap-1">
          <IconButton
            icon={<Trash2 className="w-3.5 h-3.5" />}
            label="Clear chat history"
            size="sm"
            onClick={clearChatHistory}
            disabled={messages.length <= 1}
          />
          {onToggleCollapse && (
            <IconButton
              icon={<PanelLeftClose className="w-3.5 h-3.5" />}
              label="Collapse AI chat sidebar"
              size="sm"
              onClick={onToggleCollapse}
            />
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} onFileClick={handleFileClick} />
        ))}

        {/* Live Streaming Message */}
        {isStreaming && (
          <div className="flex gap-3 text-sm">
            <div className="w-7 h-7 rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)] flex items-center justify-center shrink-0 border border-[var(--line)]">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="max-w-[88%] rounded-[var(--r-card)] px-4 py-3 bg-[var(--surface-2)] text-[var(--text)] border border-[var(--line)] space-y-2">
              {/* Trajectory Stream */}
              <AgentTrajectory
                logs={streamLogs}
                isStreaming={true}
                onFileClick={handleFileClick}
              />

              {/* Streaming Text Output */}
              <div className="whitespace-pre-wrap break-words">
                {currentStreamText || (
                  <span className="text-[var(--text-subtle)] italic flex items-center gap-1.5 text-xs">
                    <Loader2 className="w-3 h-3 animate-spin text-[var(--accent-text)]" /> Thinking and analyzing project...
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <ChatComposer
        onSend={sendMessage}
        isStreaming={isStreaming}
        onStop={stopGeneration}
        disabled={!isReady}
      />
    </div>
  );
};

export default ChatPanel;
