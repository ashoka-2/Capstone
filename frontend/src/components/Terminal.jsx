import { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { io } from "socket.io-client";
import { Terminal as TermIcon, Trash2, Maximize2, Minimize2, Circle } from "lucide-react";

export default function Terminal({ agentBase, height = 220, onResize }) {
  const terminalRef = useRef(null);
  const xtermInstance = useRef(null);
  const fitAddonRef = useRef(null);
  const socketRef = useRef(null);
  const [status, setStatus] = useState("connecting"); // 'connected' | 'connecting' | 'disconnected'

  useEffect(() => {
    if (!terminalRef.current || !agentBase) return;

    // 1. Initialize XTerm.js
    const term = new XTerm({
      cursorBlink: true,
      theme: {
        background: "#0c0d14",
        foreground: "#d1d5db",
        cursor: "#06b6d4",
        selectionBackground: "rgba(6, 182, 212, 0.3)",
        black: "#1f2335",
        red: "#f87171",
        green: "#4ade80",
        yellow: "#facc15",
        blue: "#60a5fa",
        magenta: "#c084fc",
        cyan: "#22d3ee",
        white: "#f3f4f6",
      },
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: 12,
      lineHeight: 1.4,
      scrollback: 1000,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());

    term.open(terminalRef.current);
    fitAddon.fit();

    xtermInstance.current = term;
    fitAddonRef.current = fitAddon;

    term.writeln("\x1b[36m⚡ Connecting to sandbox container terminal...\x1b[0m");

    // 2. Connect Socket.IO
    const socket = io(agentBase, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("connected");
      term.writeln("\x1b[32m✔ Terminal connected.\x1b[0m\r\n");
    });

    socket.on("terminal-output", (data) => {
      term.write(data);
    });

    socket.on("disconnect", () => {
      setStatus("disconnected");
      term.writeln("\r\n\x1b[31m✖ Terminal disconnected.\x1b[0m");
    });

    socket.on("connect_error", () => {
      setStatus("disconnected");
    });

    // User typing into terminal
    const disposable = term.onData((data) => {
      socket.emit("terminal-input", data);
    });

    // Handle window resize
    const handleResize = () => {
      try {
        fitAddon.fit();
      } catch {}
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      disposable.dispose();
      socket.disconnect();
      term.dispose();
    };
  }, [agentBase]);

  // Re-fit when height changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fitAddonRef.current?.fit();
    }, 100);
    return () => clearTimeout(timer);
  }, [height]);

  const handleClear = () => {
    xtermInstance.current?.clear();
  };

  return (
    <div
      style={{ height: `${height}px` }}
      className="w-full bg-[#0c0d14] border-t border-white/10 flex flex-col shrink-0 select-none relative"
    >
      {/* Terminal Control Bar */}
      <div className="h-7 px-3 bg-[#11131c] border-b border-white/5 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <TermIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-gray-300 text-[11px]">Terminal</span>
          <div className="flex items-center gap-1.5 ml-2">
            <Circle
              className={`w-2 h-2 fill-current ${
                status === "connected"
                  ? "text-emerald-400"
                  : status === "connecting"
                  ? "text-amber-400 animate-pulse"
                  : "text-red-400"
              }`}
            />
            <span className="text-[10px] capitalize text-gray-500">{status}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleClear}
            className="p-1 hover:text-white rounded hover:bg-white/5 transition-colors"
            title="Clear Terminal"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Terminal Mount Node */}
      <div ref={terminalRef} className="flex-1 w-full p-2 overflow-hidden" />
    </div>
  );
}
