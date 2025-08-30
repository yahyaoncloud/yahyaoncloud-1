import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { useTheme } from "../Contexts/ThemeContext";
import {
  getAuthorByAuthorId,
  getPostBySlug,
  getPosts,
} from "../Services/post.server";
import { marked } from "marked";
import type { Author, Post } from "../Types/types";
import { proseClasses } from "../styles/prose";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Clock,
  Eye,
  Calendar,
  Share2,
  ChevronLeft,
  ChevronRight,
  Copy,
} from "lucide-react";
import dummyImage from "../assets/yahya_glass.png";
import { cacheHeader } from "pretty-cache-header";
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
  if (!slug) {
    throw new Response("Slug is required", { status: 400 });
  }

  const post = await getPostBySlug(slug);
  if (!post) {
    throw new Response("Not Found", { status: 404 });
  }

  const authorId = post.authorId;

  const [author, allPosts] = await Promise.all([
    authorId ? getAuthorByAuthorId(authorId) : null,
    getPosts("published", 20, 1),
  ]);

  const serializedPost = serializePost(post);

  const htmlContent = marked(serializedPost.content || "");

  const otherPosts = allPosts
    .filter((p) => p.slug !== slug)
    .map(serializePost)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  return json(
    {
      post: { ...serializedPost, content: htmlContent },
      author,
      relatedPosts: otherPosts,
    },
    {
      headers: {
        "Cache-Control": cacheHeader({
          public: true,
          maxAge: "5min",
          sMaxAge: "15min",
          staleWhileRevalidate: "1day",
          staleIfError: "1h",
        }),
      },
    }
  );
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
        "overflow-x-auto bg-white dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-700 my-4";
      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(table);
      table.className +=
        " min-w-full divide-y divide-zinc-200 dark:divide-zinc-700";
    });

    // --- CODE BLOCKS ---
    article.querySelectorAll("pre").forEach((pre) => {
      if (pre.parentElement?.classList.contains("code-block-wrapper")) return;

      const wrapper = document.createElement("div");
      wrapper.className = "code-block-wrapper relative overflow-hidden rounded my-4";
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
        "absolute bottom-2 right-2 text-xs font-mono px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300";
      wrapper.appendChild(langLabel);

      // --- COPY BUTTON ---
      const button = document.createElement("button");
      button.setAttribute("aria-label", "Copy code");
      button.className =
        "copy-button absolute top-2 right-2 p-1 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 opacity-0 transition-opacity hover:opacity-100";
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
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
                <path d="m5 15-2 0a2 2 0 0 1-2-2V4a2 2 0 0 1 2 2v1"></path>
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

// --- More Articles Component ---
const CarouselArticles = ({ posts }: { posts: Post[] }) => {
  const [index, setIndex] = useState(0);
  const visible = 2;

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return isNaN(d.getTime())
      ? ""
      : d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
  };

  const next = () => setIndex((prev) => (prev + visible) % posts.length);
  const prev = () =>
    setIndex((prev) => (prev - visible + posts.length) % posts.length);

  if (posts.length === 0) return null;

  const currentPosts = posts.slice(index, index + visible);
  if (currentPosts.length < visible) {
    currentPosts.push(...posts.slice(0, visible - currentPosts.length));
  }

  return (
    <motion.section
      className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          More Articles
        </h2>
        <Link
          to="/blog/posts"
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          View all →
        </Link>
      </div>

      <div className="relative flex items-center gap-4">
        {/* Left Button */}
        <button
          onClick={prev}
          className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {currentPosts.map((post, idx) => (
            <motion.div
              key={post._id + idx}
              className="relative flex rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Text */}
              <div className="w-2/3 p-4 bg-white dark:bg-zinc-950">
                <Link
                  to={`/blog/post/${post.slug}`}
                  className="block text-base font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {post.title}
                </Link>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
                  {post.summary}
                </p>
                <span className="block mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {formatDate(post.createdAt)}
                </span>
              </div>

              {/* Image */}
              <div
                className="w-1/3 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${post.image || dummyImage})`,
                }}
              >
                <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-transparent to-white dark:to-zinc-950 pointer-events-none"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right Button */}
        <button
          onClick={next}
          className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </motion.section>
  );
};

// --- Animation Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// --- Component ---
export default function PostPage() {
  const { theme } = useTheme();
  const { post, author, relatedPosts } = useLoaderData<{
    post: Post;
    author: Author | null;
    relatedPosts: Post[];
  }>();

  useEnhanceBlogContent();

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h1 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Post not found
          </h1>
          <Link
            to="/blog"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <ArrowLeft size={14} /> Back to Blog
          </Link>
        </div>
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
      className="max-w-2xl mx-auto px-6 py-12 space-y-12"
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
    >
      {/* Navigation */}
      <motion.div variants={fadeInUp}>
        <Link
          to="/blog/posts"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors"
        >
          <ArrowLeft size={14} /> Articles
        </Link>
      </motion.div>

      {/* Header */}
      <motion.header variants={fadeInUp} className="space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
          {post.title}
        </h1>

        {/* Minimalist Meta Line */}
        <div className="flex items-center gap-3 text-base text-zinc-500 dark:text-zinc-400 pb-8 border-b border-zinc-200 dark:border-zinc-700">
          {author && (
            <span className="hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors cursor-pointer">
              @{author.authorName?.toLowerCase().replace(/\s+/g, '') || "anonymous"}
            </span>
          )}
          <span>|</span>
          <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
          {post.minuteRead > 0 && (
            <>
              {/* <span>|</span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {post.minuteRead} min read
              </span> */}
            </>
          )}

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors ml-auto"
          >
            <Share2 size={14} />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>

        {post.summary && (
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {post.summary}
          </p>
        )}

        {/* Categories & Tags - Simplified */}
        {(post.categories?.length || post.tags?.length) && (
          <div className="flex flex-wrap gap-3 text-xs">
            {post.categories?.map((category) => (
              <Link
                key={category._id}
                to={`/blog/posts?category=${category.slug}`}
                className="text-zinc-600 dark:text-zinc-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors"
              >
                {category.name}
              </Link>
            ))}
            {post.tags?.map((tag) => (
              <Link
                key={tag.tagID || tag.name}
                to={`/blog/posts?tag=${tag.slug}`}
                className="text-zinc-500 dark:text-zinc-500 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </motion.header>

      {/* Article Content */}
      <motion.section variants={fadeInUp}>
        <article
          className={proseClasses}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </motion.section>

      {/* More Articles Section */}
      <CarouselArticles posts={relatedPosts} />
    </motion.div>
  );
}
