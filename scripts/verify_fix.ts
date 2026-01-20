
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  console.log('--- Verifying Portfolio Fetch ---');
  try {
    const portfolios = await prisma.portfolio.findMany();
    console.log(`Successfully fetched ${portfolios.length} portfolios.`);
    portfolios.forEach(p => {
        console.log(`- ${p.name} (Created: ${p.createdAt}, Updated: ${p.updatedAt})`);
    });
  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
