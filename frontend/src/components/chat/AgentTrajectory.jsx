import { useState } from 'react';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { parseTrajectoryLogs } from '../../utils/trajectoryParser';

export const AgentTrajectory = ({ logs = [], isStreaming = false, onFileClick }) => {
  const [isOpen, setIsOpen] = useState(true);

  const steps = parseTrajectoryLogs(logs);

  if (steps.length === 0 && !isStreaming) {
    return null;
  }

  // Determine an intuitive header title based on steps or streaming status
  let headerTitle = 'Reading project files';
  if (steps.length > 0) {
    const lastOrFirst = steps[0];
    const prefix = lastOrFirst.action === 'Edited' ? 'Editing' : 'Reading';
    headerTitle = `${prefix} ${lastOrFirst.fileName || 'files'}`;
  } else if (isStreaming) {
    headerTitle = 'Analyzing project...';
  }

  const renderDetail = (detail) => {
    if (!detail) return null;

    // Check for diff format like "+9 -1" or "+21 -10"
    const diffMatch = detail.match(/^(\+\d+)\s+(-\d+)$/);
    if (diffMatch) {
      return (
        <span className="font-mono text-xs ml-auto flex items-center gap-1.5 shrink-0">
          <span className="text-emerald-400 font-medium">{diffMatch[1]}</span>
          <span className="text-rose-400 font-medium">{diffMatch[2]}</span>
        </span>
      );
    }

    // Line range like "#L30-65"
    return (
      <span className="font-mono text-[11px] text-[var(--text-subtle)] ml-auto shrink-0">
        {detail}
      </span>
    );
  };

  return (
    <div className="my-2 rounded-[var(--r-card)] bg-[var(--surface-2)]/60 border border-[var(--line)] p-3 text-xs">
      {/* Header with toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer select-none group"
      >
        <span className="font-medium text-xs text-[var(--text)] flex items-center gap-1.5">
          {headerTitle}
        </span>
        <div className="text-[var(--text-subtle)] group-hover:text-[var(--text)] transition-transform">
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Trajectory List */}
      {isOpen && (
        <div className="mt-3 space-y-2 pt-1 border-t border-[var(--line)]/50">
          {steps.map((step) => (
            <div
              key={step.id}
              className="flex items-center gap-2 text-xs py-0.5 leading-normal"
            >
              <span className="text-[var(--text-subtle)] min-w-[54px]">{step.action}</span>

              {/* Language / Framework Badge */}
              <span
                className={`text-xs select-none inline-flex items-center justify-center min-w-[20px] ${step.badgeColor}`}
                title={`Type: ${step.badge}`}
              >
                {step.badge}
              </span>

              {/* File name (clickable to jump into Monaco editor) */}
              <button
                type="button"
                onClick={() => onFileClick?.(step.filePath || step.fileName)}
                className="text-[var(--text)] hover:text-[var(--accent-text)] hover:underline truncate font-mono text-left cursor-pointer transition-colors"
                title={`Open ${step.filePath || step.fileName}`}
              >
                {step.fileName}
              </button>

              {/* Line range or diff stats */}
              {renderDetail(step.detail)}
            </div>
          ))}

          {/* Working / Completed Indicator */}
          <div className="pt-2 text-xs flex items-center gap-1.5 font-medium">
            {isStreaming ? (
              <span className="flex items-center gap-1.5 text-[var(--accent-text)]">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Working</span>
              </span>
            ) : (
              <span className="text-[var(--text-subtle)] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <span>Done</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentTrajectory;

