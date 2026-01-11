import { prisma } from '~/utils/prisma.server';

// Generate unique catID
function generateCatId(): string {
  return `cat_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// CREATE
export async function createCategory(name: string, slug?: string) {
  const categorySlug = slug || generateSlug(name);
  
  // Check for existing
  const existing = await prisma.category.findFirst({
    where: { OR: [{ name }, { slug: categorySlug }] }
  });
  
  if (existing) {
    throw new Error('Category with this name or slug already exists');
  }
  
  return prisma.category.create({
    data: {
      catID: generateCatId(),
      name,
      slug: categorySlug
    }
  });
}

// READ ALL
export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' }
  });
}

// READ BY ID
export async function getCategoryById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

// READ BY SLUG
export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

// UPDATE
export async function updateCategory(id: string, data: { name?: string; slug?: string }) {
  if (data.slug) {
    const existing = await prisma.category.findFirst({
      where: { slug: data.slug, NOT: { id } }
    });
    if (existing) {
      throw new Error('Category with this slug already exists');
    }
  }
  
  return prisma.category.update({
    where: { id },
    data
  });
}

// DELETE
export async function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}

// GET CATEGORIES WITH POST COUNT
export async function getCategoriesWithCount() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });
  
  // Get post counts
  const counts = await Promise.all(
    categories.map(async (cat) => {
      const count = await prisma.post.count({
        where: { categoryIds: { has: cat.id } }
      });
      return { ...cat, postCount: count };
    })
  );
  
  return counts;
}
