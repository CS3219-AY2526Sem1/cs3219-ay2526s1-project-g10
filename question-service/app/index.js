import express from "express";
import cors from "cors";
import questionRoutes from "./routes/question-routes.js";
import questionAttemptRoutes from "./routes/question-attempt-routes.js";

const app = express();

app.use(express.json());
app.use(cors());

// Health check
app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok" });
}); 

// Use question routes
app.use("/questions", questionRoutes);

// Use history routes
app.use("/history", questionAttemptRoutes);


app.use("/api", (req, res) => {
  res.json({ message: "Question service is running!" });
});

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;