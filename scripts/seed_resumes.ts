
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function seedResumes() {
  const resumesDir = path.resolve(process.cwd(), 'Resumes', 'PDF');
  
  const filesToSeed = [
    { 
      filename: 'Yahya_CloudEngineer_Dubai_2025.html', 
      title: 'Cloud Engineer',
      isActive: true
    },
    { 
      filename: 'Yahya_NetworkEngineer_Dubai_2025.html', 
      title: 'Network Engineer',
      isActive: true 
    },
    {
      filename: 'Yahya_CloudNetworkEngineer_Dubai_2025.html',
      title: 'Cloud & Network Engineer',
      isActive: false
    }
  ];

  console.log('--- Seeding Resumes ---');

  for (const item of filesToSeed) {
    const filePath = path.join(resumesDir, item.filename);
    
    try {
      const htmlContent = await fs.readFile(filePath, 'utf-8');
      
      console.log(`Processing: ${item.title} (${item.filename})`);

      // Check if resume with this title exists
      const existing = await prisma.resume.findFirst({
        where: { title: item.title }
      });

      if (existing) {
        console.log(`  - Found existing. Updating content...`);
        await prisma.resume.update({
          where: { id: existing.id },
          data: {
            htmlContent,
            isActive: item.isActive, // Update active status? Maybe safer to leave user preference normally, but for seed we enforce
            updatedAt: new Date()
          }
        });
      } else {
        console.log(`  - Creating new record...`);
        await prisma.resume.create({
          data: {
            title: item.title,
            htmlContent,
            isActive: item.isActive,
            version: 1,
            metadata: { sourceFile: item.filename }
          }
        });
      }
    } catch (err) {
      if ((err as any).code === 'ENOENT') {
        console.warn(`  - ⚠️ File not found: ${item.filename}`);
      } else {
        console.error(`  - ❌ Error:`, err);
      }
    }
  }

  console.log('--- Finished Seeding ---');
}

seedResumes()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
