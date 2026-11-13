import { useState, useRef } from 'react';
import { ArrowUp, Square } from 'lucide-react';
import { Chip } from '../common/Badge';

const SUGGESTIONS = [
  'Build a modern Hero section with gradient badge',
  'Add a sleek dark/light toggle and stats row',
  'Create an interactive memory card game in React',
  'Inspect App.jsx and polish typography & spacing',
];

export const ChatComposer = ({
  onSend,
  isStreaming,
  onStop,
  disabled = false,
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (isStreaming) {
      onStop?.();
      return;
    }
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectSuggestion = (text) => {
    setInput(text);
    textareaRef.current?.focus();
  };

  return (
    <div className="p-3 md:p-4 bg-[var(--surface)] border-t border-[var(--line)] space-y-2.5">
      {/* Suggestions Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        {SUGGESTIONS.map((item, index) => (
          <Chip
            key={index}
            onClick={() => handleSelectSuggestion(item)}
            className="shrink-0 text-xs"
          >
            {item}
          </Chip>
        ))}
      </div>

      {/* Composer Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center bg-[var(--surface-2)] border border-[var(--line)] rounded-[var(--r-card)] px-3 py-2 focus-within:border-[var(--accent)] transition-colors"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled
              ? 'Start sandbox first to chat with AI...'
              : 'Ask AI to generate or modify components (e.g. "Build a pricing table")...'
          }
          disabled={disabled}
          rows={1}
          className="w-full bg-transparent text-[var(--text)] text-sm resize-none outline-none max-h-24 py-1 pr-12 placeholder:text-[var(--text-subtle)]"
          style={{ minHeight: '24px' }}
        />

        <div className="absolute right-2.5 bottom-2 flex items-center">
          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              className="w-8 h-8 rounded-full bg-[var(--danger)] text-white flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
              title="Stop generation"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={disabled || !input.trim()}
              className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--accent-hover)] transition-colors"
              title="Send prompt"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ChatComposer;
