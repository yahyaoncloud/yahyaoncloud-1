// posts.api.ts
import * as PostsServer from "../Services/post.server";
import { successResponse, errorResponse } from "../utils/apiResponse";

// ==================== POST API ====================

export async function apiCreatePost(postData: any) {
    try {
        const post = await PostsServer.createPost(postData);
        return successResponse(post, "Post created successfully");
    } catch (err: any) {
        return errorResponse("Failed to create post", err.message);
    }
}

export async function apiGetPostById(id: string) {
    try {
        const post = await PostsServer.getPostById(id);
        if (!post) return errorResponse(`Post with id ${id} not found`);
        return successResponse(post, "Post fetched successfully");
    } catch (err: any) {
        return errorResponse("Failed to fetch post", err.message);
    }
}

export async function apiGetPostBySlug(slug: string) {
    try {
        const post = await PostsServer.getPostBySlug(slug);
        if (!post) return errorResponse(`Post with slug ${slug} not found`);
        return successResponse(post, "Post fetched successfully");
    } catch (err: any) {
        return errorResponse("Failed to fetch post", err.message);
    }
}

// posts.api.ts
export async function apiGetPosts(
    status: "draft" | "published" = "published",
    limit = 10,
    page = 1,
    options?: { populate?: string },
    customMessage?: string
) {
    try {
        const posts = await PostsServer.getPosts(status, limit, page, options);

        if (!posts || posts.length === 0) {
            return successResponse(
                [],
                customMessage || "Stay tuned — posts are underway",
                { isEmpty: true } // Add flag for empty state
            );
        }

        return successResponse(
            posts,
            customMessage || "Posts fetched successfully",
            { isEmpty: false }
        );
    } catch (err: any) {
        return errorResponse(
            customMessage || "Failed to fetch posts",
            err.message
        );
    }
} 
export async function apiUpdatePost(id: string, updateData: any) {
    try {
        const updated = await PostsServer.updatePost(id, updateData);
        if (!updated) return errorResponse(`Post with id ${id} not found`);
        return successResponse(updated, "Post updated successfully");
    } catch (err: any) {
        return errorResponse("Failed to update post", err.message);
    }
}

export async function apiDeletePost(id: string) {
    try {
        const deleted = await PostsServer.deletePost(id);
        if (!deleted) return errorResponse(`Post with id ${id} not found`);
        return successResponse(deleted, "Post deleted successfully");
    } catch (err: any) {
        return errorResponse("Failed to delete post", err.message);
    }
}

export async function apiIncrementPostViews(id: string) {
    try {
        const updated = await PostsServer.incrementPostViews(id);
        if (!updated) return errorResponse(`Post with id ${id} not found`);
        return successResponse(updated, "Post views incremented");
    } catch (err: any) {
        return errorResponse("Failed to increment post views", err.message);
    }
}

export async function apiGetTopPosts(limit = 3) {
    try {
        const posts = await PostsServer.getTopPosts(limit);
        return successResponse(posts, "Top posts fetched successfully");
    } catch (err: any) {
        return errorResponse("Failed to fetch top posts", err.message);
    }
}

// ==================== CATEGORY API ====================

export async function apiCreateCategory(data: any) {
    try {
        const category = await PostsServer.createCategory(data);
        return successResponse(category, "Category created successfully");
    } catch (err: any) {
        return errorResponse("Failed to create category", err.message);
    }
}

export async function apiGetAllCategories() {
    try {
        const categories = await PostsServer.getAllCategories();
        return successResponse(categories, "Categories fetched successfully");
    } catch (err: any) {
        return errorResponse("Failed to fetch categories", err.message);
    }
}

export async function apiGetCategoryById(id: string) {
    try {
        const category = await PostsServer.getCategoryById(id);
        if (!category) return errorResponse(`Category with id ${id} not found`);
        return successResponse(category, "Category fetched successfully");
    } catch (err: any) {
        return errorResponse("Failed to fetch category", err.message);
    }
}

export async function apiGetCategoryBySlug(slug: string) {
    try {
        const category = await PostsServer.getCategoryBySlug(slug);
        if (!category) return errorResponse(`Category with slug ${slug} not found`);
        return successResponse(category, "Category fetched successfully");
    } catch (err: any) {
        return errorResponse("Failed to fetch category", err.message);
    }
}

