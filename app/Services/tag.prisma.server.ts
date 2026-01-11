import { prisma } from '~/utils/prisma.server';

// Generate unique tagID
function generateTagId(): string {
  return `tag_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// CREATE
export async function createTag(name: string) {
  // Check for existing
  const existing = await prisma.tag.findFirst({
    where: { name: { equals: name, mode: 'insensitive' } }
  });
  
  if (existing) {
    throw new Error('Tag with this name already exists');
  }
  
  return prisma.tag.create({
    data: {
      tagID: generateTagId(),
      name
    }
  });
}

// READ ALL
export async function getTags() {
  return prisma.tag.findMany({
    orderBy: { name: 'asc' }
  });
}

// READ BY ID
export async function getTagById(id: string) {
  return prisma.tag.findUnique({ where: { id } });
}

// READ BY NAME
export async function getTagByName(name: string) {
  return prisma.tag.findFirst({
    where: { name: { equals: name, mode: 'insensitive' } }
  });
}

// UPDATE
export async function updateTag(id: string, name: string) {
  const existing = await prisma.tag.findFirst({
    where: { name: { equals: name, mode: 'insensitive' }, NOT: { id } }
  });
  
  if (existing) {
    throw new Error('Tag with this name already exists');
  }
  
  return prisma.tag.update({
    where: { id },
    data: { name }
  });
}

// DELETE
export async function deleteTag(id: string) {
  return prisma.tag.delete({ where: { id } });
}

// GET TAGS WITH POST COUNT
export async function getTagsWithCount() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' }
  });
  
  // Get post counts
  const counts = await Promise.all(
    tags.map(async (tag) => {
      const count = await prisma.post.count({
        where: { tagIds: { has: tag.id } }
      });
      return { ...tag, postCount: count };
    })
  );
  
  return counts;
}

// CREATE OR GET TAG
export async function getOrCreateTag(name: string) {
  const existing = await getTagByName(name);
  if (existing) return existing;
  return createTag(name);
}

// BULK CREATE TAGS
export async function getOrCreateTags(names: string[]) {
  return Promise.all(names.map(name => getOrCreateTag(name.trim())));
}
