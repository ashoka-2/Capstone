import { useState } from 'react';
import {
  Box,
  Copy,
  Check,
  RotateCcw,
  Sun,
  Moon,
  Play,
  PanelLeft,
  PanelLeftClose,
} from 'lucide-react';
import { Button } from '../common/Button';
import { IconButton } from '../common/IconButton';
import { Badge } from '../common/Badge';
import { useSandbox } from '../../hooks/useSandbox';
import { useTheme } from '../../hooks/useTheme';

export const Header = ({ isChatCollapsed, onToggleChatCollapse }) => {
  const {
    sandboxId,
    isReady,
    isCreating,
    startSandbox,
    resetSandbox,
  } = useSandbox();

  const { theme, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    if (!sandboxId) return;
    navigator.clipboard.writeText(sandboxId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="h-16 px-4 md:px-6 border-b border-[var(--line)] bg-[var(--surface)] flex items-center justify-between gap-4 z-20 shrink-0">
      {/* Brand & Sandbox Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center border border-[var(--line)] shrink-0">
          <Box className="w-5 h-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-[var(--text)]">
              Codespace Sandbox
            </span>
            {isReady ? (
              <Badge variant="success" dot>
                Running
              </Badge>
            ) : isCreating ? (
              <Badge variant="warning" dot>
                Provisioning
              </Badge>
            ) : (
              <Badge variant="muted">Offline</Badge>
            )}
          </div>

          {sandboxId && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] truncate">
              <span className="truncate max-w-[140px] md:max-w-[240px] font-mono text-[11px]">
                {sandboxId}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="hover:text-[var(--text)] p-0.5 rounded cursor-pointer transition-colors"
                title="Copy Sandbox ID"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-[var(--success)]" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Actions: Start / New Session & Theme Toggle */}
      <div className="flex items-center gap-2">
        {isReady && onToggleChatCollapse && (
          <Button
            variant={isChatCollapsed ? 'accent' : 'secondary'}
            size="sm"
            icon={isChatCollapsed ? <PanelLeft className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
            onClick={onToggleChatCollapse}
            title={isChatCollapsed ? 'Open AI Assistant panel' : 'Collapse AI Assistant panel'}
          >
            <span className="hidden sm:inline">{isChatCollapsed ? 'Open Chat' : 'Hide Chat'}</span>
          </Button>
        )}

        {!isReady ? (
          <Button
            variant="accent"
            size="sm"
            icon={<Play className="w-3.5 h-3.5 fill-current" />}
            loading={isCreating}
            onClick={startSandbox}
          >
            {isCreating ? 'Creating Sandbox...' : 'Start Sandbox'}
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={resetSandbox}
            title="Disconnect current sandbox and start fresh"
          >
            New Session
          </Button>
        )}

        {/* Theme Toggle */}
        <IconButton
          icon={theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          size="sm"
          onClick={toggleTheme}
        />
      </div>
    </header>
  );
};

export default Header;
