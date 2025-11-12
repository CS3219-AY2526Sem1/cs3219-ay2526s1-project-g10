import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { question, code, message } = req.body;

    const prompt = `
You are an AI assistant helping users solve coding interview questions.

### Question
${question || "No question provided."}

### User's Current Code
${code || "No code provided."}

### User's Message / Request
"${message}"

---
Based on the question and the code above, give a helpful, accurate, and concise response within 1300 characters.
If the user asks for a hint, guide them toward the solution without giving away the full code.
If they ask for debugging help, point out the likely issue and suggest fixes.
Explain your reasoning clearly.
    `;

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent",
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
      }
    );

    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text
      || "Sorry, I couldn’t generate a response.";

    res.json({ reply });
  } catch (error) {
    console.error("Gemini API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to get response from Gemini" });
  }
});

export default router;
