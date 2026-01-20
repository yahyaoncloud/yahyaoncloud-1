import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const linktree = await prisma.linktree.findFirst({
    where: { isActive: true }
  });
  
  const resume = await prisma.resume.findFirst({});

  if (linktree && resume) {
      console.log(`Updating Linktree ${linktree.id} with Resume ${resume.id}`);
      
      const updatedUrl = `http://localhost:5173/resume/view/${resume.id}`; // Hardcoded localhost for verification
      
      await prisma.linktree.update({
          where: { id: linktree.id },
          data: {
              resumeUrl: updatedUrl,
              twitterUrl: 'https://twitter.com/yahya', // Adding dummy twitter to verify social block appears
              linkedinUrl: 'https://linkedin.com/in/yahya'
          }
      });
      console.log("Update successful");
  } else {
      console.log("Missing data");
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
