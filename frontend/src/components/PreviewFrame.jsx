import { useState, useRef } from "react";
import {
  RefreshCw,
  ExternalLink,
  Monitor,
  Tablet,
  Smartphone,
  Globe,
} from "lucide-react";

export default function PreviewFrame({ previewUrl }) {
  const [key, setKey] = useState(0);
  const [device, setDevice] = useState("desktop"); // 'desktop' | 'tablet' | 'mobile'
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef(null);

  const handleRefresh = () => {
    setIsLoading(true);
    setKey((prev) => prev + 1);
  };

  const getWidthStyle = () => {
    switch (device) {
      case "mobile":
        return "max-w-[375px] shadow-2xl rounded-2xl border border-white/20 my-4 h-[94%]";
      case "tablet":
        return "max-w-[768px] shadow-2xl rounded-2xl border border-white/20 my-4 h-[94%]";
      default:
        return "w-full h-full";
    }
  };

  if (!previewUrl) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0e1017] text-gray-500 text-xs select-none">
        <Globe className="w-10 h-10 text-gray-600 mb-2" />
        <span>No active preview URL</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0b10] overflow-hidden">
      {/* Preview Navigation Bar */}
      <div className="h-10 px-4 bg-[#12131d] border-b border-white/10 flex items-center justify-between shrink-0 select-none z-10">
        {/* URL Input Display */}
        <div className="flex items-center gap-2 flex-1 max-w-lg bg-black/40 px-3 py-1 rounded-lg border border-white/5">
          <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="font-mono text-xs text-gray-300 truncate select-all">
            {previewUrl}
          </span>
        </div>

        {/* Viewport & Controls */}
        <div className="flex items-center gap-2">
          {/* Device Viewport Toggle */}
          <div className="flex items-center bg-black/40 p-0.5 rounded-lg border border-white/5">
            <button
              onClick={() => setDevice("desktop")}
              className={`p-1 rounded-md transition-colors ${
                device === "desktop" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDevice("tablet")}
              className={`p-1 rounded-md transition-colors ${
                device === "tablet" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`p-1 rounded-md transition-colors ${
                device === "mobile" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Refresh Frame */}
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Reload Preview"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
          </button>

          {/* External Window Link */}
          <a
            href={previewUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-cyan-400 transition-colors"
            title="Open in new window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 flex items-center justify-center overflow-hidden bg-[#0a0b10]">
        <iframe
          key={key}
          ref={iframeRef}
          src={previewUrl}
          onLoad={() => setIsLoading(false)}
          className={`bg-white transition-all duration-300 ${getWidthStyle()}`}
          title="Sandbox Preview"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
}
