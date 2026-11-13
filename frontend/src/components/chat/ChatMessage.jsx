import { useState } from 'react';
import { Bot, User, RotateCcw, Check } from 'lucide-react';
import { AgentTrajectory } from './AgentTrajectory';

export const ChatMessage = ({ message, onFileClick, onUndo }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const [isUndoing, setIsUndoing] = useState(false);
  const [undone, setUndone] = useState(false);

  if (isSystem) {
    return (
      <div className="py-2 px-3 my-1 rounded-xl bg-[var(--danger-soft)] text-[var(--danger)] text-xs border border-red-500/20 font-mono">
        {message.content}
      </div>
    );
  }

  const handleUndo = async () => {
    if (!message.snapshot || isUndoing || undone) return;
    try {
      setIsUndoing(true);
      await onUndo?.(message.snapshot);
      setUndone(true);
    } finally {
      setIsUndoing(false);
    }
  };

  const hasSnapshot = Boolean(
    !isUser &&
    message.snapshot &&
    Object.keys(message.snapshot).length > 0
  );

  return (
    <div className={`flex gap-3 text-sm leading-relaxed ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border border-[var(--line)] ${
          isUser
            ? 'bg-[var(--surface-2)] text-[var(--text)]'
            : 'bg-[var(--accent-soft)] text-[var(--accent-text)]'
        }`}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>

      {/* Message Body */}
      <div
        className={`max-w-[88%] rounded-[var(--r-card)] px-4 py-3 border border-[var(--line)] ${
          isUser
            ? 'bg-[var(--surface-2)] text-[var(--text)]'
            : 'bg-[var(--surface)] text-[var(--text)]'
        }`}
      >
        {/* Agent Trajectory / Action Steps */}
        {!isUser && message.logs && message.logs.length > 0 && (
          <AgentTrajectory logs={message.logs} onFileClick={onFileClick} />
        )}

        {/* Content */}
        {message.content && (
          <div className="whitespace-pre-wrap break-words">{message.content}</div>
        )}

        {/* Footer: Undo Action & Timestamp */}
        <div className="mt-2 pt-1 border-t border-[var(--line)]/50 flex items-center justify-between text-[11px] text-[var(--text-subtle)]">
          {hasSnapshot && (
            <button
              type="button"
              disabled={isUndoing || undone}
              onClick={handleUndo}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                undone
                  ? 'text-emerald-400 bg-emerald-500/10 cursor-default'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] border border-[var(--line)]'
              }`}
              title="Revert files to their state before this AI turn"
            >
              {undone ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Changes Reverted</span>
                </>
              ) : (
                <>
                  <RotateCcw className={`w-3 h-3 ${isUndoing ? 'animate-spin' : ''}`} />
                  <span>{isUndoing ? 'Reverting...' : 'Undo AI Changes'}</span>
                </>
              )}
            </button>
          )}

          <div className="ml-auto text-[10px]">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
