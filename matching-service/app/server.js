// Run 'brew services start rabbitmq' to start RabbitMQ server
console.log("Reached server.js");

import http from "http";
import app from "./index.js"; // same folder
import "dotenv/config";
import "./rabbitmqClient.js"; // ensure RabbitMQ connection is established

console.log("All imports succeeded");
const port = process.env.MATCHING_SERVICE_PORT || 3003;
const server = http.createServer(app);

server.listen(port, () => {
 console.log(`Matching service is running on http://localhost:${port}`) || 3003;
});