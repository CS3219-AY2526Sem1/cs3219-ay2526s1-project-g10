import express from "express";
import { startMatching, confirmMatch, cancelMatching, getActiveSession, endSession } from "../controllers/matchController.js";
import { verifyAuth } from "../middleware/authMiddleware.js";
import {
  createCustomRoom,
  joinCustomRoom,
  getCustomRoomInfo,
  leaveCustomRoom,
} from "../controllers/customMatchController.js";

const router = express.Router();

// Temporary route just to test
// router.post("/", (req, res) => {
//     res.json({ message: "Matching route is working!" });
//   });

router.use(verifyAuth);

router.post("/", startMatching);
router.post("/cancel", cancelMatching);
router.get("/session", getActiveSession);
router.delete("/session", endSession);
router.post("/:userId", confirmMatch);
router.post("/custom-matching/create", createCustomRoom);
router.post("/custom-matching/join", joinCustomRoom);
router.get("/custom-matching/:roomCode", getCustomRoomInfo);
router.delete("/custom-matching/leave", leaveCustomRoom);
  
export default router;
  