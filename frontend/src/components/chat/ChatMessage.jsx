import { Bot, User } from 'lucide-react';
import { AgentTrajectory } from './AgentTrajectory';

export const ChatMessage = ({ message, onFileClick }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="py-2 px-3 my-1 rounded-xl bg-[var(--danger-soft)] text-[var(--danger)] text-xs border border-red-500/20 font-mono">
        {message.content}
      </div>
    );
  }

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

        {/* Timestamp */}
        <div className="mt-1 text-[10px] text-[var(--text-subtle)] text-right">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
