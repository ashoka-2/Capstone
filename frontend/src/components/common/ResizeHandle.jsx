import { GripVertical } from 'lucide-react';

export const ResizeHandle = ({ onMouseDown, isResizing, className = '' }) => {
  return (
    <div
      role="separator"
      tabIndex={0}
      aria-orientation="vertical"
      onMouseDown={onMouseDown}
      onTouchStart={onMouseDown}
      className={`relative w-1.5 hover:w-2 shrink-0 cursor-col-resize select-none group transition-all duration-150 z-30 ${
        isResizing ? 'w-2 bg-[var(--accent)]' : 'bg-transparent hover:bg-[var(--line-strong)]'
      } ${className}`}
    >
      {/* 1px visual border line */}
      <div
        className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] transition-colors ${
          isResizing
            ? 'bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]'
            : 'bg-[var(--line)] group-hover:bg-[var(--accent-text)]'
        }`}
      />

      {/* Floating center pill grip icon */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-7 rounded-full bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center transition-all ${
          isResizing
            ? 'opacity-100 border-[var(--accent)] shadow-sm'
            : 'opacity-0 group-hover:opacity-100 shadow-sm'
        }`}
      >
        <GripVertical className="w-2.5 h-2.5 text-[var(--text-muted)] group-hover:text-[var(--text)]" />
      </div>
    </div>
  );
};

export default ResizeHandle;
