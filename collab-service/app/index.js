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

function validateProxyTarget(target) {
  if (!target || target.includes("0.0.0.0")) {
    console.warn(
      "Collab proxy target is invalid or points to 0.0.0.0; skipping proxy setup. Set YW_HOST/YW_PORT to a reachable y-websocket endpoint."
    );
    return false;
  }
  if (!YW_HOST) {
    console.warn("YW_HOST is not configured; collab proxy will be disabled.");
    return false;
  }
  return true;
}

const shouldProxy = validateProxyTarget(YW_TARGET);

let collabProxy;
if (shouldProxy) {
  collabProxy = createProxyMiddleware({
    target: YW_TARGET,
    changeOrigin: true,
    ws: true,
    pathRewrite: { "^/collab": "" },
    onError(err, req, res) {
      console.error("Collab proxy encountered an error", err);
      if (!res.headersSent) {
        res.status(502).json({ error: "Collaboration service unavailable" });
      }
    },
  });

  app.use("/collab", collabProxy);
} else {
  app.use("/collab", (_req, res) => {
    res.status(503).json({ error: "Collaboration server not configured" });
  });
}

export const server = http.createServer(app);

if (shouldProxy && collabProxy) {
  server.on("upgrade", (req, socket, head) => {
    if (req.url && req.url.startsWith("/collab")) {
      collabProxy.upgrade(req, socket, head);
    } else {
      socket.destroy();
    }
  });
}

const PORT = Number(process.env.PORT || 8080);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Collab API (HTTP) on http://0.0.0.0:${PORT}`);
  console.log(`Gemini AI route ready at http://0.0.0.0:${PORT}/ai`);
  if (shouldProxy) {
    console.log(`Proxying WS at ws://0.0.0.0:${PORT}/collab  ->  ${YW_TARGET}`);
  } else {
    console.log("Collab proxy disabled; configure YW_HOST/YW_PORT to enable WebSocket forwarding.");
  }
});