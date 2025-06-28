import { motion } from "framer-motion";
import { useTheme } from "../Contexts/ThemeContext";
import { Link, useLoaderData, Form } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { environment } from "../environments/environment";
import { Edit, Trash2 } from "lucide-react";
import { marked } from "marked";
import { useEffect, useState } from "react";
import dummyImage from "../assets/yahya_glass.png";

// Configure marked for safe markdown rendering
marked.setOptions({
  gfm: true,
  breaks: true,
  sanitize: true,
});

// Loader for fetching post details with explicit UTF-8 encoding
export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) return json({ error: "Post ID is required" }, { status: 400 });

  try {
    const res = await fetch(`${environment.GO_BACKEND_URL}/posts/${id}`, {
      headers: { "Accept-Charset": "utf-8" },
    });
    if (!res.ok) throw new Error("Post not found");
    const text = await res.text();
    const post = JSON.parse(text);
    return json({ post });
  } catch (error) {
    console.error("Loader error:", error);
    return json({ error: "Failed to load post" }, { status: 500 });
  }
}

export default function AdminPostDetail() {
  const { theme } = useTheme();
  const { post, error } = useLoaderData<typeof loader>();
  const [markdownContent, setMarkdownContent] = useState<string>("");

  // Convert markdown content to HTML with encoding handling
  useEffect(() => {
    if (post?.content) {
      try {
        const htmlContent = marked.parse(post.content);
        setMarkdownContent(htmlContent);
      } catch (err) {
        console.error("Markdown parsing error:", err);
        setMarkdownContent("<p>Error rendering content</p>");
      }
    } else {
      setMarkdownContent("<p>No content available</p>");
    }
  }, [post]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }
  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  const formatDate = (dateStr: string) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Date not available";

  return (
    <div
      className={`min-h-screen p-6 ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <div className="max-w-3xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1
            className={`text-3xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {post.title || "Untitled Post"}
          </h1>
          <div className="flex space-x-2">
            <Link
              to={`/admin/edit/${post.id}`}
              className={`p-2 rounded-md ${
                theme === "dark"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white`}
            >
              <Edit size={16} />
            </Link>
            <Form method="post">
              <input type="hidden" name="_action" value="delete" />
              <input type="hidden" name="postId" value={post.id} />
              <motion.button
                type="submit"
                className={`p-2 rounded-md ${
                  theme === "dark"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-500 hover:bg-red-600"
                } text-white`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 size={16} />
              </motion.button>
            </Form>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`rounded-lg p-6 shadow overflow-clip ${
            theme === "dark"
              ? "bg-gray-800 text-gray-100"
              : "bg-white text-gray-900"
          }`}
        >
          {post.coverImage?.url && (
            <img
              src={post.coverImage.url || dummyImage}
              alt={post.coverImage.altText || post.title || "Post image"}
              className="w-full h-64 object-cover rounded mb-4"
            />
          )}

          <div className="text-sm text-gray-500 mb-2">
            {post.createdAt && formatDate(post.createdAt)} •{" "}
            {post.categoryId || "Uncategorized"}
          </div>

          <p className="mb-4 whitespace-pre-line">
            {post.summary || "No summary available"}
          </p>

          <div
            className={`prose-sm max-w-none flex-wrap break-words ${
              theme === "dark" ? "text-gray-100" : "text-gray-900 prose-light"
            }`}
            style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
            dangerouslySetInnerHTML={{ __html: markdownContent }}
          />

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag: any) => (
                <span
                  key={tag.id || tag.name || Math.random()}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    theme === "dark"
                      ? "bg-gray-700 text-gray-200"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  #{tag.name || "Unknown"}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {post.gallery && post.gallery.length > 0 && (
          <div className="mt-8">
            <h3
              className={`text-lg font-semibold mb-4 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Gallery
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {post.gallery.map((img: any) => (
                <img
                  key={img.id || Math.random()}
                  src={img.url || dummyImage}
                  alt={img.altText || "Gallery image"}
                  className="w-full object-cover rounded-lg shadow"
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <Link
            to="/admin/posts"
            className={`inline-block px-4 py-2 rounded-md font-medium mt-4 ${
              theme === "dark"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            Back to Posts
          </Link>
        </div>
      </div>
    </div>
  );
}
