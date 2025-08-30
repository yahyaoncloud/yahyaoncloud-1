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
  IDraftDoc,
} from "../models";
import { Types } from "mongoose";
import {
  uploadPostResources,
  updatePostResources,
  deletePostResources,
  parseMarkdownWithCloudinary,
  uploadImage,
} from "../utils/cloudinary.server";
// ==================== POST OPERATIONS ====================

export async function createPost(
  postData: Partial<IPostDoc>,
  files?: { markdownFile?: File; coverImage?: File; gallery?: File[] }
) {
  const slug =
    postData.slug ||
    postData.title
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") ||
    "untitled-post";

  let coverImageUrl = "/default-cover.jpg";
  let galleryUrls: string[] = [];
  let content = postData.content || "";

  // Handle Markdown-based post creation
  if (files?.markdownFile && files.markdownFile.size > 0) {
    const { contentUrl, coverImageUrl: uploadedCover, galleryUrls: uploadedGallery, parsedMarkdown } =
      await uploadPostResources(slug, files.markdownFile, files.coverImage, files.gallery);

    content = contentUrl;
    coverImageUrl = uploadedCover;
    galleryUrls = uploadedGallery;

    // Merge parsed Markdown frontmatter with postData
    postData.title = postData.title || parsedMarkdown.frontmatter.title || "Untitled Post";
    postData.categories = postData.categories || parsedMarkdown.frontmatter.categories || [];
    postData.tags = postData.tags || parsedMarkdown.frontmatter.tags || [];
    postData.status = postData.status || parsedMarkdown.frontmatter.status || "draft";
  } else {
    // Manual post creation: Upload cover and gallery images
    if (files?.coverImage) {
      const uploaded = await uploadImage(
        files.coverImage,
        `posts/${slug}/${slug}-cover-image`
      );
      coverImageUrl = uploaded.url;
    }

    if (files?.gallery?.length) {
      for (let i = 0; i < files.gallery.length; i++) {
        const img = files.gallery[i];
        const uploaded = await uploadImage(
          img,
          `posts/${slug}/gallery/${slug}-gallery-${i + 1}`
        );
        galleryUrls.push(uploaded.url);
      }
    }
  }

  return Post.create({
    ...postData,
    slug,
    coverImage: coverImageUrl,
    gallery: galleryUrls,
    content,
    author: new Types.ObjectId(postData.authorId), // Must exist
    authorId: postData.authorId, // For backward compatibility
    createdAt: postData.createdAt || new Date(),
    updatedAt: new Date(),
  });
}

export async function createPostFromMarkdown(
  slug: string,
  markdownFile: File,
  coverImage?: File,
  galleryImages: File[] = [],
  additionalPostData?: Partial<IPostDoc>
) {
  const { contentUrl, coverImageUrl, galleryUrls, parsedMarkdown } = await uploadPostResources(
    slug,
    markdownFile,
    coverImage,
    galleryImages
  );

  return Post.create({
    slug,
    title: parsedMarkdown.frontmatter.title || additionalPostData?.title || "Untitled Post",
    content: contentUrl,
    coverImage: coverImageUrl,
    gallery: galleryUrls,
    categories: parsedMarkdown.frontmatter.categories || additionalPostData?.categories || [],
    tags: parsedMarkdown.frontmatter.tags || additionalPostData?.tags || [],
    status: parsedMarkdown.frontmatter.status || additionalPostData?.status || "draft",
    author: new Types.ObjectId(additionalPostData?.authorId),
    authorId: additionalPostData?.authorId,
    createdAt: additionalPostData?.createdAt || new Date(),
    updatedAt: new Date(),
    ...additionalPostData,
  });
}

export async function getPostById(id: string) {
  return Post.findById(id)
    .populate("categories")
    .populate("tags")
    .populate("types").lean();
}

export async function getPostBySlug(slug: string) {
  return Post.findOne({ slug })
    .populate("categories")
    .populate("tags")
    .populate("types").lean();
}

export async function getPosts(
  status: "draft" | "published" = "published",
  limit: number = 10,
  page: number = 1,
  options?: { populate?: string }
) {
  const query = Post.find(status === "published" ? {} : { status })
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select("_id title slug content summary coverImage gallery createdAt categories");
  if (options?.populate) {
    query.populate(options.populate);
  }
  return query.populate("categories").lean();
}

