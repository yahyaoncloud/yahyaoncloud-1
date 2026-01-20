
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const portfolio = await prisma.portfolio.findFirst({
        include: {
            experiences: true
        }
    });
    
    if (!portfolio) {
        console.log("No portfolio found");
        return;
    }

    console.log("Portfolio Name:", portfolio.name);
    if (portfolio.experiences && portfolio.experiences.length > 0) {
        portfolio.experiences.forEach((exp, index) => {
            console.log(`\nExperience ${index + 1}: ${exp.company}`);
            console.log("Summary:", exp.summary);
            console.log("Description:", JSON.stringify(exp.description, null, 2));
        });
    } else {
        console.log("No experiences found");
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