export async function apiUpdateCategory(id: string, data: any) {
    try {
        const updated = await PostsServer.updateCategory(id, data);
        if (!updated) return errorResponse(`Category with id ${id} not found`);
        return successResponse(updated, "Category updated successfully");
    } catch (err: any) {
        return errorResponse("Failed to update category", err.message);
    }
}

export async function apiDeleteCategory(id: string) {
    try {
        const deleted = await PostsServer.deleteCategory(id);
        if (!deleted) return errorResponse(`Category with id ${id} not found`);
        return successResponse(deleted, "Category deleted successfully");
    } catch (err: any) {
        return errorResponse("Failed to delete category", err.message);
    }
}

// ==================== TAG API ====================

export async function apiCreateTag(data: any) {
    try {
        const tag = await PostsServer.createTag(data);
        return successResponse(tag, "Tag created successfully");
    } catch (err: any) {
        return errorResponse("Failed to create tag", err.message);
    }
}

export async function apiGetAllTags() {
    try {
        const tags = await PostsServer.getAllTags();
        return successResponse(tags, "Tags fetched successfully");
    } catch (err: any) {
        return errorResponse("Failed to fetch tags", err.message);
    }
}

export async function apiGetTagById(id: string) {
    try {
        const tag = await PostsServer.getTagById(id);
        if (!tag) return errorResponse(`Tag with id ${id} not found`);
        return successResponse(tag, "Tag fetched successfully");
    } catch (err: any) {
        return errorResponse("Failed to fetch tag", err.message);
    }
}

export async function apiUpdateTag(id: string, data: any) {
    try {
        const updated = await PostsServer.updateTag(id, data);
        if (!updated) return errorResponse(`Tag with id ${id} not found`);
        return successResponse(updated, "Tag updated successfully");
    } catch (err: any) {
        return errorResponse("Failed to update tag", err.message);
    }
}

export async function apiDeleteTag(id: string) {
    try {
        const deleted = await PostsServer.deleteTag(id);
        if (!deleted) return errorResponse(`Tag with id ${id} not found`);
        return successResponse(deleted, "Tag deleted successfully");
    } catch (err: any) {
        return errorResponse("Failed to delete tag", err.message);
    }
}

// ==================== PORTFOLIO API ====================

export async function apiCreatePortfolio(data: any) {
    try {
        const portfolio = await PostsServer.createPortfolio(data);
        return successResponse(portfolio, "Portfolio created successfully");
    } catch (err: any) {
        return errorResponse("Failed to create portfolio", err.message);
    }
}

export async function apiGetPortfolioById(id: string) {
    try {
        const portfolio = await PostsServer.getPortfolioById(id);
        if (!portfolio) return errorResponse(`Portfolio with id ${id} not found`);
        return successResponse(portfolio, "Portfolio fetched successfully");
    } catch (err: any) {
        return errorResponse("Failed to fetch portfolio", err.message);
    }
}

export async function apiGetPortfolioByName(name: string) {
    try {
        const portfolio = await PostsServer.getPortfolioByName(name);
        if (!portfolio) return errorResponse(`Portfolio with name ${name} not found`);
        return successResponse(portfolio, "Portfolio fetched successfully");
    } catch (err: any) {
        return errorResponse("Failed to fetch portfolio", err.message);
    }
}

export async function apiGetAllPortfolios(limit = 10, page = 1) {
    try {
        const portfolios = await PostsServer.getAllPortfolios(limit, page);
        return successResponse(portfolios, "Portfolios fetched successfully");
    } catch (err: any) {
        return errorResponse("Failed to fetch portfolios", err.message);
    }
}

export async function apiUpdatePortfolio(id: string, data: any) {
    try {
        const updated = await PostsServer.updatePortfolio(id, data);
        if (!updated) return errorResponse(`Portfolio with id ${id} not found`);
        return successResponse(updated, "Portfolio updated successfully");
    } catch (err: any) {
        return errorResponse("Failed to update portfolio", err.message);
    }
}

export async function apiDeletePortfolio(id: string) {
    try {
        const deleted = await PostsServer.deletePortfolio(id);
        if (!deleted) return errorResponse(`Portfolio with id ${id} not found`);
        return successResponse(deleted, "Portfolio deleted successfully");
    } catch (err: any) {
        return errorResponse("Failed to delete portfolio", err.message);
    }
}

