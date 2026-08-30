import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

app.use(morgan("combined"));

app.get("/api/status/healthz", (req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

app.get("/api/status/readyz", (req, res) => {
  res.status(200).json({
    status: "ready",
  });
});

const proxies = {};
const agentProxies = {};

export function getProxy(sandboxId) {
  const target = `http://sandbox-service-${sandboxId}`;

  if (!proxies[sandboxId]) {
    proxies[sandboxId] = createProxyMiddleware({
      target,
      changeOrigin: true,
      ws: true,
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
      ws: true,
    });
  }
  return agentProxies[sandboxId];
}

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

export default app;
