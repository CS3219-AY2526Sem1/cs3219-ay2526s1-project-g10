import express from "express";
import { startMatching } from "../controllers/matchController.js";

const router = express.Router();

// Temporary route just to test
// router.post("/", (req, res) => {
//     res.json({ message: "Matching route is working!" });
//   });

router.post("/", startMatching);
  
export default router;
  