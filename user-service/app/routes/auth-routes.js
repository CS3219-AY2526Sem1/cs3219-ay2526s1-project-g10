import express from "express";
import { verifyAuth } from "../../middleware/auth-middleware.js";
import { getUser, updateUser, deleteUser } from "../controller/user-controller.js";

const router = express.Router();

// Protected routes
router.get("/profile", verifyAuth, getUser);
router.put("/profile", verifyAuth, updateUser);
router.delete("/profile", verifyAuth, deleteUser);

export default router;
