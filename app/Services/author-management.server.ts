import { prisma } from '~/utils/prisma.server';
import { hashPassword, generateSecurePassword } from '~/utils/password.server';

/**
 * Get all authors
 */
export async function getAllAuthors() {
  return prisma.author.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Get author by ID
 */
export async function getAuthorById(id: string) {
  return prisma.author.findUnique({
    where: { id }
  });
}

/**
 * Get author by username
 */
export async function getAuthorByUsername(username: string) {
  return prisma.author.findUnique({
    where: { username }
  });
}

/**
 * Get author by authorId
 */
export async function getAuthorByAuthorId(authorId: string) {
  return prisma.author.findUnique({
    where: { authorId }
  });
}

/**
 * Create new author
 */
export async function createAuthor(data: {
  username: string;
  email?: string;
  authorName: string;
  role?: 'author' | 'superadmin';
  password?: string;
}) {
  const password = data.password || generateSecurePassword();
  const hashedPassword = await hashPassword(password);
  
  // Generate unique authorId
  const authorId = `author_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const author = await prisma.author.create({
    data: {
      authorId,
      username: data.username,
      email: data.email,
      authorName: data.authorName,
      password: hashedPassword,
      role: data.role || 'author',
      mustChangePassword: true
    }
  });
  
  return { author, temporaryPassword: password };
}

/**
 * Update author
 */
export async function updateAuthor(id: string, data: {
  authorName?: string;
  email?: string;
  authorProfession?: string;
  description?: string;
  avatar?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  website?: string;
  role?: 'author' | 'superadmin';
}) {
  return prisma.author.update({
    where: { id },
    data
  });
}

/**
 * Update author password
 */
export async function updateAuthorPassword(id: string, newPassword: string, mustChange: boolean = false) {
  const hashedPassword = await hashPassword(newPassword);
  
  return prisma.author.update({
    where: { id },
    data: {
      password: hashedPassword,
      mustChangePassword: mustChange
    }
  });
}

/**
 * Reset author password (admin action)
 */
export async function resetAuthorPassword(id: string) {
  const newPassword = generateSecurePassword();
  await updateAuthorPassword(id, newPassword, true);
  
  return newPassword;
}

/**
 * Delete author
 */
export async function deleteAuthor(id: string) {
  return prisma.author.delete({
    where: { id }
  });
}

/**
 * Get author statistics
 */
export async function getAuthorStats(userId: string) {
  const [totalPosts, publishedPosts, draftPosts] = await Promise.all([
    prisma.post.count({ where: { authorId: userId } }),
    prisma.post.count({ where: { authorId: userId, status: 'published' } }),
    prisma.post.count({ where: { authorId: userId, status: 'draft' } })
  ]);
  
  return {
    totalPosts,
    publishedPosts,
    draftPosts
  };
}
