import { io } from 'socket.io-client';

let socketInstance = null;

/**
 * Creates or retrieves a Socket.IO connection for the sandbox terminal.
 * Connects to the same-origin Vite proxy which injects Host: <sandboxId>.agent.localhost
 */
export function connectTerminalSocket(
  sandboxId,
  { onOutput, onConnect, onDisconnect, onError }
) {
  // Disconnect existing socket if any
  disconnectTerminalSocket();

  if (!sandboxId) return null;

  const url = window.location.origin;
  const options = {
    path: `/agent-socket/${sandboxId}/socket.io`,
    transports: ['polling', 'websocket'],
    upgrade: true,
    reconnection: true,
    reconnectionAttempts: 15,
    reconnectionDelay: 1000,
    timeout: 10000,
  };

  try {
    socketInstance = io(url, options);

    socketInstance.on('connect', () => {
      onConnect?.();
      // Send a newline to trigger bash to print the current shell prompt immediately
      socketInstance.emit('terminal-input', '\r');
      socketInstance.emit('terminal input', '\r');
    });

    socketInstance.on('disconnect', (reason) => {
      onDisconnect?.(reason);
    });

    socketInstance.on('connect_error', (error) => {
      onError?.(error.message || 'Connection error');
    });

    // Listen for terminal output from PTY process
    socketInstance.on('terminal-output', (data) => {
      onOutput?.(data);
    });
    socketInstance.on('terminal output', (data) => {
      onOutput?.(data);
    });

    return socketInstance;
  } catch (err) {
    onError?.(err.message || 'Failed to initialize socket');
    return null;
  }
}

/**
 * Send terminal input data (user key strokes / command strings) to PTY
 */
export function sendTerminalInput(data) {
  if (socketInstance && socketInstance.connected) {
    socketInstance.emit('terminal-input', data);
    socketInstance.emit('terminal input', data);
  }
}

/**
 * Send terminal window resize event to PTY so shell columns & rows match xterm.js
 */
export function sendTerminalResize(cols, rows) {
  if (socketInstance && socketInstance.connected && cols > 0 && rows > 0) {
    socketInstance.emit('terminal-resize', { cols, rows });
    socketInstance.emit('resize', { cols, rows });
  }
}

/**
 * Disconnect and cleanup terminal socket
 */
export function disconnectTerminalSocket() {
  if (socketInstance) {
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
    socketInstance = null;
  }
}
