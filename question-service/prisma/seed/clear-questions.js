import { PrismaClient } from "../../generated/prisma/index.js";
const prisma = new PrismaClient();

async function main() {
    await prisma.question.deleteMany(); // deletes all rows in Question table
    console.log("All questions deleted!");
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
