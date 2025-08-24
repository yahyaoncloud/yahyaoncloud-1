import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { useTheme } from "../Contexts/ThemeContext";
import { getAuthorByAuthorId, getPostBySlug } from "../Services/post.server";
import { marked } from "marked";
import type { Author, Post } from "../Types/types";
import { proseClasses } from "../styles/prose";
import { useEffect } from "react";
import { ArrowLeft, Clock, Eye, Calendar, Share2, Heart } from "lucide-react";
import dummyImage from "../assets/yahya_glass.png";

// --- Meta ---
export function meta({
  data,
}: {
  data: { post: Post; author: Author | null };
}) {
  return [
    { title: `${data?.post?.title || "Post"} - Yahya on Cloud` },
    { name: "description", content: data?.post?.seo?.description || "" },
    { property: "og:title", content: data?.post?.title },
    { property: "og:description", content: data?.post?.summary },
    { property: "og:image", content: data?.post?.coverImage || dummyImage },
  ];
}

// --- Utility: serialize MongoDB document ---
function serializePost(post: any) {
  return {
    _id: post._id?.toString(),
    title: String(post.title || "Untitled"),
    slug: String(post.slug || ""),
    content: post.content || "",
    summary: post.summary || "",
    date: post.date,
    authorId: post.authorId,
    createdAt:
      post.createdAt instanceof Date
        ? post.createdAt.toISOString()
        : post.createdAt,
    updatedAt:
      post.updatedAt instanceof Date
        ? post.updatedAt.toISOString()
        : post.updatedAt,
    categories: post.categories?.map((c: any) => ({
      _id: c._id?.toString(),
      catID: c.catID,
      name: c.name,
      slug: c.slug,
    })),
    tags: post.tags?.map((t: any) => ({
      tagID: t.tagID?.toString?.() ?? t.tagID,
      name: t.name,
    })),
    coverImage: post.coverImage,
    gallery: post.gallery || [],
    minuteRead: post.minuteRead ?? 0,
    likes: post.likes ?? 0,
    views: post.views ?? 0,
  };
}

// --- Loader ---
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { slug } = params;
  const post = await getPostBySlug(slug);
  if (!post) throw new Response("Not Found", { status: 404 });

  const authorId = post.authorId; // capture before serialization
  const author = authorId ? await getAuthorByAuthorId(authorId) : null;
  console.log(authorId)
  const serializedPost = serializePost(post);
  const htmlContent = marked(serializedPost.content || "");

  return json({ post: { ...serializedPost, content: htmlContent }, author });
};



// --- Enhance Blog Content ---
export function useEnhanceBlogContent() {
  useEffect(() => {
    const article = document.querySelector("article") || document;

    // --- TABLE WRAP ---
    article.querySelectorAll("table").forEach((table) => {
      if (table.parentElement?.classList.contains("overflow-x-auto")) return;
      const wrapper = document.createElement("div");
      wrapper.className =
        "overflow-x-auto  shadow-sm bg-white dark:bg-transparent mb-4";
      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(table);
      table.className +=
        " min-w-full divide-y divide-gray-200 dark:divide-gray-700";
    });

    // --- CODE BLOCKS ---
    article.querySelectorAll("pre").forEach((pre) => {
      if (pre.parentElement?.classList.contains("code-block-wrapper")) return;

      const wrapper = document.createElement("div");
      wrapper.className = "code-block-wrapper relative overflow-hidden";
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      // --- LANGUAGE LABEL ---
      const codeElement = pre.querySelector("code");
      let language = "code";
      if (codeElement) {
        const classList = Array.from(codeElement.classList);
        const langClass = classList.find((cls) => cls.startsWith("language-"));
        if (langClass) language = langClass.replace("language-", "");
      }
      const langLabel = document.createElement("div");
      langLabel.textContent = language;
      langLabel.className =
        "absolute bottom-2 right-2 text-xs font-mono px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
      wrapper.appendChild(langLabel);

      // --- COPY BUTTON ---
      const button = document.createElement("button");
      button.setAttribute("aria-label", "Copy code");
      button.className =
        "copy-button absolute top-8 right-2 p-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 opacity-0 transition-opacity hover:opacity-100";
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="m5 15-2 0a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      `;

      button.addEventListener("click", async () => {
        if (!codeElement) return;
        try {
          await navigator.clipboard.writeText(codeElement.textContent || "");
          button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          `;
          setTimeout(() => {
            button.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="m5 15-2 0a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            `;
          }, 2000);
        } catch (err) {
          console.error(err);
        }
      });

      wrapper.addEventListener("mouseenter", () => {
        button.style.opacity = "1";
      });
      wrapper.addEventListener("mouseleave", () => {
        button.style.opacity = "0";
      });

      wrapper.appendChild(button);
    });
  }, []);
}

