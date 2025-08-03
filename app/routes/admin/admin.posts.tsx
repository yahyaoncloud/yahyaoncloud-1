import { motion } from "framer-motion";
import { useTheme } from "../../Contexts/ThemeContext";
import { Link, useLoaderData, Form, Outlet } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import ArticleCard from "../../components/ArticleCard";
import { Edit, Trash2, Plus, Search, Filter } from "lucide-react";
import { environment } from "../../environments/environment";
import { useState } from "react";

// Loader: Fetch posts from Go backend
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const res = await fetch(`${environment.GO_BACKEND_URL}/posts`);
    const posts = await res.json();
    return json({ posts });
  } catch (error) {
    console.error("Loader error:", error);
    return json({ posts: [] }, { status: 500 });
  }
}

// Action: Handle delete post
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get("_action");
  const postId = formData.get("postId");

  if (typeof postId !== "string") {
    return json({ error: "Invalid post ID" }, { status: 400 });
  }

  if (actionType === "delete") {
    try {
      await fetch(`${environment.GO_BACKEND_URL}/posts/${postId}`, {
        method: "DELETE",
      });
      return json({ success: "Post deleted" });
    } catch (error) {
      return json({ error: "Failed to delete post" }, { status: 500 });
    }
  }

  return json({ error: "Invalid action" }, { status: 400 });
}

// Categories (map id to name)
const categories = [
  { id: "1", name: "AWS", slug: "aws" },
  { id: "2", name: "DevOps", slug: "devops" },
  { id: "3", name: "Security", slug: "security" },
];

interface Post {
  id: string;
  title: string;
  summary: string;
  coverImage?: { url: string };
  createdAt: string;
  categoryId: string;
  tags?: { name: string }[];
  seo?: { title?: string };
}

export default function AdminPosts() {
  const { theme } = useTheme();
  const { posts } = useLoaderData<typeof loader>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Filter posts based on search and category
  const filteredPosts = posts.filter((post: Post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || post.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <Outlet />
      <div
        className={`min-h-screen transition-all duration-300 ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
        }`}
      >
        {/* Header Section */}

        <div className="p-6 max-w-7xl mx-auto">
          {/* Search and Filter Section */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search
                  size={20}
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-opacity-50 ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter
                  size={20}
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`pl-10 pr-8 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-opacity-50 appearance-none min-w-48 ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div
              className={`mt-4 text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {searchTerm || selectedCategory !== "all" ? (
                <>
                  Showing {filteredPosts.length} of {posts.length} posts
                </>
              ) : (
                <>Showing all {posts.length} posts</>
              )}
            </div>
          </motion.div>

          {/* Posts Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredPosts.length === 0 ? (
              <motion.div
                variants={itemVariants}
                className={`rounded-2xl p-12 text-center shadow-lg ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700"
                    : "bg-gradient-to-br from-white to-gray-50 border border-gray-200"
                }`}
              >
                <div
                  className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                    theme === "dark"
                      ? "bg-gray-700 text-gray-400"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Search size={32} />
                </div>
                <h3
                  className={`text-xl font-semibold mb-2 ${
                    theme === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  {posts.length === 0 ? "No posts yet" : "No posts found"}
                </h3>
                <p
                  className={`mb-6 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {posts.length === 0
                    ? "Start by creating your first blog post!"
                    : "Try adjusting your search or filter criteria"}
                </p>
                {posts.length === 0 && (
                  <Link
                    to="/admin/create"
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
                        : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                    }`}
                  >
                    <Plus size={20} />
                    Create First Post
                  </Link>
                )}
              </motion.div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {filteredPosts.map((post: Post, index: number) => (
                  <motion.div
                    key={post.id}
                    variants={itemVariants}
                    className="group"
                  >
                    <div
                      className={`relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ${
                        theme === "dark"
                          ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700"
                          : "bg-white border border-gray-200"
                      }`}
                    >
                      <ArticleCard
                        post={{
                          _id: post.id,
                          title: post.title,
                          slug:
                            post.seo?.title
                              ?.toLowerCase()
                              .replace(/\s+/g, "-") || post.id,
                          excerpt: post.summary,
                          coverImage: post.coverImage?.url,
                          createdAt: post.createdAt,
                          category:
                            categories.find((cat) => cat.id === post.categoryId)
                              ?.name || "Uncaterized",
                          tags: post.tags?.map((tag) => tag.name) || [],
                        }}
                        className="border-none shadow-none"
                      />

                      {/* Action Buttons Overlay */}
                      <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <Link
                          to={`/admin/edit/${post.id}`}
                          className={`p-3 rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
                            theme === "dark"
                              ? "bg-blue-600/80 hover:bg-blue-500 text-white shadow-lg"
                              : "bg-blue-500/80 hover:bg-blue-600 text-white shadow-lg"
                          }`}
                          title="Edit Post"
                        >
                          <Edit size={16} />
                        </Link>
                        <Form method="post" className="inline">
                          <input type="hidden" name="_action" value="delete" />
                          <input type="hidden" name="postId" value={post.id} />
                          <motion.button
                            type="submit"
                            className={`p-3 rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
                              theme === "dark"
                                ? "bg-red-600/80 hover:bg-red-500 text-white shadow-lg"
                                : "bg-red-500/80 hover:bg-red-600 text-white shadow-lg"
                            }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            title="Delete Post"
                            onClick={(e) => {
                              if (
                                !confirm(
                                  "Are you sure you want to delete this post?"
                                )
                              ) {
                                e.preventDefault();
                              }
                            }}
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </Form>
                      </div>

                      {/* Category Badge */}
                      {/* <div className="absolute bottom-4 left-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            theme === "dark"
                              ? "bg-purple-600/80 text-purple-100 backdrop-blur-sm"
                              : "bg-purple-500/80 text-white backdrop-blur-sm"
                          }`}
                        >
                          {categories.find((cat) => cat.id === post.categoryId)
                            ?.name || "Uncategorized"}
                        </span>
                      </div> */}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
