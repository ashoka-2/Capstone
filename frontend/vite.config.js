import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    cors: {
      origin: /^https?:\/\/(?:.+\.)?localhost(?::\d+)?$/,
    },
    proxy: {
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
      },
      // Agent proxy route: rewrites /agent-proxy/<sandboxId>/<endpoint> -> http://localhost/<endpoint> with Host header
      '^/agent-proxy/([^/]+)': {
        target: 'http://localhost',
        changeOrigin: false,
        secure: false,
        rewrite: (path) => path.replace(/^\/agent-proxy\/[^/]+/, '') || '/',
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const rawUrl = req.originalUrl || req.url || '';
            const match = rawUrl.match(/\/agent-proxy\/([^/?#]+)/);
            if (match && match[1]) {
              const host = `${match[1]}.agent.localhost`;
              proxyReq.setHeader('Host', host);
              proxyReq.setHeader('host', host);
            }
          });
        },
      },
      // Preview proxy route: rewrites /preview-proxy/<sandboxId>/<path> -> http://localhost/<path> with Host header
      '^/preview-proxy/([^/]+)': {
        target: 'http://localhost',
        changeOrigin: false,
        secure: false,
        rewrite: (path) => path.replace(/^\/preview-proxy\/[^/]+/, '') || '/',
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const rawUrl = req.originalUrl || req.url || '';
            const match = rawUrl.match(/\/preview-proxy\/([^/?#]+)/);
            if (match && match[1]) {
              const host = `${match[1]}.preview.localhost`;
              proxyReq.setHeader('Host', host);
              proxyReq.setHeader('host', host);
            }
          });
        },
      },
      // Socket.io proxy: rewrites /agent-socket/<sandboxId>/socket.io -> http://localhost/socket.io with Host header
      '^/agent-socket/([^/]+)': {
        target: 'http://localhost',
        ws: true,
        changeOrigin: false,
        secure: false,
        rewrite: (path) => path.replace(/^\/agent-socket\/[^/]+/, '') || '/',
        configure: (proxy) => {
          const setHostHeader = (proxyReq, req) => {
            const rawUrl = req.originalUrl || req.url || '';
            const match = rawUrl.match(/\/agent-socket\/([^/?#]+)/);
            if (match && match[1]) {
              const host = `${match[1]}.agent.localhost`;
              proxyReq.setHeader('Host', host);
              proxyReq.setHeader('host', host);
            }
          };
          proxy.on('proxyReq', setHostHeader);
          proxy.on('proxyReqWs', setHostHeader);
        },
      },
    },
  },
})
