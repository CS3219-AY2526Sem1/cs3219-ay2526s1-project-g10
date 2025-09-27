import http from "http";
import app from "./index.js";
import "dotenv/config";

const port = process.env.COLLABORATION_SERVICE_PORT;

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Collaboration service is running on http://localhost:${port}`);
});