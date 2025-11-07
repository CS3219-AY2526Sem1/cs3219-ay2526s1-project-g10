import express from "express";
import { PrismaClient } from '../../generated/prisma/index.js';

const router = express.Router();
const prisma = new PrismaClient();

// POST /history - Records a new question attempt
router.post("/", async (req, res) => {
    const { userId, questionId, solution, actions, attemptedAt } = req.body;
    try {
        console.log("Recording question attempt:", req.body);
        const newAttempt = await prisma.questionAttempt.create({
            data: {
                userId,
                questionId: parseInt(questionId),
                solution,
                actions,
                attemptedAt,
                status: "PENDING", // Default status
                duration: 0, // Default duration
                code: "", // Default code
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
    const {status, duration, code, actions} = req.body;
    try {
        const updatedAttempt = await prisma.questionAttempt.update({
            where: {id: parseInt(attemptId)},
            data: {
            status,
            duration,
            code,
            actions,
            },
        });
        res.json(updatedAttempt);
    } catch (error) {
        console.error("Error updating question attempt:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
});

export default router;