export async function updatePost(
  id: string,
  updateData: Partial<IPostDoc>,
  files?: { markdownFile?: File; coverImage?: File; gallery?: File[]; deleteGalleryImages?: string[] }
) {
  const post = await Post.findById(id);
  if (!post) throw new Error("Post not found");

  const slug = updateData.slug || post.slug;

  // Handle updates with Cloudinary
  if (files?.markdownFile || files?.coverImage || files?.gallery || files?.deleteGalleryImages) {
    const { contentUrl, coverImageUrl, galleryUrls } = await updatePostResources(
      slug,
      files?.markdownFile,
      files?.coverImage,
      files?.gallery,
      files?.deleteGalleryImages
    );

    if (contentUrl) updateData.content = contentUrl;
    if (coverImageUrl) updateData.coverImage = coverImageUrl;
    if (galleryUrls) updateData.gallery = galleryUrls;
  }

  return Post.findByIdAndUpdate(id, updateData, { new: true })
    .populate("categories")
    .populate("tags")
    .populate("types");
}

export async function deletePost(id: string) {
  const post = await Post.findById(id);
  if (!post) throw new Error("Post not found");

  // Delete Cloudinary resources
  await deletePostResources(post.slug);

  return Post.findByIdAndDelete(id);
}

export async function incrementPostViews(id: string) {
  return Post.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
}

export async function getTopPosts(limit: number = 3) {
  const posts = await Post.find({ status: "published" })
    .populate("categories")
    .populate("tags")
    .lean();

  if (!posts || posts.length === 0) return [];

  const allMetricsZero = posts.every(
    (p) =>
      (p.views || 0) === 0 &&
      (p.likes || 0) === 0 &&
      (p.commentsCount || 0) === 0
  );

  let sortedPosts;

  if (!allMetricsZero) {
    sortedPosts = posts.sort((a, b) => {
      const scoreA = (a.views || 0) + (a.likes || 0) + (a.commentsCount || 0);
      const scoreB = (b.views || 0) + (b.likes || 0) + (b.commentsCount || 0);
      return scoreB - scoreA;
    });
  } else {
    sortedPosts = posts.sort((a, b) => {
      const avgA = ((a.categories?.length || 0) + (a.tags?.length || 0)) / 2;
      const avgB = ((b.categories?.length || 0) + (b.tags?.length || 0)) / 2;
      return avgB - avgA;
    });
  }

  return sortedPosts.slice(0, limit);
}

// ==================== DRAFT OPERATIONS ====================

export async function saveDraft(draftData: Partial<IDraftDoc>) {
  const slug = draftData.title
    ? draftData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    : "untitled-draft";

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const draft = {
    ...draftData,
    slug,
    updatedAt: new Date(),
    expiresAt,
    createdAt: draftData.createdAt || new Date(),
  };

  const existingDraft = await Draft.findOne({
    $or: [{ authorId: draftData.authorId }, { sessionId: draftData.sessionId }],
  });

  if (existingDraft) {
    return Draft.findByIdAndUpdate(existingDraft._id, draft, { new: true });
  } else {
    return Draft.create(draft);
  }
}

export async function getDraftByAuthorId(authorId: string) {
  return Draft.findOne({ authorId }).sort({ updatedAt: -1 });
}

export async function getDraftBySessionId(sessionId: string) {
  return Draft.findOne({ sessionId }).sort({ updatedAt: -1 });
}

export async function deleteDraft(id: string) {
  return Draft.findByIdAndDelete(id);
}

export async function cleanupExpiredDrafts() {
  return Draft.deleteMany({
    expiresAt: { $lt: new Date() },
  });
}

export async function convertDraftToPost(
  draftId: string,
  additionalPostData?: Partial<IPostDoc>,
  files?: { markdownFile?: File; coverImage?: File; gallery?: File[] }
) {
  const draft = await Draft.findById(draftId);
  if (!draft) throw new Error("Draft not found");

  const postData: Partial<IPostDoc> = {
    title: draft.title,
    summary: draft.summary,
    content: draft.content,
    categories: draft.categories?.map((id) => ({ _id: id })),
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
    ...additionalPostData,
  };

  const post = await createPost(postData, files);

  await deleteDraft(draftId);

  return post;
}

const draftSaveTimeouts = new Map<string, NodeJS.Timeout>();

