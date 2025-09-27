import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

// Health check
app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok" });
}); 


// Define routes
app.use("/api", (req, res) => {
  res.json({ message: "Collab service is running!" });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;