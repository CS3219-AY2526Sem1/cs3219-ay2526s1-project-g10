import express from "express";
import { PrismaClient } from "../../generated/prisma/index.js";
import { verifyAdmin } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];

function normalizeDifficulty(input) {
    if (!input) return null;
    const normalized = String(input).trim().toUpperCase();
    return DIFFICULTIES.includes(normalized) ? normalized : null;
}

function parseStringArray(value) {
    if (value === undefined) {
        return undefined;
    }

    if (Array.isArray(value)) {
        return value
            .map((item) => (typeof item === "string" ? item.trim() : String(item).trim()))
            .filter((item) => item.length > 0);
    }

    if (typeof value === "string") {
        const items = value
            .split(/\r?\n|,/)
            .map((part) => part.trim())
            .filter((part) => part.length > 0);
        return items;
    }

    return [];
}

function parseExamples(value) {
    if (value === undefined) {
        return undefined;
    }

    if (value === null) {
        return null;
    }

    if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed.length === 0) {
            return null;
        }

        try {
            return JSON.parse(trimmed);
        } catch (error) {
            throw new Error("examples must be a valid JSON string");
        }
    }

    return value;
}

function buildQuestionData(body, { requireAll = false } = {}) {
    const errors = [];
    const data = {};

    const requiredFields = ["title", "description", "solution", "difficulty", "topic"];

    requiredFields.forEach((field) => {
        if (requireAll && (body[field] === undefined || body[field] === null || String(body[field]).trim().length === 0)) {
            errors.push(`${field} is required`);
        }
    });

    if (body.title !== undefined) {
        const title = String(body.title).trim();
        if (!title) {
            errors.push("title cannot be empty");
        } else {
            data.title = title;
        }
    } else if (requireAll) {
        data.title = String(body.title || "").trim();
    }

    if (body.description !== undefined) {
        const description = String(body.description).trim();
        if (!description) {
            errors.push("description cannot be empty");
        } else {
            data.description = description;
        }
    }

    if (body.solution !== undefined) {
        const solution = String(body.solution).trim();
        if (!solution) {
            errors.push("solution cannot be empty");
        } else {
            data.solution = solution;
        }
    }

    if (body.difficulty !== undefined) {
        const difficulty = normalizeDifficulty(body.difficulty);
        if (!difficulty) {
            errors.push("difficulty must be one of EASY, MEDIUM or HARD");
        } else {
            data.difficulty = difficulty;
        }
    }

    if (body.topic !== undefined) {
        const topic = String(body.topic).trim();
        if (!topic) {
            errors.push("topic cannot be empty");
        } else {
            data.topic = topic;
        }
    }

    if (body.language !== undefined) {
        const language = String(body.language).trim();
        data.language = language.length > 0 ? language : null;
    }

    if (body.followUp !== undefined) {
        const followUp = String(body.followUp).trim();
        data.followUp = followUp.length > 0 ? followUp : null;
    }

    const descriptionImages = parseStringArray(body.descriptionImages);
    if (descriptionImages !== undefined) {
        data.descriptionImages = descriptionImages;
    } else if (requireAll) {
        data.descriptionImages = [];
    }

    const constraints = parseStringArray(body.constraints);
    if (constraints !== undefined) {
        data.constraints = constraints;
    } else if (requireAll) {
        data.constraints = [];
    }

    try {
        const examples = parseExamples(body.examples);
        if (examples !== undefined) {
            data.examples = examples;
        } else if (requireAll) {
            data.examples = null;
        }
    } catch (error) {
        errors.push(error.message);
    }

    return { data, errors };
}

function isPrismaNotFoundError(error) {
    return Boolean(error && typeof error === "object" && "code" in error && error.code === "P2025");
}

