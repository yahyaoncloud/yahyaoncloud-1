import { prisma } from '~/utils/prisma.server';

// CREATE
export async function createAuthor(data: {
  authorName: string;
  authorProfession?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  website?: string;
  buyCoffee?: string;
  description?: string;
  avatar?: string;
  isAdmin?: boolean;
}) {
  const authorId = `author_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  
  return prisma.author.create({
    data: {
      authorId,
      ...data
    }
  });
}

// READ ALL
export async function getAuthors() {
  return prisma.author.findMany({
    orderBy: { authorName: 'asc' }
  });
}

// READ BY ID
export async function getAuthorById(id: string) {
  return prisma.author.findUnique({ where: { id } });
}

// READ BY AUTHOR ID
export async function getAuthorByAuthorId(authorId: string) {
  return prisma.author.findUnique({ where: { authorId } });
}

// UPDATE
export async function updateAuthor(id: string, data: {
  authorName?: string;
  authorProfession?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  website?: string;
  buyCoffee?: string;
  description?: string;
  avatar?: string;
  isAdmin?: boolean;
}) {
  return prisma.author.update({
    where: { id },
    data
  });
}

// DELETE
export async function deleteAuthor(id: string) {
  return prisma.author.delete({ where: { id } });
}

// GET DEFAULT AUTHOR
export async function getDefaultAuthor() {
  const authors = await prisma.author.findMany({ take: 1 });
  return authors[0] || null;
}
