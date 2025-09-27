import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

// Define routes

// Health check
app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok" });
}); 

app.use("/api", (req, res) => {
  res.json({ message: "Matching service is running!" });
});

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;