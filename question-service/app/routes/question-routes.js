import express from "express";
import {PrismaClient} from '../../generated/prisma/index.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /questions - Retrieve all questions
router.get("/", async (req, res) => {
    const {difficulty, topic, page = 1, limit = 100} = req.query;
    let questions;

    try {
        // If a difficulty or topic is provided, filter questions accordingly
        if (difficulty || topic) {
            questions = await prisma.question.findMany({
                where: {
                    ...(difficulty && {difficulty: difficulty.toUpperCase()}),
                    ...(topic && {topic: topic}),
                },
            });

            if (questions.length === 0) {
                return res.status(404).json({error: "No questions found matching the criteria"});
            }

            //pick one random question from the filtered list
            const randomIndex = Math.floor(Math.random() * questions.length);
            res.json(questions[randomIndex]);

        } else {
            // If no filters, return the first 100 questions
//            questions = await prisma.question.findMany({take: 100});
//            res.json(questions);
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const skip = (pageNum - 1) * limitNum;

            const totalCount = await prisma.question.count();
            questions = await prisma.question.findMany({skip, take: limitNum});

            return res.json({
              questions,
              totalCount,
              totalPages: Math.ceil(totalCount / limitNum),
              currentPage: pageNum,
            });
        }
    } catch (error) {
        console.error("Error fetching questions:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
});

// GET /questions/:id - Retrieve a specific question by ID
router.get("/:id", async (req, res) => {
    const {id} = req.params;

    try {
        const question = await prisma.question.findUnique({
            where: {id: parseInt(id)},
        });

        if (!question) {
            return res.status(404).json({error: "Question not found"});
        }

        res.json(question);
    } catch (error) {
        console.error("Error fetching question:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
});

export default router;