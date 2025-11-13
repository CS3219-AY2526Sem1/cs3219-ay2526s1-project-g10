import http from "http";
import index from "./index.js";
import "dotenv/config";

//import testRoutes from "./app/routes/test-routes.js";
//app.use("/test", testRoutes);

const port = Number(process.env.PORT || process.env.USER_SERVICE_PORT || 3001);

const server = http.createServer(index);

server.listen(port, "0.0.0.0", () => {
  console.log(`User service server listening on http://localhost:${port}`);
});

