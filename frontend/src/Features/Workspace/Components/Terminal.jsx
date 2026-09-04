import { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { io } from "socket.io-client";
import { Terminal as TermIcon, Trash2, Circle, Sparkles, RefreshCw } from "lucide-react";

export default function Terminal({ agentBase, height = 220, onResize }) {
  const terminalRef = useRef(null);
  const xtermInstance = useRef(null);
  const fitAddonRef = useRef(null);
  const socketRef = useRef(null);
  const [status, setStatus] = useState("connecting");

  useEffect(() => {
    if (!terminalRef.current || !agentBase) return;

    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: "bar",
      theme: {
        background: "#06070c",
        foreground: "#cbd5e1",
        cursor: "#06b6d4",
        selectionBackground: "rgba(6, 182, 212, 0.35)",
        black: "#1e293b",
        red: "#f87171",
        green: "#34d399",
        yellow: "#fbbf24",
        blue: "#818cf8",
        magenta: "#c084fc",
        cyan: "#22d3ee",
        white: "#f8fafc",
      },
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: 12,
      lineHeight: 1.45,
      scrollback: 2000,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());

    term.open(terminalRef.current);
    try {
      fitAddon.fit();
    } catch {}

    xtermInstance.current = term;
    fitAddonRef.current = fitAddon;

    term.writeln("\x1b[36m⚡ Connecting to sandbox container terminal...\x1b[0m");

    const socket = io(agentBase, {
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 15,
      timeout: 8000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("connected");
      term.writeln("\x1b[32m✔ Container session connected.\x1b[0m\r\n");
    });

    socket.on("terminal-output", (data) => {
      term.write(data);
    });

    socket.on("disconnect", () => {
      setStatus("disconnected");
    });

    socket.on("connect_error", () => {
      setStatus("connecting");
    });

    const disposable = term.onData((data) => {
      if (socket.connected) {
        socket.emit("terminal-input", data);
      }
    });

    const handleResize = () => {
      try {
        fitAddon.fit();
      } catch {}
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      try {
        disposable.dispose();
      } catch {}
      try {
        socket.removeAllListeners();
        socket.disconnect();
      } catch {}
      try {
        term.dispose();
      } catch {}
    };
  }, [agentBase]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        fitAddonRef.current?.fit();
      } catch {}
    }, 100);
    return () => clearTimeout(timer);
  }, [height]);

  const handleClear = () => {
    xtermInstance.current?.clear();
  };

  const handleReconnect = () => {
    setStatus("connecting");
    if (socketRef.current) {
      socketRef.current.connect();
    }
  };

  return (
    <div
      style={{ height: `${height}px` }}
      className="w-full bg-[#06070c] border-t border-subtle flex flex-col shrink-0 select-none relative"
    >
      {/* Terminal Control Bar */}
      <div className="h-8 px-4 bg-aside border-b border-subtle flex items-center justify-between text-xs text-sub transition-colors duration-200">
        <div className="flex items-center gap-2.5">
          <TermIcon className="w-3.5 h-3.5 text-[#ff7e40]" />
          <span className="font-semibold text-main text-[11px]">Container PTY</span>
          <div className="flex items-center gap-1.5 ml-2 bg-panel px-2 py-0.5 rounded-full border border-subtle">
            <Circle
              className={`w-1.5 h-1.5 fill-current ${
                status === "connected"
                  ? "text-emerald-500 dark:text-emerald-400"
                  : status === "connecting"
                  ? "text-amber-500 animate-pulse"
                  : "text-red-500"
              }`}
            />
            <span className="text-[10px] font-mono capitalize text-sub">
              {status === "connecting" ? "Starting PTY..." : status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === "disconnected" && (
            <button
              onClick={handleReconnect}
              className="p-1 text-sub hover:text-main transition-colors flex items-center gap-1 text-[11px]"
              title="Reconnect Terminal"
            >
              <RefreshCw className="w-3 h-3" /> Reconnect
            </button>
          )}
          <button
            onClick={handleClear}
            className="p-1 text-sub hover:text-main transition-colors"
            title="Clear Terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Body */}
      <div className="flex-1 p-2 overflow-hidden" ref={terminalRef} />
    </div>
  );
}
