import { PrismaClient } from "../../generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
    const question = await prisma.question.findUnique({
        where: { id: 2000 },
    });

    console.log("Title:", question.title);
    console.log("Description:\n", question.description);

    if (question.examples) {
        question.examples.forEach((ex, i) => {
            console.log(ex.text); // this will render \n as real line breaks
            if (ex.image) console.log("Image:", ex.image);
        });
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
