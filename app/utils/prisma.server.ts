import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Prevent multiple instances in development (hot reload)
export const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['error', 'warn'] 
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Helper to ensure connection
export async function ensurePrismaConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to MongoDB via Prisma');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    return false;
  }
}

// Disconnect on app shutdown
export async function disconnectPrisma() {
  await prisma.$disconnect();
}
