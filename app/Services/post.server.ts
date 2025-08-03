import {
  Post,
  Category,
  Portfolio,
  Tag,
  Type,
  IPostDoc,
  ICategoryDoc,
  IPortfolioDoc,
  ITagDoc,
  ITypeDoc,
  Author,
} from "../models";
import { Types } from "mongoose";

// ==================== POST OPERATIONS ====================

export async function createPost(postData: Partial<IPostDoc>) {
  return Post.create(postData);
}

export async function getPostById(id: string) {
  return (
    Post.findById(id)
      // .populate("authorId") // Changed from authorId to author
      .populate("categories")
      .populate("tags")
      .populate("types")
      .populate("coverImage")
      .populate("gallery")
  );
}

export async function getPostBySlug(slug: string) {
  return Post.findOne({ slug })
    .populate("authorId")
    .populate("categories")
    .populate("tags")
    .populate("types")
    .populate("coverImage")
    .populate("gallery");
}

export async function getPosts(
  status: "draft" | "published" = "published",
  limit: number = 10,
  page: number = 1,
  options?: { populate?: string }
) {
  const query = Post.find({ status })
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  if (options?.populate) {
    query.populate(options.populate);
  }
  return query.populate("author").populate("categories").populate("coverImage");
}

export async function updatePost(id: string, updateData: Partial<IPostDoc>) {
  return Post.findByIdAndUpdate(id, updateData, { new: true })
    .populate("categories")
    .populate("tags")
    .populate("types");
}

export async function deletePost(id: string) {
  return Post.findByIdAndDelete(id);
}

export async function incrementPostViews(id: string) {
  return Post.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
}

export async function getTopPosts(limit: number = 3) {
  // Fetch all published posts
  const posts = await Post.find({ status: "published" })
    .populate("categories")
    .populate("tags")
    .populate("coverImage")
    .lean();

  if (!posts || posts.length === 0) return [];

  // Check if all metrics are zero
  const allMetricsZero = posts.every(
    (p) =>
      (p.views || 0) === 0 &&
      (p.likes || 0) === 0 &&
      (p.commentsCount || 0) === 0
  );

  let sortedPosts;

  if (!allMetricsZero) {
    // Sort by combined score: views + likes + commentsCount
    sortedPosts = posts.sort((a, b) => {
      const scoreA = (a.views || 0) + (a.likes || 0) + (a.commentsCount || 0);
      const scoreB = (b.views || 0) + (b.likes || 0) + (b.commentsCount || 0);
      return scoreB - scoreA;
    });
  } else {
    // Fallback: sort by average of categories.length and tags.length
    sortedPosts = posts.sort((a, b) => {
      const avgA = ((a.categories?.length || 0) + (a.tags?.length || 0)) / 2;
      const avgB = ((b.categories?.length || 0) + (b.tags?.length || 0)) / 2;
      return avgB - avgA;
    });
  }

  return sortedPosts.slice(0, limit);
}

// ==================== CATEGORY OPERATIONS ====================

export async function createCategory(categoryData: Partial<ICategoryDoc>) {
  return Category.create(categoryData);
}

export async function getAllCategories() {
  return Category.find().sort({ name: 1 });
}

export async function getCategoryById(id: string) {
  return Category.findById(id);
}

export async function getCategoryBySlug(slug: string) {
  return Category.findOne({ slug });
}

export async function updateCategory(
  id: string,
  updateData: Partial<ICategoryDoc>
) {
  return Category.findByIdAndUpdate(id, updateData, { new: true });
}

export async function deleteCategory(id: string) {
  await Post.updateMany({ categories: id }, { $pull: { categories: id } });
  return Category.findByIdAndDelete(id);
}

// ==================== TAG OPERATIONS ====================

export async function createTag(tagData: Partial<ITagDoc>) {
  return Tag.create(tagData);
}

export async function getAllTags() {
  return Tag.find().sort({ name: 1 });
}