// ==================== TYPE API ====================

export async function apiCreateType(data: any) {
    try {
        const type = await PostsServer.createType(data);
        return successResponse(type, "Type created successfully");
    } catch (err: any) {
        return errorResponse("Failed to create type", err.message);
    }
}

export async function apiGetAllTypes() {
    try {
        const types = await PostsServer.getAllTypes();
        return successResponse(types, "Types fetched successfully");
    } catch (err: any) {
        return errorResponse("Failed to fetch types", err.message);
    }
}

export async function apiGetTypeById(id: string) {
    try {
        const type = await PostsServer.getTypeById(id);
        if (!type) return errorResponse(`Type with id ${id} not found`);
        return successResponse(type, "Type fetched successfully");
    } catch (err: any) {
        return errorResponse("Failed to fetch type", err.message);
    }
}

export async function apiUpdateType(id: string, data: any) {
    try {
        const updated = await PostsServer.updateType(id, data);
        if (!updated) return errorResponse(`Type with id ${id} not found`);
        return successResponse(updated, "Type updated successfully");
    } catch (err: any) {
        return errorResponse("Failed to update type", err.message);
    }
}

export async function apiDeleteType(id: string) {
    try {
        const deleted = await PostsServer.deleteType(id);
        if (!deleted) return errorResponse(`Type with id ${id} not found`);
        return successResponse(deleted, "Type deleted successfully");
    } catch (err: any) {
        return errorResponse("Failed to delete type", err.message);
    }
}

// ==================== RELATIONSHIP API ====================

export async function apiGetPostsByCategory(categoryId: string) {
    try {
        const posts = await PostsServer.getPostsByCategory(categoryId);
        return successResponse(posts, "Posts by category fetched successfully");
    } catch (err: any) {
        return errorResponse("Failed to fetch posts by category", err.message);
    }
}

export async function apiGetPostsByTag(tagId: string) {
    try {
        const posts = await PostsServer.getPostsByTag(tagId);
        return successResponse(posts, "Posts by tag fetched successfully");
    } catch (err: any) {
        return errorResponse("Failed to fetch posts by tag", err.message);
    }
}

export async function apiGetPostsByType(typeId: string) {
    try {
        const posts = await PostsServer.getPostsByType(typeId);
        return successResponse(posts, "Posts by type fetched successfully");
    } catch (err: any) {
        return errorResponse("Failed to fetch posts by type", err.message);
    }
}

export async function apiGetRelatedPosts(postId: string, limit = 3) {
    try {
        const posts = await PostsServer.getRelatedPosts(postId, limit);
        return successResponse(posts, "Related posts fetched successfully");
    } catch (err: any) {
        return errorResponse("Failed to fetch related posts", err.message);
    }
}

// ==================== AUTHOR API ====================

export async function apiGetAuthorByAuthorId(authorId: string) {
    try {
        const author = await PostsServer.getAuthorByAuthorId(authorId);
        if (!author) return errorResponse(`Author with ID ${authorId} not found`);
        return successResponse(author, "Author fetched successfully");
    } catch (err: any) {
        return errorResponse("Failed to fetch author", err.message);
    }
}

// ==================== STATISTICS API ====================

export async function apiGetPostCountByStatus() {
    try {
        const stats = await PostsServer.getPostCountByStatus();
        return successResponse(stats, "Post count by status fetched successfully");
    } catch (err: any) {
        return errorResponse("Failed to fetch post count by status", err.message);
    }
}

export async function apiGetMostViewedPosts(limit = 5) {
    try {
        const posts = await PostsServer.getMostViewedPosts(limit);
        return successResponse(posts, "Most viewed posts fetched successfully");
    } catch (err: any) {
        return errorResponse("Failed to fetch most viewed posts", err.message);
    }
}

export async function apiGetMostLikedPosts(limit = 5) {
    try {
        const posts = await PostsServer.getMostLikedPosts(limit);
        return successResponse(posts, "Most liked posts fetched successfully");
    } catch (err: any) {
        return errorResponse("Failed to fetch most liked posts", err.message);
    }
}
