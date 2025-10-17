import express from "express";
import { verifyAuth } from "../middleware/auth-middleware.js";
import { getProfile, updateProfile, deleteProfile } from "../controller/user-controller.js";

const router = express.Router();

// Protected routes
router.get("/profile", verifyAuth, getProfile);
router.put("/profile", verifyAuth, updateProfile);
router.delete("/profile", verifyAuth, deleteProfile);

export default router;
