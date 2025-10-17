import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import http from "http";

const app = express();
app.use(cors({ origin: ["http://localhost:3000"], credentials: true }));
app.get("/healthz", (_req, res) => res.json({ ok: true }));

const YW_HOST = process.env.YW_HOST || "127.0.0.1";
const YW_PORT = Number(process.env.YW_PORT || 1234);
const YW_TARGET = `http://${YW_HOST}:${YW_PORT}`;

// (Future) JWT check:
// app.use("/collab", verifyRoomTokenMiddleware);

// HTTP proxy for any REST endpoints the ws server might expose (usually none)
app.use("/collab", createProxyMiddleware({
  target: YW_TARGET,
  changeOrigin: true,
  ws: true,             
  pathRewrite: { "^/collab": "" },
}));

// Create HTTP server so we can hook WS upgrades too
export const server = http.createServer(app);

// Upgrade proxy: forward WebSocket upgrade to y-websocket
server.on("upgrade", (req, socket, head) => {
  // (Future) verify tokens here before allowing the upgrade.
  // If allowed, proxy will handle the upgrade automatically because ws:true is set.
});

const PORT = Number(process.env.PORT || 4444);

server.listen(PORT, () => {
  console.log(`Collab API (HTTP) on http://localhost:${PORT}`);
  console.log(`Proxying WS at ws://localhost:${PORT}/collab  ->  ${YW_TARGET}`);
});