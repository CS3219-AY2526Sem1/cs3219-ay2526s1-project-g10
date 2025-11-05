import express from "express";
import { verifyAuth } from "../../middleware/auth-middleware.js";
import {
  handleForgotPassword,
  handleLogin,
  handleMe,
  handleSignup,
} from "../controller/auth-controller.js";

const router = express.Router();

router.post("/login", handleLogin);
router.post("/signup", handleSignup);
router.post("/forgot-password", handleForgotPassword);
router.get("/me", verifyAuth, handleMe);
router.post("/logout", (req, res) => {
  res.status(200).json({ message: "User logged out" });
});

export default router;

