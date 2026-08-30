import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  RefreshCw,
  ExternalLink,
  Monitor,
  Tablet,
  Smartphone,
  Globe,
  Lock,
} from "lucide-react";

export default function PreviewFrame({ previewUrl }) {
  const [key, setKey] = useState(0);
  const [device, setDevice] = useState("desktop");
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef(null);

  const handleRefresh = () => {
    setIsLoading(true);
    setKey((prev) => prev + 1);
  };

  const getWidthStyle = () => {
    switch (device) {
      case "mobile":
        return "w-[380px] shadow-2xl rounded-3xl border border-white/20 my-5 h-[92%] overflow-hidden ring-4 ring-black/40";
      case "tablet":
        return "w-[780px] shadow-2xl rounded-3xl border border-white/20 my-5 h-[92%] overflow-hidden ring-4 ring-black/40";
      default:
        return "w-full h-full";
    }
  };

  if (!previewUrl) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#07080e] text-slate-500 text-xs select-none">
        <Globe className="w-10 h-10 text-slate-600 mb-2" />
        <span>No active preview URL</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#05060a] overflow-hidden">
      {/* Preview Address & Control Bar */}
      <div className="h-11 px-4 bg-[#0a0c13] border-b border-white/[0.07] flex items-center justify-between shrink-0 select-none z-10">
        {/* URL Pill */}
        <div className="flex items-center gap-2 flex-1 max-w-md bg-black/40 px-3 py-1 rounded-xl border border-white/[0.06] shadow-inner">
          <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="font-mono text-xs text-slate-300 truncate select-all">
            {previewUrl}
          </span>
        </div>

        {/* Viewport & Controls */}
        <div className="flex items-center gap-2.5">
          {/* Device Viewport Toggle */}
          <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/[0.06]">
            <button
              onClick={() => setDevice("desktop")}
              className={`p-1.5 rounded-lg transition-colors ${
                device === "desktop" ? "bg-white/10 text-cyan-300" : "text-slate-500 hover:text-slate-300"
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDevice("tablet")}
              className={`p-1.5 rounded-lg transition-colors ${
                device === "tablet" ? "bg-white/10 text-cyan-300" : "text-slate-500 hover:text-slate-300"
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`p-1.5 rounded-lg transition-colors ${
                device === "mobile" ? "bg-white/10 text-cyan-300" : "text-slate-500 hover:text-slate-300"
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Refresh Frame */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Reload Preview"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
          </motion.button>

          {/* External Window Link */}
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={previewUrl}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-cyan-400 transition-colors"
            title="Open in new window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </motion.a>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 flex items-center justify-center overflow-hidden bg-[#05060a]">
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
