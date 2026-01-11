import { motion } from "framer-motion";
import { useTheme } from "~/Contexts/ThemeContext";
import { Link, useLoaderData, Form } from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Edit, Trash2, Eye, Clock, Calendar } from "lucide-react";
import { marked } from "marked";
import { useEffect, useState } from "react";
import dummyImage from "~/assets/yahya_glass.png";
import { getPostById, deletePost, publishPost, unpublishPost } from "~/Services/post.prisma.server";

// Configure marked for safe markdown rendering
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Loader for fetching post details using Prisma
export async function loader({ params }: LoaderFunctionArgs) {
  const { slug } = params; // Note: this is actually the ID from the URL
  if (!slug) return json({ error: "Post ID is required" }, { status: 400 });

  try {
    const post = await getPostById(slug);
    if (!post) {
      return json({ error: "Post not found" }, { status: 404 });
    }
    return json({ post });
  } catch (error) {
    console.error("Loader error:", error);
    return json({ error: "Failed to load post" }, { status: 500 });
  }
}

// Action for post operations
export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get("_action")?.toString();
  const postId = params.slug;
  
  if (!postId) {
    return json({ error: "Post ID required" }, { status: 400 });
  }

  try {
    switch (actionType) {
      case "delete":
        await deletePost(postId);
        return redirect("/admin/posts");
      case "publish":
        await publishPost(postId);
        return json({ success: "Post published" });
      case "unpublish":
        await unpublishPost(postId);
        return json({ success: "Post unpublished" });
      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Action error:", error);
    return json({ error: "Action failed" }, { status: 500 });
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
      <div className="min-h-screen flex items-center justify-center text-zinc-500">
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
        theme === "dark" ? "bg-zinc-900" : "bg-zinc-100"
      }`}
    >
      <div className="max-w-3xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1
            className={`text-3xl font-bold ${
              theme === "dark" ? "text-white" : "text-zinc-900"
            }`}
          >
            {post.title || "Untitled Post"}
          </h1>
          {/* <div className="flex space-x-2">
            <Link
              to={`/admin/update/${post.id}`}
              className={`p-2 rounded-md ${
                theme === "dark"
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-indigo-500 hover:bg-indigo-600"
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
          </div> */}
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`rounded-md p-6 shadow overflow-clip ${
            theme === "dark"
              ? "bg-zinc-800 text-zinc-100"
              : "bg-zinc-50 text-zinc-900"
          }`}
        >
          {post.coverImage?.url && (
            <img
              src={post.coverImage.url || dummyImage}
              alt={post.coverImage.altText || post.title || "Post image"}
              className="w-full h-64 object-cover rounded mb-4"
            />
          )}

          <div className="text-sm text-zinc-500 mb-2">
            {post.createdAt && formatDate(post.createdAt)} â€¢{" "}
            {post.categoryId || "Uncategorized"}
          </div>

          <p className="mb-4 whitespace-pre-line">
            {post.summary || "No summary available"}
          </p>

          <div
            className={`prose-sm max-w-none flex-wrap break-words ${
              theme === "dark" ? "text-zinc-100" : "text-zinc-900 prose-light"
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
                      ? "bg-zinc-700 text-zinc-200"
                      : "bg-zinc-200 text-zinc-700"
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
                theme === "dark" ? "text-white" : "text-zinc-900"
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
                  className="w-full object-cover rounded-md shadow"
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <Link
            to="/admin/home"
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