export async function autoSaveDraft(
  authorId: string,
  draftData: Partial<IDraftDoc>,
  sessionId?: string,
  debounceMs: number = 2000
) {
  const key = authorId || sessionId || "anonymous";

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
  return (
    Post.find({
      categories: new Types.ObjectId(categoryId),
      status: "published",
    })
      .sort({ date: -1 })
      // .populate("author")
      .populate("coverImage")
  );
}

export async function getPostsByTag(tagId: string) {
  return (
    Post.find({
      tags: new Types.ObjectId(tagId),
      status: "published",
    })
      .sort({ date: -1 })
      // .populate("author")
      .populate("coverImage")
  );
}

export async function getPostsByType(typeId: string) {
  return (
    Post.find({
      types: new Types.ObjectId(typeId),
      status: "published",
    })
      .sort({ date: -1 })
      // .populate("author")
      .populate("coverImage")
  );
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

export async function getAllAuthors() {
  try {
    const authors = await Author.find().sort({ createdAt: -1 });
    return authors.map((author) => ({
      _id: author._id.toString(),
      authorId: author.authorId,
      authorName: author.authorName,
      authorProfession: author.authorProfession,
      userId: author.userId.toString(),
      contactDetails: author.contactDetails,
      createdAt: author.createdAt,
      updatedAt: author.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching all authors:", error);
    return [];
  }
}

export async function getAuthorByAuthorId(id: string) {
  try {
    if (!id) return null;
    let query: any = { authorId: id };
    if (Types.ObjectId.isValid(id)) {
      // If it's a valid ObjectId, also try by _id
      query = { $or: [{ authorId: id }, { _id: new Types.ObjectId(id) }] };
    }
    const author = await Author.findOne(query).lean();
    if (!author) {
      return null;
    }
    return {
      _id: author._id.toString(),
      authorId: author.authorId,
      authorName: author.authorName,
      authorProfession: author.authorProfession,
      userId: author.userId.toString(),
      contactDetails: author.contactDetails,
      createdAt: author.createdAt,
      updatedAt: author.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching author:", error);
    return null;
  }
}

export async function createAuthor(data: {
  authorId: string;
  authorName: string;
  authorProfession: string;
  userId: string;
  contactDetails: {
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    twitter: string;
    website: string;
  };
}) {
  try {
    const author = await Author.create({
      ...data,
      contactDetails: {
        ...data.contactDetails,
        createdAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return {
      _id: author._id.toString(),
      authorId: author.authorId,
      authorName: author.authorName,
      authorProfession: author.authorProfession,
      userId: author.userId.toString(),
      contactDetails: author.contactDetails,
      createdAt: author.createdAt,
      updatedAt: author.updatedAt,
    };
  } catch (error) {
    console.error("Error creating author:", error);
    throw new Error("Failed to create author");
  }
}

export async function updateAuthor(
  id: string,
  data: {
    authorId?: string;
    authorName?: string;
    authorProfession?: string;
    userId?: string;
    contactDetails?: Partial<{
      email: string;
      phone: string;
      linkedin: string;
      github: string;
      twitter: string;
      website: string;
    }>;
  }
) {
  try {
    const author = await Author.findById(id);
    if (!author) {
      throw new Error("Author not found");
    }
    const updatedData = {
      ...data,
      contactDetails: {
        ...author.contactDetails,
        ...data.contactDetails,
        updatedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };
    const updatedAuthor = await Author.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    if (!updatedAuthor) {
      throw new Error("Failed to update author");
    }
    return {
      _id: updatedAuthor._id.toString(),
      authorId: updatedAuthor.authorId,
      authorName: updatedAuthor.authorName,
      authorProfession: updatedAuthor.authorProfession,
      userId: updatedAuthor.userId.toString(),
      contactDetails: updatedAuthor.contactDetails,
      createdAt: updatedAuthor.createdAt,
      updatedAt: updatedAuthor.updatedAt,
    };
  } catch (error) {
    console.error("Error updating author:", error);
    throw new Error("Failed to update author");
  }
}

export async function deleteAuthor(id: string) {
  try {
    const author = await Author.findByIdAndDelete(id);
    if (!author) {
      throw new Error("Author not found");
    }
    return { success: true, message: "Author deleted" };
  } catch (error) {
    console.error("Error deleting author:", error);
    throw new Error("Failed to delete author");
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
