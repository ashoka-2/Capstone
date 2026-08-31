import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  RefreshCw,
  ExternalLink,
  Monitor,
  Tablet,
  Smartphone,
  Globe,
  Lock,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function PreviewFrame({ previewUrl }) {
  const [key, setKey] = useState(0);
  const [device, setDevice] = useState("desktop");
  const [isReady, setIsReady] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    setIsReady(false);
    setIsRefreshing(false);
    // Automatic timeout to clear overlay if iframe load takes a while
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, [previewUrl, key]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setIsReady(false);
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
      <div
        className="flex-1 flex flex-col items-center justify-center text-xs select-none"
        style={{
          backgroundColor: "hsl(var(--background))",
          color: "hsl(var(--muted-foreground))",
        }}
      >
        <Globe className="w-10 h-10 mb-2 opacity-50" />
        <span>No active preview URL</span>
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: "hsl(var(--background))" }}
    >
      {/* Preview Address & Control Bar */}
      <div
        className="h-11 px-4 border-b flex items-center justify-between shrink-0 select-none z-10"
        style={{
          backgroundColor: "hsl(var(--card))",
          borderColor: "hsl(var(--border) / 0.6)",
        }}
      >
        {/* URL Pill */}
        <div
          className="flex items-center gap-2 flex-1 max-w-md px-3 py-1 rounded-xl border shadow-inner"
          style={{
            backgroundColor: "hsl(var(--muted) / 0.4)",
            borderColor: "hsl(var(--border) / 0.5)",
          }}
        >
          <Lock
            className="w-3 h-3 shrink-0 text-emerald-400"
          />
          <span
            className="font-mono text-xs truncate select-all"
            style={{ color: "hsl(var(--foreground))" }}
          >
            {previewUrl}
          </span>
        </div>

        {/* Viewport & Controls */}
        <div className="flex items-center gap-2.5">
          {/* Device Viewport Toggle */}
          <div
            className="flex items-center p-1 rounded-xl border"
            style={{
              backgroundColor: "hsl(var(--muted) / 0.4)",
              borderColor: "hsl(var(--border) / 0.5)",
            }}
          >
            {[
              { id: "desktop", icon: Monitor, title: "Desktop View" },
              { id: "tablet", icon: Tablet, title: "Tablet View (768px)" },
              { id: "mobile", icon: Smartphone, title: "Mobile View (375px)" },
            ].map(({ id, icon: Icon, title }) => (
              <button
                key={id}
                onClick={() => setDevice(id)}
                className="p-1.5 rounded-lg transition-colors"
                style={{
                  backgroundColor:
                    device === id ? "hsl(var(--card))" : "transparent",
                  color:
                    device === id
                      ? "hsl(var(--foreground))"
                      : "hsl(var(--muted-foreground))",
                }}
                title={title}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>

          {/* Refresh Frame */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="p-2 rounded-xl transition-colors hover:opacity-80"
            style={{ color: "hsl(var(--muted-foreground))" }}
            title="Reload Preview"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isRefreshing || !isReady ? "animate-spin" : ""
              }`}
              style={{
                color:
                  isRefreshing || !isReady
                    ? "hsl(var(--brand-tiger-primary))"
                    : "inherit",
              }}
            />
          </motion.button>

          {/* External Window Link */}
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={previewUrl}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl transition-colors hover:opacity-80"
            style={{ color: "hsl(var(--muted-foreground))" }}
            title="Open in new window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </motion.a>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 flex items-center justify-center overflow-hidden relative">
        {!isReady && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 backdrop-blur-sm"
            style={{ backgroundColor: "hsl(var(--background) / 0.85)" }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--brand-tiger-primary)), hsl(var(--brand-flamingo-primary)))",
              }}
            >
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span
                className="text-xs font-semibold"
                style={{ color: "hsl(var(--foreground))" }}
              >
                Launching sandbox container...
              </span>
              <span
                className="text-[11px]"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                Vite dev server starting up
              </span>
            </div>
            <Loader2
              className="w-4 h-4 animate-spin mt-1"
              style={{ color: "hsl(var(--brand-tiger-primary))" }}
            />
          </div>
        )}

        <iframe
          key={key}
          ref={iframeRef}
          src={previewUrl}
          onLoad={() => {
            setIsReady(true);
            setIsRefreshing(false);
          }}
          className={`bg-white transition-all duration-300 ${getWidthStyle()}`}
          title="Sandbox Preview"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
}
