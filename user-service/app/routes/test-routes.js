import express from "express";
import { verifyAuth } from "../middleware/auth-middleware.js";

const router = express.Router();

router.get("/test-auth", verifyAuth, (req, res) => {
  res.json({
    message: "✅ Supabase token verified!",
    user: req.user,
  });
});

export default router;
