import express from "express";
import morgan from "morgan";
import http from "http";
import { createProxyMiddleware } from "http-proxy-middleware";
import { createProxyServer } from "httpxy";

const app = express();
app.use(morgan("combined"));

app.get("/api/sandbox/healthz", (req, res) => {
    res.status(200).json({
        message: "Sandbox Router server is healthy",
        status: "Ok"
    });
});

app.get("/api/sandbox/readyz", (req, res) => {
    res.status(200).json({
        message: "Sandbox Router server is ready",
        status: "ready"
    });
});

const proxies = {};
const agentProxies = {};

function getProxy(sandboxId) {
    const target = `http://sandbox-service-${sandboxId}`;

    if (!proxies[sandboxId]) {
        proxies[sandboxId] = createProxyMiddleware({
            target,
            changeOrigin: true,
        });
    }
    return proxies[sandboxId];
}

function getAgentProxy(sandboxId) {
    const target = `http://sandbox-service-${sandboxId}:3000`;

    if (!agentProxies[sandboxId]) {
        agentProxies[sandboxId] = createProxyMiddleware({
            target,
            changeOrigin: true,
        });
    }
    return agentProxies[sandboxId];
}

app.use((req, res, next) => {
    const host = req.headers.host || "";
    const parts = host.split('.');
    const sandboxId = parts[0];
    const type = parts[1];

    if (type === "agent") {
        return getAgentProxy(sandboxId)(req, res, next);
    } else if (type === "preview") {
        return getProxy(sandboxId)(req, res, next);
    } else {
        return res.status(404).json({
            message: "Unknown host pattern",
            status: "error"
        });
    }
});

const server = http.createServer(app);

const wsProxy = createProxyServer({ changeOrigin: true });
wsProxy.on('error', (err, req, socket) => {
    console.error("WS Proxy error:", err.message);
    socket?.destroy();
});

server.on('upgrade', (req, socket, head) => {
    socket.on('error', () => socket.destroy());

    const host = req.headers.host || "";
    const parts = host.split('.');
    const sandboxId = parts[0];
    const type = parts[1];

    console.log(`WS upgrade request: ${host}, sandboxId: ${sandboxId}, type:${type}`);

    if (type === "agent") {
        wsProxy.ws(req, socket, { target: `http://sandbox-service-${sandboxId}:3000` }, head)
            .catch(() => socket.destroy());
    } else if (type === "preview") {
        wsProxy.ws(req, socket, { target: `http://sandbox-service-${sandboxId}` }, head)
            .catch(() => socket.destroy());
    } else {
        socket.destroy();
    }
});

export default server;
