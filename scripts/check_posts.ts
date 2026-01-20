
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPosts() {
  try {
    const total = await prisma.post.count();
    const published = await prisma.post.count({ where: { status: 'published' } });
    const drafts = await prisma.post.count({ where: { status: 'draft' } });
    
    console.log('--- Post Counts ---');
    console.log(`Total: ${total}`);
    console.log(`Published: ${published}`);
    console.log(`Drafts: ${drafts}`);
    
    if (published === 0) {
      console.log('WARNING: No published posts found. This explains why public blog is empty.');
    }
    
    const posts = await prisma.post.findMany({ take: 3 });
    console.log('Sample Posts:', JSON.stringify(posts, null, 2));

  } catch (error) {
    console.error('Error checking posts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPosts();
