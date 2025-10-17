import express from "express";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
  updateUserPrivilege,
} from "../controller/user-controller.js";

// Import your new Supabase middleware
import { verifyAuth } from "../middleware/auth-middleware.js";

// Keep your access control checks if they handle roles
import { verifyIsAdmin, verifyIsOwnerOrAdmin } from "../middleware/basic-access-control.js";

const router = express.Router();

// Protected routes
router.get("/", verifyAuth, verifyIsAdmin, getAllUsers);

router.patch("/:id/privilege", verifyAuth, verifyIsAdmin, updateUserPrivilege);

router.post("/", createUser); // public (signup handled by frontend Supabase Auth)

router.get("/:id", verifyAuth, verifyIsOwnerOrAdmin, getUser);

router.patch("/:id", verifyAuth, verifyIsOwnerOrAdmin, updateUser);

router.delete("/:id", verifyAuth, verifyIsOwnerOrAdmin, deleteUser);

export default router;
