import { prisma } from '~/utils/prisma.server';
import type { Prisma } from '@prisma/client';
import { deletePostResources } from '~/utils/cloudinary.server';

// Re-export prisma for use in routes
export { prisma };

// Types
export interface CreatePostInput {
  title: string;
  slug?: string;
  content: string;
  summary?: string;
  authorId: string;
  categoryIds?: string[];
  tagIds?: string[];
  type?: string;
  coverImage?: string;
  gallery?: string[];
  status?: string;
  pricing?: string;
  price?: number;
  accessLevel?: string;
  featured?: boolean;
}

export interface UpdatePostInput extends Partial<CreatePostInput> {
  id: string;
}

export interface GetPostsOptions {
  status?: string;
  page?: number;
  limit?: number;
  authorId?: string;
  categoryId?: string;
  tagId?: string;
  search?: string;
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 100);
}

// Calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

// CREATE - Create a new post
export async function createPost(input: CreatePostInput) {
  const slug = input.slug || generateSlug(input.title);
  
  // Check for unique slug
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) {
    throw new Error(`Post with slug "${slug}" already exists`);
  }
  
  return prisma.post.create({
    data: {
      title: input.title,
      slug,
      content: input.content,
      summary: input.summary || input.content.substring(0, 200),
      authorId: input.authorId,
      categoryIds: input.categoryIds || [],
      tagIds: input.tagIds || [],
      type: input.type || 'ARTICLE',
      coverImage: input.coverImage || '/default-cover.jpg',
      gallery: input.gallery || [],
      status: input.status || 'draft',
      pricing: input.pricing || 'free',
      price: input.price,
      accessLevel: input.accessLevel || 'public',
      featured: input.featured || false,
      minuteRead: calculateReadingTime(input.content),
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
    }
  });
}

// READ - Get all posts with filters and pagination
export async function getPosts(options: GetPostsOptions = {}) {
  const { status, page = 1, limit = 10, authorId, categoryId, tagId, search } = options;
  const skip = (page - 1) * limit;
  
  const where: Prisma.PostWhereInput = {};
  
  if (status) where.status = { equals: status, mode: 'insensitive' };
  if (authorId) where.authorId = authorId;
  if (categoryId) where.categoryIds = { has: categoryId };
  if (tagId) where.tagIds = { has: tagId };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { summary: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: 'desc' },
      include: {
        author: { select: { id: true, name: true, email: true } },
      }
    }),
    prisma.post.count({ where })
  ]);
  
  return {
    posts,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: page < Math.ceil(total / limit)
  };
}

// READ - Get single post by slug
export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    include: {
      author: true,
      comments: { 
        where: { approved: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });
}

// READ - Get post by ID
export async function getPostById(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, email: true } },
    }
  });
}

// UPDATE - Update a post
export async function updatePost(input: UpdatePostInput) {
  const { id, ...data } = input;
  
  // Recalculate reading time if content changed
  const updateData: Prisma.PostUpdateInput = { ...data };
  
  if (data.content) {
    updateData.minuteRead = calculateReadingTime(data.content);
  }
  
  if (data.slug) {
    // Check for unique slug (excluding current post)
    const existing = await prisma.post.findFirst({
      where: { slug: data.slug, NOT: { id } }
    });
    if (existing) {
      throw new Error(`Post with slug "${data.slug}" already exists`);
    }
  }
  
  return prisma.post.update({
    where: { id },
    data: updateData,
    include: {
      author: { select: { id: true, name: true, email: true } },
    }
  });
}

// DELETE - Delete a post
export async function deletePost(id: string) {
  console.log(`[deletePost] Starting deletion for post: ${id}`);
  const post = await prisma.post.findUnique({ where: { id } });
  
  if (!post) {
    console.warn(`[deletePost] Post not found: ${id}`);
    throw new Error('Post not found');
  }
  
  // Try to delete Cloudinary resources
  try {
    console.log(`[deletePost] Deleting Cloudinary resources for slug: ${post.slug}`);
    await deletePostResources(post.slug);
  } catch (error) {
    console.warn('[deletePost] Failed to delete Cloudinary resources:', error);
  }
  
  // Delete comments first (cascade)
  console.log(`[deletePost] Deleting comments for post: ${id}`);
  await prisma.comment.deleteMany({ where: { postId: id } });
  
  // Delete purchases
  console.log(`[deletePost] Deleting purchases for post: ${id}`);
  await prisma.purchase.deleteMany({ where: { postId: id } });
  
  // Delete post
  console.log(`[deletePost] Deleting post record: ${id}`);
  return prisma.post.delete({ where: { id } });
}

