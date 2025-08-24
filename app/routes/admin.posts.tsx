import { motion } from "framer-motion";
import { useTheme } from "../Contexts/ThemeContext";
import { Link, useLoaderData, Form, Outlet, useActionData } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { lazy, Suspense, useState, useEffect, useMemo } from "react";
import { useDebouncedCallback } from "use-debounce";
import toast from "react-hot-toast";
import { Search, Filter, Plus, Edit, Trash2, Eye, MessageCircle, Heart, Calendar, FileText } from "lucide-react";
import { getPosts, getAllCategories, deletePost } from "../Services/post.server";
import type { Post, Category, Tag } from "../Types/types";
import Mock from "../assets/yahya_glass.png"

const ArticleCard = lazy(() => import("../components/ArticleCard"));

interface LoaderData {
  posts: Post[];
  categories: Category[];
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const [posts, categories] = await Promise.all([getPosts(), getAllCategories()]);
    return json({ posts, categories } as LoaderData);
  } catch (error) {
    console.error("Loader error:", error);
    return json({ posts: [], categories: [] } as LoaderData, { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get("_action");
  const postId = formData.get("postId");

  if (typeof postId !== "string") {
    return json({ error: "Invalid post ID" }, { status: 400 });
  }

  if (actionType === "delete") {
    try {
      await deletePost(postId);
      return json({ success: "Post deleted" });
    } catch (error) {
      console.error("Delete error:", error);
      return json({ error: "Failed to delete post" }, { status: 500 });
    }
  }

  return json({ error: "Invalid action" }, { status: 400 });
}

export default function AdminPosts() {
  const { posts, categories } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const debouncedSetSearchTerm = useDebouncedCallback((value: string) => {
    setSearchTerm(value);
  }, 300);

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.summary?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory
        ? post.categories?.some((cat: Category) => cat._id === selectedCategory)
        : true;
      const matchesStatus = selectedStatus
        ? post.status === selectedStatus
        : true;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [posts, searchTerm, selectedCategory, selectedStatus]);

  const stats = useMemo(() => ({
    total: posts.length,
    published: posts.filter(p => p.status === "published").length,
    drafts: posts.filter(p => p.status === "draft").length,
    categories: categories.length
  }), [posts, categories]);

  return (
    <div className="min-h-screen text-zinc-900 dark:text-zinc-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl text-zinc-900 dark:text-zinc-100 mb-2">Posts</h1>
              <div className="w-12 h-0.5 bg-zinc-900 dark:bg-zinc-100"></div>
            </div>
            <Link
              to="/admin/post/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-md text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              New Post
            </Link>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Manage and organize your blog content
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={16} className="text-zinc-500 dark:text-zinc-400" />
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Total</span>
            </div>
            <p className="text-2xl font-light text-zinc-900 dark:text-zinc-100">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-2 mb-1">
              <Eye size={16} className="text-green-500" />
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Published</span>
            </div>
            <p className="text-2xl font-light text-zinc-900 dark:text-zinc-100">{stats.published}</p>
          </div>
          <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-2 mb-1">
              <Edit size={16} className="text-amber-500" />
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Drafts</span>
            </div>
            <p className="text-2xl font-light text-zinc-900 dark:text-zinc-100">{stats.drafts}</p>
          </div>
          <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-2 mb-1">
              <Filter size={16} className="text-blue-500" />
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Categories</span>
            </div>
            <p className="text-2xl font-light text-zinc-900 dark:text-zinc-100">{stats.categories}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search posts..."
              onChange={(e) => debouncedSetSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-md text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400 focus:border-transparent"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((category: Category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <Outlet />

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <motion.div
            className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
                <FileText className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-xl font-light text-zinc-900 dark:text-zinc-100 mb-2">
                {searchTerm || selectedCategory || selectedStatus
                  ? "No posts found"
                  : "No posts yet"}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                {searchTerm || selectedCategory || selectedStatus
                  ? "Try adjusting your search or filters"
                  : "Create your first post to get started"}
              </p>
              <Link
                to="/admin/post/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-md font-medium transition-colors"
              >
                <Plus size={18} />
                Create Post
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post, index: number) => {
              const createdAt = typeof post.createdAt === "string"
                ? new Date(post.createdAt)
                : post.createdAt;

              return (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1">
                            {post.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${post.status === "published"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            }`}>
                            {post.status}
                          </span>
                        </div>

                        {post.summary && (
                          <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-3 line-clamp-2">
                            {post.summary}
                          </p>
                        )}

                        <div className="flex items-center gap-6 text-xs text-zinc-500 dark:text-zinc-400">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            {createdAt.toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye size={12} />
                            {post.views || 0} views
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart size={12} />
                            {post.likes || 0} likes
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle size={12} />
                            {post.commentsCount || 0} comments
                          </div>
                          <span>{post.minuteRead || 5} min read</span>
                        </div>

                        {post.categories && post.categories.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {post.categories.slice(0, 3).map((category: Category, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs rounded"
                              >
                                {category.name}
                              </span>
                            ))}
                            {post.categories.length > 3 && (
                              <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs rounded">
                                +{post.categories.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {post.coverImage && (
                        <div className="ml-4">
                          <img
                            src={Mock}
                            alt={post.title}
                            className="w-20 h-20 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-700">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/post/edit/${post._id}`}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors"
                        >
                          <Edit size={14} />
                          Edit
                        </Link>

                        <Link
                          to={`/blog/post/${post.slug}`}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors"
                        >
                          <Eye size={14} />
                          View
                        </Link>
                      </div>

                      <Form method="post" className="inline">
                        <input type="hidden" name="_action" value="delete" />
                        <input type="hidden" name="postId" value={post._id} />
                        <button
                          type="submit"
                          onClick={(e) => {
                            if (!confirm("Are you sure you want to delete this post?")) {
                              e.preventDefault();
                            }
                          }}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </Form>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}