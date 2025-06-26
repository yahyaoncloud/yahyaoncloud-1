import { motion } from "framer-motion";
import { useTheme } from "../Contexts/ThemeContext";
import { Link, useLoaderData, Form, Outlet } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import ArticleCard from "../components/ArticleCard";
import { Edit, Trash2 } from "lucide-react";
import { environment } from "~/environments/environment";

// Loader: Fetch posts from Go backend
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const res = await fetch(`${environment.GO_BACKEND_URL}/posts`);
    const posts = await res.json();
    // console.log("Loaded posts:", posts);
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

export default function AdminPosts() {
  const { theme, toggleTheme } = useTheme();
  const { posts } = useLoaderData<typeof loader>();

  return (
    <>
      <Outlet />
      <div
        className={`min-h-screen p-6 transition-colors duration-300 ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-100"
        }`}
      >
        <header className="flex justify-between items-center mb-8 max-w-5xl mx-auto">
          <h1
            className={`text-3xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Admin Posts
          </h1>
          <div className="flex space-x-4">
            <Link
              to="/admin/create"
              className={`px-4 py-2 rounded-md transition-colors font-medium ${
                theme === "dark"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              Create New Post
            </Link>
          </div>
        </header>

        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.length === 0 ? (
              <motion.div
                className={`rounded-lg p-6 text-center ${
                  theme === "dark"
                    ? "bg-gray-800 text-gray-300"
                    : "bg-white text-gray-600"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p>No posts found. Start by creating a new post!</p>
                <Link
                  to="/admin/create"
                  className={`inline-block mt-4 px-4 py-2 rounded-md font-medium ${
                    theme === "dark"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  Create Post
                </Link>
              </motion.div>
            ) : (
              posts.map((post: Post, index: number) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ArticleCard
                    post={{
                      _id: post.id,
                      title: post.title,
                      slug:
                        post.seo?.title?.toLowerCase().replace(/\s+/g, "-") ||
                        post.id,
                      excerpt: post.summary,
                      coverImage: post.coverImage?.url,
                      createdAt: post.createdAt,
                      category:
                        categories.find((cat) => cat.id === post.categoryId)
                          ?.name || "Uncategorized",
                      tags: post.tags?.map((tag) => tag.name) || [],
                    }}
                    className="relative"
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <Link
                      to={`/admin/edit/${post.id}`}
                      className={`p-2 rounded-md transition-colors ${
                        theme === "dark"
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                    >
                      <Edit size={16} />
                    </Link>
                    <Form method="post" className="inline">
                      <input type="hidden" name="_action" value="delete" />
                      <input type="hidden" name="postId" value={post.id} />
                      <motion.button
                        type="submit"
                        className={`p-2 rounded-md transition-colors ${
                          theme === "dark"
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </Form>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
