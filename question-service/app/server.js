import http from "http";
import app from "./index.js";
import "dotenv/config";

const port = Number(process.env.PORT || process.env.QUESTION_SERVICE_PORT || 3003);

const server = http.createServer(app);

server.listen(port, "0.0.0.0", () => {
  console.log(`Question service is running on http://localhost:${port}`);
});