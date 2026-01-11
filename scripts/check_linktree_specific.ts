import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const linktree = await prisma.linktree.findFirst({
    where: { isActive: true }
  });
  if (linktree) {
      console.log("resumeUrl:", linktree.resumeUrl);
      console.log("linkedinUrl:", linktree.linkedinUrl);
      console.log("instagramUrl:", linktree.instagramUrl);
      console.log("twitterUrl:", linktree.twitterUrl);
      console.log("githubUrl:", linktree.githubUrl);
      console.log("emailUrl:", linktree.emailUrl);
  } else {
      console.log("No active linktree found");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