export async function getTagById(id: string) {
  return Tag.findById(id);
}

export async function updateTag(id: string, updateData: Partial<ITagDoc>) {
  return Tag.findByIdAndUpdate(id, updateData, { new: true });
}

export async function deleteTag(id: string) {
  await Post.updateMany({ tags: id }, { $pull: { tags: id } });
  return Tag.findByIdAndDelete(id);
}
// ===================== PORTFOLIO OPERATIONS ======================
export async function createPortfolio(portfolioData: Partial<IPortfolioDoc>) {
  return Portfolio.create(portfolioData);
}

export async function getPortfolioById(id: string) {
  return Portfolio.findById(id);
}

export async function getPortfolioByName(name: string) {
  return Portfolio.findOne({ name });
}

export async function getAllPortfolios(limit: number = 10, page: number = 1) {
  return Portfolio.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
}

export async function updatePortfolio(
  id: string,
  updateData: Partial<IPortfolioDoc>
) {
  return Portfolio.findByIdAndUpdate(id, updateData, { new: true });
}

export async function deletePortfolio(id: string) {
  return Portfolio.findByIdAndDelete(id);
}

// ==================== TYPE OPERATIONS ====================

export async function createType(typeData: Partial<ITypeDoc>) {
  return Type.create(typeData);
}

export async function getAllTypes() {
  return Type.find().sort({ name: 1 });
}

export async function getTypeById(id: string) {
  return Type.findById(id);
}

export async function updateType(id: string, updateData: Partial<ITypeDoc>) {
  return Type.findByIdAndUpdate(id, updateData, { new: true });
}

export async function deleteType(id: string) {
  await Post.updateMany({ types: id }, { $pull: { types: id } });
  return Type.findByIdAndDelete(id);
}

// ==================== RELATIONSHIP OPERATIONS ====================

export async function getPostsByCategory(categoryId: string) {
  return Post.find({
    categories: new Types.ObjectId(categoryId),
    status: "published",
  })
    .sort({ date: -1 })
    .populate("author") // Changed from authorId to author
    .populate("coverImage");
}

export async function getPostsByTag(tagId: string) {
  return Post.find({
    tags: new Types.ObjectId(tagId),
    status: "published",
  })
    .sort({ date: -1 })
    .populate("author") // Changed from authorId to author
    .populate("coverImage");
}

export async function getPostsByType(typeId: string) {
  return Post.find({
    types: new Types.ObjectId(typeId),
    status: "published",
  })
    .sort({ date: -1 })
    .populate("author") // Changed from authorId to author
    .populate("coverImage");
}

export async function getRelatedPosts(postId: string, limit: number = 3) {
  const post = await Post.findById(postId);
  if (!post) return [];

  return Post.find({
    _id: { $ne: post._id },
    $or: [
      { categories: { $in: post.categories } },
      { tags: { $in: post.tags } },
    ],
    status: "published",
  })
    .limit(limit)
    .populate("coverImage");
}

// ==================== AUTHOR OPERATIONS ====================

export async function getAuthorByAuthorId(authorId: string) {
  try {
    const author = await Author.findOne({ authorId });
    if (!author) {
      return null;
    }
    return {
      _id: author._id.toString(),
      authorId: author.authorId,
      authorName: author.authorName,
      authorProfession: author.authorProfession,
      userId: author.userId.toString(),
      contactDetails: author.contactDetails, // Now embedded, no population needed
      createdAt: author.createdAt,
      updatedAt: author.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching author:", error);
    return null;
  }
}

// ==================== STATISTICS ====================

export async function getPostCountByStatus() {
  return Post.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
}

export async function getMostViewedPosts(limit: number = 5) {
  return Post.find({ status: "published" })
    .sort({ views: -1 })
    .limit(limit)
    .populate("coverImage");
}

export async function getMostLikedPosts(limit: number = 5) {
  return Post.find({ status: "published" })
    .sort({ likes: -1 })
    .limit(limit)
    .populate("coverImage");
}
