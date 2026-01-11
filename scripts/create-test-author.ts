import { prisma } from '../app/utils/prisma.server';
import { hashPassword } from '../app/utils/password.server';

async function createTestAuthor() {
  try {
    // Check if test author already exists
    const existing = await prisma.author.findUnique({
      where: { username: 'testauthor' }
    });

    if (existing) {
      console.log('✅ Test author already exists');
      console.log('Username: testauthor');
      console.log('Password: Test@1234');
      return;
    }

    // Create test author
    const password = await hashPassword('Test@1234');
    const authorId = `author_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const author = await prisma.author.create({
      data: {
        authorId,
        username: 'testauthor',
        password,
        email: 'test@example.com',
        authorName: 'Test Author',
        role: 'author',
        mustChangePassword: false // Set to false for testing
      }
    });

    console.log('✅ Test author created successfully!');
    console.log('Username: testauthor');
    console.log('Password: Test@1234');
    console.log('Author ID:', author.id);
    console.log('\nYou can now login at: http://localhost:5173/authors/login');
  } catch (error) {
    console.error('❌ Error creating test author:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAuthor();
