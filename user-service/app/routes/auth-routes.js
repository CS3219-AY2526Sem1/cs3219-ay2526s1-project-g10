import express from "express";
import { createClient } from "@supabase/supabase-js";
import { verifyAuth } from "../../middleware/auth-middleware.js";
import { handleLogin, handleVerifyToken } from "../controller/auth-controller.js";

const router = express.Router();

router.post("/login", handleLogin);
router.get("/me", verifyAuth, handleVerifyToken);
router.post("/logout", (req, res) => {
  res.status(200).json({ message: "User logged out" });
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "http://localhost:3000/reset-password",
  });

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ message: "Password reset email sent!" });
});

export default router;

