console.log("Reached server.js");

import "dotenv/config";
import http from "http";
import app from "./index.js"; // same folder

console.log("All imports succeeded");
const port = process.env.MATCHING_SERVICE_PORT || 3002;
const server = http.createServer(app);

server.listen(port, () => {
 console.log(`Matching service is running on http://localhost:${port}`) || 3002;
});