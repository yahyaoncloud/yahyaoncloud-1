
import { PrismaClient } from '@prisma/client';
import { getPostBySlug } from '~/Services/post.prisma.server';

const prisma = new PrismaClient();

async function debugPostFetch() {
  console.log('🔍 Debugging Post Fetch...');

  // 1. List all posts (id, slug, title)
  const allPosts = await prisma.post.findMany({
    select: { id: true, slug: true, title: true, status: true }
  });
  
  console.log(`\n📄 Found ${allPosts.length} posts in DB:`);
  console.table(allPosts);

  if (allPosts.length === 0) {
    console.log('❌ No posts found. Database is empty.');
    return;
  }

  // 2. Try to fetch the specific seeded slug
  const targetSlug = 'welcome-to-yahyaoncloud';
  console.log(`\nTesting getPostBySlug('${targetSlug}')...`);
  
  try {
    const post = await getPostBySlug(targetSlug);
    if (post) {
      console.log('✅ Successfully fetched post by slug!');
      console.log({ id: post.id, title: post.title });
    } else {
      console.log('❌ getPostBySlug returned null for existing slug.');
    }
  } catch (error) {
    console.error('❌ Error calling getPostBySlug:', error);
  }
}

debugPostFetch()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());
