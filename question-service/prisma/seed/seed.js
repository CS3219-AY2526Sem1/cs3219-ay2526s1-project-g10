import {PrismaClient} from '../../generated/prisma/index.js';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

// To use __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, 'questions-list-cleaned.json');

// Initialize Prisma Client
const prisma = new PrismaClient();
async function main() {
    //read from JSON file
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    for (const q of data) {

        // Skip if any compulsory field missing
        if (!q.title || !q.description || !q.solution || !q.difficulty || !q.topic) continue;

        // Skip if difficulty not one of EASY, MEDIUM, HARD
        const difficulty = q.difficulty.toUpperCase();
        if (!["EASY","MEDIUM","HARD"].includes(difficulty)) continue;

        //create question
        await prisma.question.create({
            data: {
                title: q.title,                        // question title
                description: q.description,            // question description
                descriptionImages: q.description_images || [], // question images if any
                constraints: q.constraints || [],      // question constraints if any
                examples: q.examples || null,          // question output examples if any
                solution: q.solution,                  // solution to question
                difficulty: q.difficulty.toUpperCase(), // question difficulty (enum: EASY/MEDIUM/HARD)
                language: q.language || null,          // question language
                topic: q.topic,                        // question topic
                followUp: q.follow_up || null,         // question follow up if any
            },
        });
    }
    console.log('question insert completed.');
}

// Execute the main function and handle errors
main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });