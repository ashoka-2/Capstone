import { useEffect, useRef, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setConnected, setConnecting, setTerminalError } from '../store/slices/terminalSlice';
import { connectTerminalSocket, sendTerminalInput, disconnectTerminalSocket } from '../services/socket';

export function useTerminal({ containerRef }) {
  const dispatch = useAppDispatch();
  const { sandboxId, activeTab } = useAppSelector((state) => state.sandbox);
  const { isConnected, isConnecting, error } = useAppSelector((state) => state.terminal);

  const termRef = useRef(null);
  const fitAddonRef = useRef(null);

  const fitTerminal = useCallback(() => {
    if (!fitAddonRef.current || !containerRef?.current) return;
    try {
      const { clientWidth, clientHeight } = containerRef.current;
      // Only fit if container has actual rendered dimensions
      if (clientWidth > 20 && clientHeight > 20) {
        fitAddonRef.current.fit();
      }
    } catch {
      // ignore
    }
  }, [containerRef]);

  const initTerminal = useCallback(() => {
    if (!containerRef?.current || termRef.current) return;

    // Create xterm terminal instance with modern sleek styling
    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'bar',
      fontSize: 13,
      lineHeight: 1.3,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace',
      theme: {
        background: '#0c0c0e',
        foreground: '#e4e4e7',
        cursor: '#3566ef',
        cursorAccent: '#0c0c0e',
        selectionBackground: 'rgba(53, 102, 239, 0.35)',
        black: '#18181b',
        red: '#ef4444',
        green: '#10b981',
        yellow: '#f59e0b',
        blue: '#3566ef',
        magenta: '#8b5cf6',
        cyan: '#06b6d4',
        white: '#f4f4f5',
        brightBlack: '#71717a',
        brightRed: '#f87171',
        brightGreen: '#34d399',
        brightYellow: '#fbbf24',
        brightBlue: '#60a5fa',
        brightMagenta: '#a78bfa',
        brightCyan: '#38bdf8',
        brightWhite: '#ffffff',
      },
      convertEol: true,
      disableStdin: false,
      scrollback: 5000,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(containerRef.current);

    term.writeln('\x1b[38;2;138;171;248m● Sandbox Terminal Initialized\x1b[0m');
    term.writeln('\x1b[90mConnecting to interactive PTY shell session...\x1b[0m\n');

    term.onData((data) => {
      sendTerminalInput(data);
    });

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    // Trigger initial fit after paint
    setTimeout(() => {
      try {
        fitAddon.fit();
      } catch {
        // ignore
      }
    }, 100);

    const handleWindowResize = () => {
      requestAnimationFrame(() => {
        try {
          fitAddon.fit();
        } catch {
          // ignore
        }
      });
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [containerRef]);

  const connect = useCallback(() => {
    if (!sandboxId) return;

    dispatch(setConnecting(true));

    connectTerminalSocket(sandboxId, {
      onConnect: () => {
        dispatch(setConnected(true));
        termRef.current?.writeln('\x1b[32m✔ Connected to interactive shell session\x1b[0m\n');
        // Fit terminal as soon as connected
        setTimeout(() => fitTerminal(), 80);
      },
      onDisconnect: (reason) => {
        dispatch(setConnected(false));
        termRef.current?.writeln(`\r\n\x1b[33mDisconnected from terminal (${reason})\x1b[0m\n`);
      },
      onError: (err) => {
        dispatch(setTerminalError(err));
        termRef.current?.writeln(`\r\n\x1b[31mTerminal connection notice: ${err}\x1b[0m\n`);
      },
      onOutput: (data) => {
        termRef.current?.write(data);
      },
    });
  }, [sandboxId, dispatch, fitTerminal]);

  // Handle initialization and connection
  useEffect(() => {
    const cleanup = initTerminal();
    if (sandboxId) {
      connect();
    }

    return () => {
      cleanup?.();
      disconnectTerminalSocket();
      if (termRef.current) {
        termRef.current.dispose();
        termRef.current = null;
      }
    };
  }, [sandboxId, initTerminal, connect]);

  // Observe container resizes with ResizeObserver so terminal always fills 100%
  useEffect(() => {
    if (!containerRef?.current) return;
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        fitTerminal();
      });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerRef, fitTerminal]);

  // Whenever the tab switches to 'terminal', fit immediately
  useEffect(() => {
    if (activeTab === 'terminal') {
      const timer = setTimeout(() => {
        fitTerminal();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeTab, fitTerminal]);

  const clearTerminal = useCallback(() => {
    termRef.current?.clear();
  }, []);

  return {
    isConnected,
    isConnecting,
    error,
    reconnect: connect,
    clearTerminal,
    fitTerminal,
  };
}
