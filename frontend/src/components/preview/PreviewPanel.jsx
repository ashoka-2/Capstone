import { useState, useRef } from 'react';
import {
  RotateCcw,
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
  Globe,
  Loader2,
} from 'lucide-react';
import { IconButton } from '../common/IconButton';
import { Button } from '../common/Button';
import { useSandbox } from '../../hooks/useSandbox';

export const PreviewPanel = ({ refreshTrigger = 0 }) => {
  const { previewUrl, isReady, isCreating, startSandbox } = useSandbox();
  const [device, setDevice] = useState('desktop'); // desktop | tablet | mobile
  const [manualReloadKey, setManualReloadKey] = useState(0);
  const [iframeLoading, setIframeLoading] = useState(true);
  const iframeRef = useRef(null);

  const handleReload = () => {
    setIframeLoading(true);
    setManualReloadKey((prev) => prev + 1);
  };

  const handleOpenExternal = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const viewportWidths = {
    desktop: 'w-full',
    tablet: 'w-[768px] max-w-full',
    mobile: 'w-[375px] max-w-full',
  };

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[var(--bg)]">
        <div className="w-14 h-14 rounded-2xl bg-[var(--surface)] border border-[var(--line-strong)] flex items-center justify-center text-[var(--accent-text)] mb-4 shadow-sm">
          <Globe className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
          Sandbox Not Running
        </h3>
        <p className="text-xs text-[var(--text-muted)] max-w-sm mb-6">
          Start the sandbox environment to initialize the Vite server and view your live interactive frontend preview.
        </p>
        <Button
          variant="accent"
          loading={isCreating}
          onClick={startSandbox}
        >
          {isCreating ? 'Provisioning Sandbox...' : 'Start Sandbox'}
        </Button>
      </div>
    );
  }

  // Key combines manual reload clicks and external refresh triggers
  const iframeKey = `${manualReloadKey}-${refreshTrigger}`;

  return (
    <div className="flex flex-col h-full bg-[var(--bg)]">
      {/* Browser Bar */}
      <div className="h-12 px-3 border-b border-[var(--line)] bg-[var(--surface)] flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-1">
          <IconButton
            icon={<RotateCcw className={`w-3.5 h-3.5 ${iframeLoading ? 'animate-spin' : ''}`} />}
            label="Reload preview"
            size="sm"
            onClick={handleReload}
          />
        </div>

        {/* URL Pill */}
        <div className="flex-1 max-w-md mx-auto">
          <div className="flex items-center gap-2 h-7 px-3 bg-[var(--surface-2)] border border-[var(--line)] rounded-full text-xs text-[var(--text-muted)] truncate select-all">
            <Globe className="w-3 h-3 text-[var(--text-subtle)] shrink-0" />
            <span className="truncate font-mono text-[11px]">{previewUrl}</span>
          </div>
        </div>

        {/* Device Switcher & External Link */}
        <div className="flex items-center gap-1">
          <div className="hidden sm:flex items-center bg-[var(--surface-2)] p-0.5 rounded-[var(--r-pill)] border border-[var(--line)]">
            <button
              type="button"
              onClick={() => setDevice('desktop')}
              className={`p-1 rounded-full cursor-pointer transition-colors ${
                device === 'desktop'
                  ? 'bg-[var(--surface)] text-[var(--text)]'
                  : 'text-[var(--text-subtle)] hover:text-[var(--text)]'
              }`}
              title="Desktop view (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDevice('tablet')}
              className={`p-1 rounded-full cursor-pointer transition-colors ${
                device === 'tablet'
                  ? 'bg-[var(--surface)] text-[var(--text)]'
                  : 'text-[var(--text-subtle)] hover:text-[var(--text)]'
              }`}
              title="Tablet view (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDevice('mobile')}
              className={`p-1 rounded-full cursor-pointer transition-colors ${
                device === 'mobile'
                  ? 'bg-[var(--surface)] text-[var(--text)]'
                  : 'text-[var(--text-subtle)] hover:text-[var(--text)]'
              }`}
              title="Mobile view (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          <IconButton
            icon={<ExternalLink className="w-3.5 h-3.5" />}
            label="Open preview in new tab"
            size="sm"
            onClick={handleOpenExternal}
          />
        </div>
      </div>

      {/* Iframe Viewport Container */}
      <div className="flex-1 flex items-center justify-center p-2 md:p-4 overflow-auto">
        <div
          className={`${viewportWidths[device]} h-full bg-white rounded-xl shadow-lg border border-[var(--line-strong)] overflow-hidden transition-all duration-200 relative`}
        >
          {iframeLoading && (
            <div className="absolute inset-0 bg-[var(--surface)]/80 backdrop-blur-xs flex items-center justify-center z-10">
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" />
                <span>Loading preview...</span>
              </div>
            </div>
          )}

          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={previewUrl}
            title="Sandbox Live Preview"
            className="w-full h-full border-0"
            onLoad={() => setIframeLoading(false)}
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
          />
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
