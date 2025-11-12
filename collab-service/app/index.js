import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import http from "http";
import aiRoutes from "./routes/ai-routes.js";

const app = express();
const allowOrigins = process.env.COLLAB_ALLOWED_ORIGINS
  ? process.env.COLLAB_ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: allowOrigins,
    credentials: true,
  })
);
app.use(express.json()); 
app.get("/healthz", (_req, res) => res.json({ ok: true }));
app.use("/ai", aiRoutes);

const YW_HOST = process.env.YW_HOST || "127.0.0.1";
const YW_PORT = Number(process.env.YW_PORT || 1234);
const YW_TARGET = `http://${YW_HOST}:${YW_PORT}`;

// (Future) JWT check:
// app.use("/collab", verifyRoomTokenMiddleware);

// HTTP proxy for any REST endpoints the ws server might expose (usually none)
const collabProxy = createProxyMiddleware({
  target: YW_TARGET,
  changeOrigin: true,
  ws: true,
  pathRewrite: { "^/collab": "" },
});

app.use("/collab", collabProxy);

// Create HTTP server so we can hook WS upgrades too
export const server = http.createServer(app);

// Upgrade proxy: forward WebSocket upgrade to y-websocket
server.on("upgrade", (req, socket, head) => {
  if (req.url && req.url.startsWith("/collab")) {
    collabProxy.upgrade(req, socket, head);
  } else {
    socket.destroy();
  }
});

const PORT = Number(process.env.PORT || 8080);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Collab API (HTTP) on http://0.0.0.0:${PORT}`);
  console.log(`Gemini AI route ready at http://0.0.0.0:${PORT}/ai`);
  console.log(`Proxying WS at ws://0.0.0.0:${PORT}/collab  ->  ${YW_TARGET}`);
});

app.get("/healthz", (_req, res) => res.json({ ok: true }));