import express from "express";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";
import { setupWSConnection } from "y-websocket/bin/utils";
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

const wsPath = (process.env.COLLAB_WS_PATH || "/collab").replace(/\/$/, "");

app.get("/", (_req, res) => {
  res.json({ ok: true });
});

app.get("/healthz", (_req, res) => res.json({ ok: true }));
app.get(wsPath, (_req, res) => res.json({ ok: true }));
app.use("/ai", aiRoutes);

// (Future) JWT check:
// app.use("/collab", verifyRoomTokenMiddleware);

export const server = http.createServer(app);

function extractDocName(requestUrl) {
  if (!requestUrl) {
    return "room";
  }

  const [path, query] = requestUrl.split("?");
  if (query) {
    const params = new URLSearchParams(query);
    const roomParam = params.get("room");
    if (roomParam) {
      return roomParam;
    }
  }

  let docPath = path;
  if (docPath.startsWith(wsPath)) {
    docPath = docPath.slice(wsPath.length);
  }

  return docPath.replace(/^\//, "") || "room";
}
const wss = new WebSocketServer({ noServer: true });

wss.on("connection", (ws, req) => {
  const docName = extractDocName(req.url ?? "");

  setupWSConnection(ws, req, {
    gc: true,
    docName,
  });
});

server.on("upgrade", (req, socket, head) => {
  if (!req.url || !req.url.startsWith(wsPath)) {
    socket.destroy();
    return;
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

const PORT = Number(process.env.PORT || 8080);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Collab service listening on http://0.0.0.0:${PORT}`);
  console.log(`WebSocket endpoint available at ws://0.0.0.0:${PORT}${wsPath}`);
});