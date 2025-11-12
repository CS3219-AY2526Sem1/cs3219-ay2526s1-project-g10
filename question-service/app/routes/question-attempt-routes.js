import express from "express";
import { PrismaClient } from '../../generated/prisma/index.js';

const router = express.Router();
const prisma = new PrismaClient();

// POST /history - Records a new question attempt
router.post("/", async (req, res) => {
    const { userId, questionId, solution, actions, attemptedAt, questionJson } = req.body;
    try {
        console.log("Recording question attempt:", req.body);
        const newAttempt = await prisma.questionAttempt.create({
            data: {
                userId,
                questionId: questionId? parseInt(questionId) : null,
                actions,
                attemptedAt,
                status: "PENDING", // Default status
                code: "", // Default code
                questionJson: questionJson || null,
            },
        });
        res.status(201).json(newAttempt);
    }
    catch (error) {
        console.error("Error recording question attempt:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /history/user/:userId - Retrieves all question attempts for a specific user
router.get("/user/:userId", async (req, res) => {
    const {userId} = req.params;
    try {
        const attempts = await prisma.questionAttempt.findMany({
            where: {userId},
        });
        res.json(attempts);
    } catch (error) {
        console.error("Error fetching question attempts:", error);
        res.status(500).json({error: "Internal Server Error"});
        }
});

// PATCH /question-attempts/:attemptId - Updates the status of a specific question attempt
router.patch("/:attemptId", async (req, res) => {
    const {attemptId} = req.params;
    const {questionId, code, duration, output, status} = req.body;
    try {
        const updatedData = {};
        if (questionId) {
            updatedData.questionId = parseInt(questionId);
        }
        if (code) {
            updatedData.code = code;
        }
        if (duration) {
            updatedData.duration = parseInt(duration);
        }
        if (output) {
            updatedData.output = output;
        }
        if (status) {
            updatedData.status = status;
        }
        const updatedAttempt = await prisma.questionAttempt.update({
            where: {id: parseInt(attemptId)},
            data: updatedData,
        });
        res.json(updatedAttempt);
    } catch (error) {
        console.error("Error updating question attempt:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
});

//PATCH /history/:attemptId/duration - Updates only the duration of a specific question attempt
router.patch("/:attemptId/duration", async (req, res) => {
    const { attemptId } = req.params;
    const { duration } = req.body;
    try {
        const updatedAttempt = await prisma.questionAttempt.update({
            where: { id: parseInt(attemptId) },
            data: { duration: parseInt(duration) },
        });
        res.json(updatedAttempt);
    } catch (error) {
        console.error("Error updating question attempt duration:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
export default router;