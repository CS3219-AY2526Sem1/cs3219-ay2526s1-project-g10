import express from "express";
import { verifyAuth } from "../../middleware/auth-middleware.js";
import { getUser, updateUser, deleteUser } from "../controller/user-controller.js";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// Protected routes
router.get("/profile", verifyAuth, getUser);
router.put("/profile", verifyAuth, updateUser);
router.delete("/profile", verifyAuth, deleteUser);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "http://localhost:3000/reset-password", // your frontend route
  });

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ message: "Password reset email sent!" });
});


export default router;

