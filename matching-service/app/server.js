console.log("Reached server.js");

import http from "http";
import app from "./index.js"; // same folder
import "dotenv/config";

console.log("All imports succeeded");
const port = process.env.MATCHING_SERVICE_PORT || 3003;
const server = http.createServer(app);

server.listen(port, () => {
 console.log(`Matching service is running on http://localhost:${port}`) || 3003;
});