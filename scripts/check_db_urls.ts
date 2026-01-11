
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUrls() {
  const linktrees = await prisma.linktree.findMany();
  console.log('--- Linktree QR URLs ---');
  linktrees.forEach(lt => {
    console.log(`ID: ${lt.id}, ShortCode: ${lt.shortCode}`);
    console.log(`URL: ${lt.qrCodeUrl}`);
  });
  
  const resumes = await prisma.resume.findMany();
  console.log('\n--- Resume URLs ---');
  resumes.forEach(r => {
    console.log(`ID: ${r.id}, Title: ${r.title}`);
    console.log(`PDF: ${r.pdfUrl}`);
    console.log(`QR: ${r.qrCodeUrl}`);
  });
}

checkUrls()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
