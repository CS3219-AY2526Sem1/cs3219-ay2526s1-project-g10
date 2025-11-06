import express from "express";
import { startMatching, confirmMatch, cancelMatching, getActiveSession, endSession } from "../controllers/matchController.js";
import { verifyAuth } from "../middleware/authMiddleware.js";

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
  
export default router;
  