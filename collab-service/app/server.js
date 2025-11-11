import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import aiRoutes from "./routes/ai-routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4003;


app.use(cors());
app.use(express.json());

app.use("/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("Collaboration Service + Gemini AI is running 🚀");
});

app.listen(PORT, () => {
  console.log(`✅ Collaboration service listening on port ${PORT}`);
});
