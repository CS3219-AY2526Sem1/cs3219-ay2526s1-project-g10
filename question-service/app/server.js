import http from "http";
import app from "./index.js";
import "dotenv/config";

const port = process.env.QUESTION_SERVICE_PORT;

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Question service is running on http://localhost:${port}`);
});