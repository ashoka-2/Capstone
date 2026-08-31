import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";
import http from "http";
import { createProxyServer } from "httpxy";

const app = express();
app.use(morgan("combined"));

// Universal CORS Middleware for proxying requests from frontend
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.get("/api/status/healthz", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/api/status/readyz", (req, res) => {
  res.status(200).json({ status: "ready" });
});

const proxies = {};
const agentProxies = {};

export function getProxy(sandboxId) {
  const target = `http://sandbox-service-${sandboxId}`;
  if (!proxies[sandboxId]) {
    proxies[sandboxId] = createProxyMiddleware({
      target,
      changeOrigin: true,
    });
  }
  return proxies[sandboxId];
}

export function getAgentProxy(sandboxId) {
  const target = `http://sandbox-service-${sandboxId}:3000`;
  if (!agentProxies[sandboxId]) {
    agentProxies[sandboxId] = createProxyMiddleware({
      target,
      changeOrigin: true,
    });
  }
  return agentProxies[sandboxId];
}

// Single httpxy proxy server for all WebSocket upgrades
const wsProxy = createProxyServer({ changeOrigin: true });
wsProxy.on("error", (err, req, socket) => {
  console.error("WS proxy error:", err.message);
  socket?.destroy();
});

app.use((req, res, next) => {
  const host = req.headers.host || "";
  const sandboxId = host.split(".")[0];
  const type = host.split(".")[1];

  if (type === "agent") {
    return getAgentProxy(sandboxId)(req, res, next);
  } else if (type === "preview") {
    return getProxy(sandboxId)(req, res, next);
  } else {
    res.status(404).send("Invalid Host");
  }
});

// Create the HTTP server explicitly with WebSocket upgrade routing
const server = http.createServer(app);

server.on("upgrade", (req, socket, head) => {
  const host = req.headers.host;
  if (!host) {
    socket.destroy();
    return;
  }

  // Prevent EPIPE and connection-reset errors from crashing the process
  socket.on("error", () => socket.destroy());

  const sandboxId = host.split(".")[0];
  const type = host.split(".")[1];

  console.log(`WS upgrade request: ${host}, sandboxId: ${sandboxId}, type: ${type}`);

  if (type === "agent") {
    wsProxy
      .ws(req, socket, { target: `http://sandbox-service-${sandboxId}:3000` }, head)
      .catch(() => socket.destroy());
  } else if (type === "preview") {
    wsProxy
      .ws(req, socket, { target: `http://sandbox-service-${sandboxId}` }, head)
      .catch(() => socket.destroy());
  } else {
    socket.destroy();
  }
});

export default server;