// --- Animation Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// --- Component ---
export default function PostPage() {
  const { theme } = useTheme();
  const { post, author } = useLoaderData<{
    post: Post;
    author: Author | null;
  }>();

  useEnhanceBlogContent();

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <h1 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Post not found
        </h1>
        <Link
          to="/blog"
          className="mt-4 inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline"
        >
          <ArrowLeft size={14} /> Back to Blog
        </Link>
      </div>
    );
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return isNaN(d.getTime())
      ? "Invalid date"
      : d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
  };

  const handleShare = async () => {
    const shareData = {
      title: post.title,
      text: post.summary || post.title,
      url: window.location.href,
    };
    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      } catch (clipboardError) {
        console.error("Clipboard error:", clipboardError);
      }
    }
  };

  return (
    <motion.div
      className=" max-w-sm sm:max-w-sm md:max-w-md lg:max-w-3xl xl:max-w-3xl mx-auto px-6 py-12 space-y-8"
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
    >
      {/* Hero Section */}
      <motion.section variants={fadeInUp}>
        {post.coverImage && (
          <img
            src={dummyImage}
            alt={post.title}
            className="w-full h-64 object-cover rounded-md border border-zinc-200 dark:border-zinc-800"
          />
        )}
        <div className="space-y-4 mt-6">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline"
          >
            <ArrowLeft size={14} /> Back to Blog
          </Link>
          <h1 className="md:text-4xl text-2xl font-extrabold text-indigo-800 dark:text-indigo-400">
            {post.title}
          </h1>
          {post.summary && (
            <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {post.summary}
            </p>
          )}
        </div>
      </motion.section>

      {/* Meta Section */}
      {/* Meta & Author Section */}
      <motion.section variants={fadeInUp}>
        <div className="flex flex-col gap-6 border-b border-zinc-200 dark:border-zinc-700 pb-6">
          {/* Author */}
          {author && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-sm">
                {author.authorName?.charAt(0).toUpperCase() || "A"}
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {author.authorName || "Unknown"}
                </p>
                {author.authorProfession && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {author.authorProfession}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            {post.minuteRead > 0 && (
              <span className="flex items-center gap-1">
                <Clock size={14} /> {post.minuteRead} min read
              </span>
            )}
            {post.views > 0 && (
              <span className="flex items-center gap-1">
                <Eye size={14} />
                {post.views > 1000
                  ? `${(post.views / 1000).toFixed(1)}k`
                  : post.views}{" "}
                views
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              <time dateTime={post.createdAt}>
                {formatDate(post.createdAt)}
              </time>
            </span>
          </div>

          {/* Categories & Tags */}
          {(post.categories?.length || post.tags?.length) && (
            <div className="flex flex-wrap gap-2">
              {post.categories?.map((category) => (
                <span
                  key={category._id}
                  className="px-2 py-1 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                >
                  {category.name}
                </span>
              ))}
              {post.tags?.map((tag) => (
                <span
                  key={tag.tagID || tag.name}
                  className="px-2 py-1 rounded text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <Share2 size={14} /> Share
            </button>
          </div>
        </div>
      </motion.section>

      {/* Article Content */}
      <motion.section variants={fadeInUp} >
        <article
          className={proseClasses}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </motion.section>
    </motion.div>
  );
}
