import { motion } from "framer-motion";
import { useTheme } from "../Contexts/ThemeContext";
import { Link, useLoaderData, Form, Outlet, useActionData } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { lazy, Suspense, useState, useEffect, useMemo } from "react";
import { useDebouncedCallback } from "use-debounce";
import toast from "react-hot-toast";
import { Search, Filter, Plus, Edit, Trash2, Eye, MessageCircle, Heart } from "lucide-react";
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
  const { theme } = useTheme();
  const { posts, categories } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const debouncedSetSearchTerm = useDebouncedCallback((value: string) => {
    setSearchTerm(value);
  }, 300);

  // Theme-based class helpers
  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-zinc-900" : "bg-zinc-50";
  const cardBg = isDark ? "bg-zinc-800" : "bg-white";
  const textColor = isDark ? "text-zinc-100" : "text-zinc-900";
  const subTextColor = isDark ? "text-zinc-400" : "text-zinc-600";
  const borderColor = isDark ? "border-zinc-700" : "border-zinc-200";
  const inputBg = isDark ? "bg-zinc-800" : "bg-white";
  const placeholderColor = isDark ? "placeholder-zinc-500" : "placeholder-zinc-400";
  const statTextColor = isDark ? "text-zinc-300" : "text-zinc-600";
  const readTimeBg = isDark ? "bg-zinc-700" : "bg-zinc-200";
  const readTimeText = isDark ? "text-zinc-300" : "text-zinc-700";
  const buttonBg = isDark ? "bg-emerald-600 hover:bg-emerald-700" : "bg-emerald-600 hover:bg-emerald-700";
  const buttonText = isDark ? "text-zinc-100" : "text-white";
  const editButtonHover = isDark ? "hover:text-zinc-100 hover:bg-zinc-700" : "hover:text-zinc-900 hover:bg-zinc-100";
  const deleteButtonHover = isDark ? "text-red-300 hover:text-red-100 hover:bg-red-900/30" : "text-red-600 hover:text-red-900 hover:bg-red-100";

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory
        ? post.categories?.some((cat: Category) => cat._id === selectedCategory)
        : true;
      return matchesSearch && matchesCategory;
    });
  }, [posts, searchTerm, selectedCategory]);

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${bgColor}`}>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 max-w-7xl mx-auto gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${textColor}`}>
            Blog Posts
          </h1>
          <p className={`text-sm ${subTextColor}`}>
            Manage your blog content and publications
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className={`relative flex-1 sm:w-64 ${inputBg} rounded-md border ${borderColor}`}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search posts..."
                onChange={(e) => debouncedSetSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 text-sm bg-transparent focus:outline-none ${textColor} ${placeholderColor}`}
              />
            </div>

            <div className={`relative flex-1 sm:w-48 ${inputBg} rounded-md border ${borderColor}`}>
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 text-sm bg-transparent focus:outline-none appearance-none ${textColor}`}
              >
                <option value="">All Categories</option>
                {categories.map((category: Category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Link
            to="/admin/posts/create"
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors font-medium ${buttonBg} ${buttonText}`}
          >
            <Plus size={18} />
            New Post
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 max-w-7xl mx-auto">
        <div className={`rounded-lg p-4 ${cardBg}`}>
          <p className={`text-sm font-medium ${subTextColor}`}>
            Total Posts
          </p>
          <p className={`text-2xl font-bold ${textColor}`}>
            {filteredPosts.length}
          </p>
        </div>
        <div className={`rounded-lg p-4 ${cardBg}`}>
          <p className={`text-sm font-medium ${subTextColor}`}>
            Published
          </p>
          <p className={`text-2xl font-bold ${textColor}`}>
            {filteredPosts.filter((post) => post.status === "published").length}
          </p>
        </div>
        <div className={`rounded-lg p-4 ${cardBg}`}>
          <p className={`text-sm font-medium ${subTextColor}`}>
            Drafts
          </p>
          <p className={`text-2xl font-bold ${textColor}`}>
            {filteredPosts.filter((post) => post.status === "draft").length}
          </p>
        </div>
        <div className={`rounded-lg p-4 ${cardBg}`}>
          <p className={`text-sm font-medium ${subTextColor}`}>
            Categories
          </p>
          <p className={`text-2xl font-bold ${textColor}`}>
            {categories.length}
          </p>
        </div>
      </div>

      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Outlet />
        {filteredPosts.length === 0 ? (
          <motion.div
            className={`rounded-lg p-8 text-center ${cardBg} ${subTextColor}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-md mx-auto">
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-full ${isDark ? "bg-zinc-700" : "bg-zinc-100"} flex items-center justify-center`}
              >
                <Plus className="w-8 h-8 text-zinc-400" />
              </div>
              <h3
                className={`text-lg font-medium mb-2 ${textColor}`}
              >
                No posts found
              </h3>
              <p className="text-zinc-500 mb-4">
                {searchTerm || selectedCategory
                  ? "No posts match your search or filter"
                  : "Start creating amazing content for your audience"}
              </p>
              <Link
                to="/admin.posts.create"
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-md font-medium ${buttonBg} ${buttonText}`}
              >
                <Plus size={18} />
                Create Your First Post
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post, index: number) => {
              const createdAt =
                typeof post.createdAt === "string"
                  ? new Date(post.createdAt)
                  : post.createdAt;

              return (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`rounded-lg overflow-hidden ${cardBg}`}
                >
                  <Suspense fallback={<div>Loading...</div>}>
                    <ArticleCard
                      post={{
                        _id: post._id,
                        title: post.title,
                        slug: post.slug,
                        summary: post.summary,
                        excerpt: post.summary,
                        // coverImage: post.coverImage,
                        coverImage: Mock,
                        createdAt,
                        categories:
                          post.categories?.map((cat: Category) => cat.name) || ["Uncategorized"],
                        tags: post.tags?.map((tag: Tag) => tag.name) || [],
                        published: post.status === "published",
                      }}
                      className="relative"
                    />
                  </Suspense>

                  <div className={`p-4 border-t ${borderColor}`}>
                    <div className="flex justify-between text-xs mb-2">
                      <div className={`flex gap-3 ${statTextColor}`}>
                        <span className="flex items-center gap-1">
                          <Eye size={12} />
                          {post.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart size={12} />
                          {post.likes || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={12} />
                          {post.commentsCount || 0}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded ${readTimeBg} ${readTimeText}`}>
                        {post.minuteRead || 5} min read
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <Link
                        to={`/admin/posts/edit/${post._id}`}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${statTextColor} ${editButtonHover}`}
                      >
                        <Edit size={16} />
                        Edit
                      </Link>
                      <Form method="post" className="inline">
                        <input type="hidden" name="_action" value="delete" />
                        <input type="hidden" name="postId" value={post._id} />
                        <motion.button
                          type="submit"
                          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${deleteButtonHover}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Trash2 size={16} />
                          Delete
                        </motion.button>
                      </Form>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}