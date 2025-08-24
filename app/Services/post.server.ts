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
  Draft,
  IDraftDoc
} from "../models";
import { Types } from "mongoose";
import { uploadImage } from "../utils/cloudinary.server";

// ==================== POST OPERATIONS ====================

export async function createPost(
  postData: Partial<IPostDoc>,
  files?: { coverImage?: File; gallery?: File[] }
) {
  const slug = postData.slug || postData.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  // Upload cover image
  let coverImageUrl: string = "/default-cover.jpg";
  if (files?.coverImage) {
    const uploaded = await uploadImage(files.coverImage, `${slug}-cover-image.${files.coverImage.name.split(".").pop()}`);
    coverImageUrl = uploaded.url; // must be a string
  }

  // Upload gallery images
  const galleryUrls: string[] = [];
  if (files?.gallery?.length) {
    for (let i = 0; i < files.gallery.length; i++) {
      const img = files.gallery[i];
      const uploaded = await uploadImage(img, `${slug}-gallery-${i + 1}.${img.name.split(".").pop()}`);
      galleryUrls.push(uploaded.url);
    }
  }

  return Post.create({
    ...postData,
    slug,
    coverImage: coverImageUrl,
    gallery: galleryUrls,
    author: new Types.ObjectId(postData.authorId), // this must exist
    authorId: postData.authorId, // add this line if schema still expects it
  });
}


export async function getPostById(id: string) {
  return (
    Post.findById(id)
      .populate("author")
      .populate("categories")
      .populate("tags")
      .populate("types")
      .populate("coverImage")
      .populate("gallery")
  );
}

export async function getPostBySlug(slug: string) {
  return Post.findOne({ slug })
    .populate("author")
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


export async function updatePost(
  id: string,
  updateData: Partial<IPostDoc>,
  files?: { coverImage?: File; gallery?: File[] }
) {
  const post = await Post.findById(id);
  if (!post) throw new Error("Post not found");

  const slug = updateData.slug || post.slug;

  // Upload new cover image if provided
  if (files?.coverImage) {
    const uploadedCover = await uploadImage(
      files.coverImage,
      `${slug}-cover-image.${files.coverImage.name.split(".").pop()}`
    );
    updateData.coverImage = uploadedCover;
  }

  // Upload gallery images if provided
  if (files?.gallery && files.gallery.length > 0) {
    const galleryUrls = [];
    for (let i = 0; i < files.gallery.length; i++) {
      const img = files.gallery[i];
      const uploaded = await uploadImage(
        img,
        `${slug}-gallery-${i + 1}.${img.name.split(".").pop()}`
      );
      galleryUrls.push(uploaded);
    }
    updateData.gallery = galleryUrls;
  }

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


// ==================== DRAFT OPERATIONS ====================

// Create a new draft
export async function saveDraft(draftData: Partial<IDraftDoc>) {
  const slug = draftData.title
    ? draftData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    : "untitled-draft";

  // Set expiration date (30 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const draft = {
    ...draftData,
    slug,
    updatedAt: new Date(),
    expiresAt,
    createdAt: draftData.createdAt || new Date(),
  };

  // Check if draft already exists for this author/session
  const existingDraft = await Draft.findOne({
    $or: [
      { authorId: draftData.authorId },
      { sessionId: draftData.sessionId }
    ]
  });

  if (existingDraft) {
    return Draft.findByIdAndUpdate(existingDraft._id, draft, { new: true });
  } else {
    return Draft.create(draft);
  }
}

// Get draft by author ID
export async function getDraftByAuthorId(authorId: string) {
  return Draft.findOne({ authorId }).sort({ updatedAt: -1 });
}

// Get draft by session ID (for anonymous users)
export async function getDraftBySessionId(sessionId: string) {
  return Draft.findOne({ sessionId }).sort({ updatedAt: -1 });
}

// Delete a draft
export async function deleteDraft(id: string) {
  return Draft.findByIdAndDelete(id);
}

// Delete expired drafts (utility function)
export async function cleanupExpiredDrafts() {
  return Draft.deleteMany({
    expiresAt: { $lt: new Date() }
  });
}

// Convert draft to post
export async function convertDraftToPost(
  draftId: string,
  additionalPostData?: Partial<IPostDoc>,
  files?: { coverImage?: File; gallery?: File[] }
) {
  const draft = await Draft.findById(draftId);
  if (!draft) throw new Error("Draft not found");

  // Create post from draft data
  const postData: Partial<IPostDoc> = {
    title: draft.title,
    summary: draft.summary,
    content: draft.content,
    categories: draft.categories?.map(id => ({ _id: id })),
    tags: draft.tags,
    types: draft.types,
    authorId: draft.authorId,
    seo: {
      title: draft.seoTitle || draft.title,
      description: draft.seoDescription || draft.summary || "",
      keywords: draft.seoKeywords || [],
      canonicalUrl: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    status: "draft",
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...additionalPostData
  };

  const post = await createPost(postData, files);

  // Delete the draft after successful conversion
  await deleteDraft(draftId);

  return post;
}

// Auto-save draft function (debounced)
const draftSaveTimeouts = new Map<string, NodeJS.Timeout>();

export async function autoSaveDraft(
  authorId: string,
  draftData: Partial<IDraftDoc>,
  sessionId?: string,
  debounceMs: number = 2000
) {
  const key = authorId || sessionId || 'anonymous';

  // Clear existing timeout
  if (draftSaveTimeouts.has(key)) {
    clearTimeout(draftSaveTimeouts.get(key)!);
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(async () => {
      try {
        const result = await saveDraft({
          ...draftData,
          authorId,
          sessionId,
        });
        draftSaveTimeouts.delete(key);
        resolve(result);
      } catch (error) {
        draftSaveTimeouts.delete(key);
        reject(error);
      }
    }, debounceMs);

    draftSaveTimeouts.set(key, timeout);
  });
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
