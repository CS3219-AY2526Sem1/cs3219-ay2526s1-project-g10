import "dotenv/config";
import http from "http";
import app from "./index.js"; // same folder
import resetRedisOnBoot from "./utils/resetRedisOnBoot.js";

const port = process.env.MATCHING_SERVICE_PORT || 3002;
const server = http.createServer(app);

async function startServer() {
	try {
		await resetRedisOnBoot();

		server.listen(port, () => {
			console.log(`Matching service is running on http://localhost:${port}`);
		});
	} catch (error) {
		console.error("Failed to start matching service:", error);
		process.exit(1);
	}
}

startServer().catch((error) => {
	console.error("Unexpected error during server startup:", error);
	process.exit(1);
});