// GET /questions - Retrieve questions (random or paginated list)
router.get("/", async (req, res) => {
    const { difficulty, topic, page, limit, search } = req.query;

    const wantsRandom =
        (difficulty || topic) && !page && !limit && !search;

    try {
            if (wantsRandom) {
                const normalizedDifficulty = normalizeDifficulty(difficulty);

                if (difficulty && !normalizedDifficulty) {
                    return res.status(400).json({ error: "Invalid difficulty" });
                }

                        const trimmedTopic = typeof topic === "string" ? topic.trim() : undefined;

                        const filters = {
                            ...(normalizedDifficulty && { difficulty: normalizedDifficulty }),
                            ...(trimmedTopic && { topic: trimmedTopic }),
                        };

            const questions = await prisma.question.findMany({
                where: {
                    ...(filters.difficulty && { difficulty: filters.difficulty }),
                    ...(filters.topic && { topic: filters.topic }),
                },
            });

            if (!questions.length) {
                return res.status(404).json({ error: "No questions found matching the criteria" });
            }

            const randomIndex = Math.floor(Math.random() * questions.length);
            return res.json(questions[randomIndex]);
        }

        const pageNum = Number.parseInt(page, 10) || 1;
        const limitNum = Number.parseInt(limit, 10) || 20;
        const skip = (pageNum - 1) * limitNum;

            const filters = {};
            const normalizedDifficulty = normalizeDifficulty(difficulty);
            if (difficulty && !normalizedDifficulty) {
            return res.status(400).json({ error: "Invalid difficulty" });
        }

        if (normalizedDifficulty) {
            filters.difficulty = normalizedDifficulty;
        }

            if (topic) {
                const trimmedTopic = String(topic).trim();
                if (trimmedTopic.length > 0) {
                    filters.topic = trimmedTopic;
                }
        }

        const searchTerm = typeof search === "string" ? search.trim() : "";

        const whereClause = {
            ...filters,
            ...(searchTerm
                ? {
                        OR: [
                            { title: { contains: searchTerm, mode: "insensitive" } },
                            { description: { contains: searchTerm, mode: "insensitive" } },
                            { topic: { contains: searchTerm, mode: "insensitive" } },
                        ],
                    }
                : {}),
        };

        const [totalCount, questions] = await Promise.all([
            prisma.question.count({ where: whereClause }),
            prisma.question.findMany({
                where: whereClause,
                skip,
                take: limitNum,
                orderBy: { createdAt: "desc" },
            }),
        ]);

        return res.json({
            questions,
            totalCount,
            totalPages: Math.ceil(totalCount / limitNum) || 1,
            currentPage: pageNum,
        });
    } catch (error) {
        console.error("Error fetching questions:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /questions - Create a new question (admin only)
router.post("/", verifyAdmin, async (req, res) => {
    try {
        const { data, errors } = buildQuestionData(req.body, { requireAll: true });

        if (errors.length) {
            return res.status(400).json({ error: errors.join(", ") });
        }

        const createdQuestion = await prisma.question.create({
            data,
        });

        return res.status(201).json(createdQuestion);
    } catch (error) {
        console.error("Error creating question:", error);
        return res.status(500).json({ error: "Failed to create question" });
    }
});

// PATCH /questions/:id - Update a question (admin only)
router.patch("/:id", verifyAdmin, async (req, res) => {
    const questionId = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(questionId)) {
        return res.status(400).json({ error: "Invalid question id" });
    }

    try {
        const { data, errors } = buildQuestionData(req.body, { requireAll: false });

        if (errors.length) {
            return res.status(400).json({ error: errors.join(", ") });
        }

        if (!Object.keys(data).length) {
            return res.status(400).json({ error: "No valid fields provided for update" });
        }

        const updatedQuestion = await prisma.question.update({
            where: { id: questionId },
            data,
        });

        return res.json(updatedQuestion);
        } catch (error) {
            if (isPrismaNotFoundError(error)) {
            return res.status(404).json({ error: "Question not found" });
        }

        console.error("Error updating question:", error);
        return res.status(500).json({ error: "Failed to update question" });
    }
});

// DELETE /questions/:id - Delete a question (admin only)
router.delete("/:id", verifyAdmin, async (req, res) => {
    const questionId = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(questionId)) {
        return res.status(400).json({ error: "Invalid question id" });
    }

    try {
        await prisma.question.delete({
            where: { id: questionId },
        });

        return res.status(204).send();
        } catch (error) {
            if (isPrismaNotFoundError(error)) {
            return res.status(404).json({ error: "Question not found" });
        }

        console.error("Error deleting question:", error);
        return res.status(500).json({ error: "Failed to delete question" });
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