// PUBLISH - Publish a draft post
export async function publishPost(id: string) {
  return prisma.post.update({
    where: { id },
    data: { 
      status: 'published',
      date: new Date()
    }
  });
}

// UNPUBLISH - Set post back to draft
export async function unpublishPost(id: string) {
  return prisma.post.update({
    where: { id },
    data: { status: 'draft' }
  });
}

// ARCHIVE - Archive a post
export async function archivePost(id: string) {
  return prisma.post.update({
    where: { id },
    data: { status: 'archived' }
  });
}

// INCREMENT STATS
export async function incrementViews(id: string) {
  return prisma.post.update({
    where: { id },
    data: { views: { increment: 1 } }
  });
}

export async function incrementLikes(id: string) {
  return prisma.post.update({
    where: { id },
    data: { likes: { increment: 1 } }
  });
}

// GET STATS
export async function getPostStats() {
  const [total, published, drafts, archived] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: 'published' } }),
    prisma.post.count({ where: { status: 'draft' } }),
    prisma.post.count({ where: { status: 'archived' } }),
  ]);
  
  const totalViews = await prisma.post.aggregate({
    _sum: { views: true }
  });
  
  const totalLikes = await prisma.post.aggregate({
    _sum: { likes: true }
  });
  
  return {
    total,
    published,
    drafts,
    archived,
    totalViews: totalViews._sum.views || 0,
    totalLikes: totalLikes._sum.likes || 0
  };
}

// GET FEATURED POSTS
export async function getFeaturedPosts(limit: number = 5) {
  return prisma.post.findMany({
    where: { 
      status: 'published',
      featured: true 
    },
    orderBy: { date: 'desc' },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      coverImage: true,
      date: true,
      minuteRead: true,
      views: true,
    }
  });
}

// GET POPULAR POSTS
export async function getPopularPosts(limit: number = 10) {
  return prisma.post.findMany({
    where: { status: 'published' },
    orderBy: [
      { views: 'desc' },
      { likes: 'desc' }
    ],
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      coverImage: true,
      views: true,
      likes: true,
    }
  });
}

// ==================== CATEGORY OPERATIONS ====================
export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' }
  });
}

// ==================== TAG OPERATIONS ====================
export async function getAllTags() {
  return prisma.tag.findMany({
    orderBy: { name: 'asc' }
  });
}

// ==================== PORTFOLIO OPERATIONS ====================
// Note: Portfolio model is currently missing in schema.prisma, returning empty array to prevent crash.
// TODO: Add Portfolio model to schema.prisma
export async function getAllPortfolios() {
  try {
    const portfolios = await prisma.portfolio.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return portfolios;
  } catch (error) {
    console.error("Error fetching portfolios:", error);
    return [];
  }
}

// ==================== HOMEPAGE CARDS OPERATIONS ====================

export async function getHomepageCards() {
  try {
    return await prisma.announcement.findMany({
      where: {
        slot: 'homepage-card', // Standardized slot name for all homepage cards
      },
      orderBy: { order: 'asc' }
    });
  } catch (error) {
    console.error("Error fetching homepage cards:", error);
    return [];
  }
}

export async function updateHomepageCard(id: string, data: {
  title: string;
  description?: string;
  backgroundUrl?: string;
  linkUrl?: string;
  linkText?: string;
  isActive: boolean;
  order?: number;
}) {
  try {
    return await prisma.announcement.update({
      where: { id },
      data
    });
  } catch (error) {
    console.error("Error updating homepage card:", error);
    throw error;
  }
}

export async function createHomepageCard(data: {
  title: string;
  description?: string;
  backgroundUrl?: string;
  linkUrl?: string;
  linkText?: string;
  order: number;
}) {
  try {
    return await prisma.announcement.create({
      data: {
        ...data,
        slot: 'homepage-card',
        isActive: true
      }
    });
  } catch (error) {
    console.error("Error creating homepage card:", error);
    throw error;
  }
}

export async function deleteHomepageCard(id: string) {
  try {
    return await prisma.announcement.delete({
      where: { id }
    });
  } catch (error) {
    console.error("Error deleting homepage card:", error);
    throw error;
  }
}
