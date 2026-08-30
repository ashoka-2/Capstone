import http from "http";
import app, { getProxy, getAgentProxy } from "./src/app.js";

const server = http.createServer(app);

server.on("upgrade", (req, socket, head) => {
  const host = req.headers.host || "";
  const parts = host.split(".");
  const sandboxId = parts[0];
  const type = parts[1];

  if (type === "preview") {
    const proxy = getProxy(sandboxId);
    if (typeof proxy.upgrade === "function") {
      proxy.upgrade(req, socket, head);
    }
  } else if (type === "agent") {
    const proxy = getAgentProxy(sandboxId);
    if (typeof proxy.upgrade === "function") {
      proxy.upgrade(req, socket, head);
    }
  } else {
    socket.destroy();
  }
});

server.listen(3000, () => {
  console.log("Sandbox router running on port 3000");
});