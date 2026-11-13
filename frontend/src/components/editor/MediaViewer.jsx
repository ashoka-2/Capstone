import { useState, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  ExternalLink,
  Volume2,
  Film,
  Image as ImageIcon,
  Sun,
  Moon,
  Grid,
} from 'lucide-react';
import { IconButton } from '../common/IconButton';
import { Badge } from '../common/Badge';

export const MediaViewer = ({ filePath, sandboxId, svgContent }) => {
  const [zoom, setZoom] = useState(1);
  const [bgMode, setBgMode] = useState('checkered'); // 'checkered' | 'dark' | 'light'
  const [naturalDim, setNaturalDim] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(true);
  const imgRef = useRef(null);

  const cleanPath = filePath?.startsWith('/') ? filePath.slice(1) : filePath;
  const isSvg = cleanPath?.toLowerCase().endsWith('.svg');
  const mediaUrl = `/preview-proxy/${sandboxId}/${cleanPath}`;

  // When image loads, store natural dimensions
  const handleImageLoaded = (e) => {
    setLoading(false);
    setNaturalDim({
      width: e.target.naturalWidth || 0,
      height: e.target.naturalHeight || 0,
    });
  };

  const isVideo = ['mp4', 'webm', 'ogv', 'mov'].some((ext) => cleanPath?.toLowerCase().endsWith(`.${ext}`));
  const isAudio = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'].some((ext) => cleanPath?.toLowerCase().endsWith(`.${ext}`));

  const bgClasses = {
    checkered: 'bg-[radial-gradient(#80808020_1px,transparent_1px)] [background-size:16px_16px] bg-[var(--surface)]',
    dark: 'bg-[#0f1117]',
    light: 'bg-[#f8fafc]',
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--surface-2)] overflow-hidden select-none">
      {/* Media Toolbar */}
      <div className="h-12 px-4 border-b border-[var(--line)] bg-[var(--surface)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-xs font-mono">
          {isVideo ? (
            <Film className="w-4 h-4 text-purple-400" />
          ) : isAudio ? (
            <Volume2 className="w-4 h-4 text-amber-400" />
          ) : (
            <ImageIcon className="w-4 h-4 text-sky-400" />
          )}
          <span className="text-[var(--text)] font-medium truncate max-w-[200px] sm:max-w-xs">{cleanPath}</span>
          {naturalDim.width > 0 && (
            <Badge variant="neutral">
              {naturalDim.width} × {naturalDim.height} px
            </Badge>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Zoom controls for images & SVGs */}
          {!isVideo && !isAudio && (
            <>
              <div className="flex items-center bg-[var(--surface-2)] border border-[var(--line)] rounded-[var(--r-btn)] p-0.5 mr-2">
                <IconButton
                  icon={<ZoomOut className="w-3.5 h-3.5" />}
                  label="Zoom out"
                  size="sm"
                  onClick={() => setZoom((prev) => Math.max(0.2, prev - 0.25))}
                  disabled={zoom <= 0.25}
                />
                <span className="px-2 text-[11px] font-mono text-[var(--text-muted)] min-w-[44px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <IconButton
                  icon={<ZoomIn className="w-3.5 h-3.5" />}
                  label="Zoom in"
                  size="sm"
                  onClick={() => setZoom((prev) => Math.min(4, prev + 0.25))}
                  disabled={zoom >= 4}
                />
                <IconButton
                  icon={<Maximize2 className="w-3.5 h-3.5" />}
                  label="Reset zoom (100%)"
                  size="sm"
                  onClick={() => setZoom(1)}
                />
              </div>

              {/* Background switch */}
              <div className="flex items-center bg-[var(--surface-2)] border border-[var(--line)] rounded-[var(--r-btn)] p-0.5">
                <button
                  type="button"
                  title="Checkered transparency"
                  onClick={() => setBgMode('checkered')}
                  className={`p-1.5 rounded-[var(--r-btn)] cursor-pointer transition-colors ${
                    bgMode === 'checkered' ? 'bg-[var(--surface)] text-[var(--text)]' : 'text-[var(--text-muted)]'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Dark background"
                  onClick={() => setBgMode('dark')}
                  className={`p-1.5 rounded-[var(--r-btn)] cursor-pointer transition-colors ${
                    bgMode === 'dark' ? 'bg-[var(--surface)] text-[var(--text)]' : 'text-[var(--text-muted)]'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Light background"
                  onClick={() => setBgMode('light')}
                  className={`p-1.5 rounded-[var(--r-btn)] cursor-pointer transition-colors ${
                    bgMode === 'light' ? 'bg-[var(--surface)] text-[var(--text)]' : 'text-[var(--text-muted)]'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}

          <a
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new window"
            className="p-1.5 rounded-[var(--r-btn)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Media Canvas Body */}
      <div className={`flex-1 overflow-auto flex items-center justify-center p-6 ${bgClasses[bgMode]}`}>
        {isVideo ? (
          <div className="max-w-2xl w-full bg-[var(--surface)] p-3 rounded-[var(--r-card)] border border-[var(--line)] shadow-lg">
            <video
              controls
              autoPlay={false}
              className="w-full rounded-[var(--r-subtle)] max-h-[70vh] bg-black"
              src={mediaUrl}
            >
              Your browser does not support HTML5 video.
            </video>
          </div>
        ) : isAudio ? (
          <div className="max-w-md w-full bg-[var(--surface)] p-6 rounded-[var(--r-card)] border border-[var(--line)] shadow-lg space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)] flex items-center justify-center mx-auto">
              <Volume2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-[var(--text)]">{cleanPath}</h4>
              <p className="text-xs text-[var(--text-muted)]">Audio File Preview</p>
            </div>
            <audio controls className="w-full mt-2" src={mediaUrl}>
              Your browser does not support HTML5 audio.
            </audio>
          </div>
        ) : isSvg && svgContent ? (
          /* SVG Vector Graphic Render */
          <div
            className="transition-transform duration-150 ease-out flex items-center justify-center"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          >
            <div
              className="max-w-full max-h-[75vh] [&>svg]:max-w-full [&>svg]:max-h-[75vh] [&>svg]:w-auto [&>svg]:h-auto shadow-sm"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </div>
        ) : (
          /* Raster Image Render */
          <div
            className="transition-transform duration-150 ease-out flex items-center justify-center relative"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          >
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface)]/80">
                <span className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <img
              ref={imgRef}
              src={mediaUrl}
              alt={cleanPath}
              onLoad={handleImageLoaded}
              className="max-w-full max-h-[75vh] object-contain rounded-[var(--r-subtle)] shadow-sm pointer-events-auto"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaViewer;
