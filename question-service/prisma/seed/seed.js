import {PrismaClient} from '../generated/prisma';
import fs from 'fs';

// Initialize Prisma Client
const prisma = new PrismaClient();
async function main() {
    //read from json file
    const data = JSON.parse(fs.readFileSync('questions-list.json', 'utf-8'));

    for (const q of data) {
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