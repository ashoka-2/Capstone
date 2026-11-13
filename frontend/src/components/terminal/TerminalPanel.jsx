import { useRef } from 'react';
import { Terminal as TerminalIcon, RefreshCw, Trash2, Maximize2 } from 'lucide-react';
import { IconButton } from '../common/IconButton';
import { Badge } from '../common/Badge';
import { Chip } from '../common/Badge';
import { useTerminal } from '../../hooks/useTerminal';
import { sendTerminalInput } from '../../services/socket';

const QUICK_COMMANDS = [
  'ls -la',
  'pwd',
  'cat package.json',
  'npm run dev',
];

export const TerminalPanel = () => {
  const containerRef = useRef(null);
  const { isConnected, isConnecting, reconnect, clearTerminal, fitTerminal } = useTerminal({
    containerRef,
  });

  const handleSendCommand = (cmd) => {
    sendTerminalInput(`${cmd}\r`);
  };

  return (
    <div className="terminal-wrapper h-full w-full flex flex-col bg-[#0c0c0e] text-white overflow-hidden">
      {/* Terminal Top Bar */}
      <div className="h-11 px-3 md:px-4 border-b border-[var(--line)] bg-[var(--surface)] flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          {/* Window control dots */}
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]/80 inline-block" />
          </div>

          <div className="flex items-center gap-2">
            <TerminalIcon className="w-3.5 h-3.5 text-[var(--accent-text)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text)]">
              Terminal
            </span>
          </div>

          {isConnected ? (
            <Badge variant="success" dot>
              Connected
            </Badge>
          ) : isConnecting ? (
            <Badge variant="warning" dot>
              Connecting...
            </Badge>
          ) : (
            <Badge variant="danger" dot>
              Disconnected
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Quick command pills */}
          <div className="hidden lg:flex items-center gap-1.5 mr-2">
            {QUICK_COMMANDS.map((cmd) => (
              <Chip
                key={cmd}
                onClick={() => handleSendCommand(cmd)}
                className="text-[11px] font-mono h-6 px-2.5 py-0 bg-[var(--surface-2)] hover:bg-[var(--raised)] border border-[var(--line)]"
              >
                {cmd}
              </Chip>
            ))}
          </div>

          <IconButton
            icon={<Maximize2 className="w-3.5 h-3.5" />}
            label="Fit terminal dimensions"
            size="sm"
            onClick={fitTerminal}
          />
          <IconButton
            icon={<Trash2 className="w-3.5 h-3.5" />}
            label="Clear terminal"
            size="sm"
            onClick={clearTerminal}
          />
          <IconButton
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isConnecting ? 'animate-spin' : ''}`} />}
            label="Reconnect terminal"
            size="sm"
            onClick={reconnect}
          />
        </div>
      </div>

      {/* Terminal Viewport Container (Takes 100% of remaining space) */}
      <div className="flex-1 w-full min-h-0 relative overflow-hidden bg-[#0c0c0e]">
        <div
          ref={containerRef}
          className="terminal-container"
        />
      </div>
    </div>
  );
};

export default TerminalPanel;
