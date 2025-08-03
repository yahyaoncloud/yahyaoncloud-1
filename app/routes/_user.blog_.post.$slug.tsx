import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { motion } from "framer-motion";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../components/ui/hover-card";
import {
  Calendar,
  TagIcon,
  ArrowLeft,
  Clock,
  Eye,
  Heart,
  Share2,
  Globe,
  Linkedin,
  Github,
  Twitter,
  Copy,
} from "lucide-react";
import { useTheme } from "../Contexts/ThemeContext";
import { getAuthorByAuthorId, getPostBySlug } from "../Services/post.server";
import { marked } from "marked";
import type { Author, Post } from "../Types/types";
import { proseClasses } from "../styles/prose";
import { useState, useEffect } from "react";
import { FaGithub, FaGlobeAsia, FaLinkedin } from "react-icons/fa";
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
  try {
    const { slug } = params;
    if (!slug) throw new Response("Not Found", { status: 404 });

    const post = await getPostBySlug(slug);
    if (!post) throw new Response("Not Found", { status: 404 });

    const serializedPost = serializePost(post);
    if (!serializedPost.authorId) {
      console.error("No authorId found for post:", serializedPost);
      return json({
        post: {
          ...serializedPost,
          content: marked(serializedPost.content || ""),
        },
        author: null,
      });
    }

    const authorId = serializedPost.authorId;
    const author = await getAuthorByAuthorId(authorId);

    const htmlContent = marked(serializedPost.content || "");

    return json({
      post: {
        ...serializedPost,
        content: htmlContent,
      },
      author: author || null,
    });
  } catch (error) {
    console.error("Loader error:", error);
    throw new Response("Server Error", { status: 500 });
  }
};

export function useEnhanceBlogContent() {
  useEffect(() => {
    const article = document.querySelector("article") || document;

    // --- TABLE WRAP ---
    article.querySelectorAll("table").forEach((table) => {
      if (table.parentElement?.classList.contains("overflow-x-auto")) return;
      const wrapper = document.createElement("div");
      wrapper.className = "overflow-x-auto";
      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });

    // --- COPY BUTTONS ---
    article.querySelectorAll("pre").forEach((pre) => {
      if (pre.querySelector(".copy-btn")) return; // already added

      const button = document.createElement("button");
      button.innerText = "Copy";
      button.className =
        "copy-btn absolute top-2 right-2 bg-slate-700 text-white px-2 py-1 text-xs rounded hover:bg-slate-600 z-10";

      button.addEventListener("click", () => {
        const code = pre.querySelector("code")?.innerText;
        if (!code) return;
        navigator.clipboard.writeText(code);
        button.innerText = "Copied!";
        setTimeout(() => (button.innerText = "Copy"), 1500);
      });

      pre.classList.add("relative");
      pre.appendChild(button);
    });
  }, []);
}

// --- Component ---
export default function PostPage() {
  const { theme } = useTheme();
  const { post, author } = useLoaderData<{
    post: Post;
    author: Author | null;
  }>();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likes || 0);
  useEnhanceBlogContent();

  // Process content to add copy buttons to code elements
  useEffect(() => {
    const codeBlocks = document.querySelectorAll("pre > code");
    const inlineCodes = document.querySelectorAll("code:not(pre > code)");

    const addCopyButton = (codeElement: HTMLElement, isBlock: boolean) => {
      const wrapper = isBlock ? codeElement.parentElement! : codeElement;
      wrapper.style.position = "relative";

      const copyButton = document.createElement("button");
      copyButton.className = `
        absolute top-2 right-2 p-1.5 rounded-md
        bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300
        hover:bg-gray-200 dark:hover:bg-gray-600
        opacity-0 group-hover:opacity-100 transition-opacity duration-200
        flex items-center justify-center
        ${isBlock ? "text-sm" : "text-xs"}
      `;
      copyButton.innerHTML = `<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
      copyButton.title = "Copy code";

      copyButton.onclick = async () => {
        try {
          await navigator.clipboard.writeText(codeElement.innerText);
          copyButton.innerHTML = `<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
          setTimeout(() => {
            copyButton.innerHTML = `<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
          }, 2000);
        } catch (err) {
          console.error("Failed to copy:", err);
        }
      };

      wrapper.classList.add("group");
      wrapper.appendChild(copyButton);
    };

    codeBlocks.forEach((code) => addCopyButton(code as HTMLElement, true));
    inlineCodes.forEach((code) => addCopyButton(code as HTMLElement, false));
  }, [post.content]);

  if (!post) return <div>Post not found</div>;

  const formatDate = (date: Date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid date";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <motion.div
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {post.coverImage && (
          <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
            <motion.img
              src={dummyImage}
              alt={post.title}
              className="w-full h-full object-cover"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/30 to-transparent dark:from-gray-900 dark:via-gray-900/30 dark:to-transparent" />
            <motion.div
              className="absolute top-3 left-3 sm:top-6 sm:left-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Link
                to="/blog"
                className="inline-flex items-center px-3 py-2 rounded-lg 
                   bg-white/70 backdrop-blur-md border border-slate-300 
                   text-slate-800 
                   dark:bg-white/10 dark:text-white dark:border-slate-600
                   hover:bg-white/80 dark:hover:bg-white/20
                   transition-all duration-300 text-sm font-medium shadow-lg"
              >
                <ArrowLeft size={16} className="mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Back</span>
              </Link>
            </motion.div>
            <motion.div
              className="absolute top-3 right-3 sm:top-6 sm:right-6 flex items-center space-x-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <button
                onClick={handleLike}
                className="inline-flex items-center px-3 py-2 rounded-lg 
                   backdrop-blur-md text-sm font-medium shadow-lg
                   transition-all duration-300
                   bg-red-500/30 border border-red-400/50
                   text-slate-800 dark:text-white"
              >
                <Heart
                  size={16}
                  className={`mr-1 ${
                    isLiked ? "fill-red-400 text-red-400" : ""
                  }`}
                />
                <span className="hidden xs:inline">{likeCount}</span>
              </button>
              <button
                onClick={handleShare}
                className="inline-flex items-center px-3 py-2 rounded-lg
                   backdrop-blur-md text-sm font-medium shadow-lg
                   transition-all duration-300
                   bg-white/70 border border-slate-300 text-slate-800
                   dark:bg-white/10 dark:text-white dark:border-slate-600
                   hover:bg-white/80 dark:hover:bg-white/20"
              >
                <Share2 size={16} className="mr-1" />
                <span className="hidden xs:inline">Share</span>
              </button>
            </motion.div>
          </div>
        )}
        <div className="relative bg-gradient-to-t dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 bg-gray-100 via-slate-200 to-slate-100 md:p-2 p-0 rounded">
          <motion.article
            className="mx-auto px-3 lg:px-8 w-auto flex flex-col max-w-sm md:max-w-xl lg:max-w-4xl xl:max-w-5xl -mt-6 sm:-mt-12 lg:-mt-16 relative z-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 sm:p-6 lg:p-8 mx-auto w-full">
                {!post.coverImage && (
                  <motion.div
                    className="flex justify-end items-center space-x-2 mb-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <button
                      onClick={handleLike}
                      className={`inline-flex items-center px-3 py-2 rounded-lg border transition-all duration-300 text-sm font-medium ${
                        isLiked
                          ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
                          : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Heart
                        size={14}
                        className={`mr-1.5 ${isLiked ? "fill-current" : ""}`}
                      />
                      <span>{likeCount}</span>
                    </button>
                    <button
                      onClick={handleShare}
                      className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 text-sm font-medium"
                    >
                      <Share2 size={14} className="mr-1.5" />
                      <span>Share</span>
                    </button>
                  </motion.div>
                )}
                <motion.h1
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-sans font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  {post.title}
                </motion.h1>
                {post.summary && (
                  <motion.p
                    className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed font-light italic"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    {post.summary}
                  </motion.p>
                )}
                <motion.div
                  className="py-6 border-t border-b border-gray-200/60 dark:border-gray-700/60 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {author && (
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <a
                            href={author.ContactDetails?.linkedin || "#"}
                            className="flex items-center gap-4 group hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg p-2 -m-2 transition-colors duration-200"
                          >
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                              {author.authorName?.charAt(0).toUpperCase() ||
                                "A"}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                                {author.authorName || "Unknown Author"}
                              </span>
                              <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
                                <Calendar
                                  size={14}
                                  className="mr-1.5 opacity-70"
                                />
                                <time dateTime={post.createdAt}>
                                  {formatDate(post.createdAt)}
                                </time>
                              </div>
                            </div>
                          </a>
                        </HoverCardTrigger>
                        <HoverCardContent
                          className="w-80 p-4"
                          side="bottom"
                          align="start"
                        >
                          <div className="flex gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                              {author.authorName?.charAt(0).toUpperCase() ||
                                "A"}
                            </div>
                            <div className="flex-1 space-y-2">
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white text-base">
                                  {author.authorName || "Unknown Author"}
                                </h4>
                                {author.authorProfession && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {author.authorProfession}
                                  </p>
                                )}
                              </div>
                              {author.ContactDetails && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                  {author.ContactDetails.website && (
                                    <a
                                      href={author.ContactDetails.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                                    >
                                      <FaGlobeAsia size={12} />
                                      Website
                                    </a>
                                  )}
                                  {author.ContactDetails.linkedin && (
                                    <a
                                      href={author.ContactDetails.linkedin}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                                    >
                                      <FaLinkedin size={12} />
                                      LinkedIn
                                    </a>
                                  )}
                                  {author.ContactDetails.github && (
                                    <a
                                      href={author.ContactDetails.github}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                    >
                                      <FaGithub size={12} />
                                      GitHub
                                    </a>
                                  )}
                                  {author.ContactDetails.twitter && (
                                    <a
                                      href={author.ContactDetails.twitter}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 transition-colors"
                                    >
                                      <Twitter size={12} />
                                      Twitter
                                    </a>
                                  )}
                                </div>
                              )}
                              <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                                Member since {formatDate(author.createdAt)}
                              </div>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    )}
                    <div className="flex items-center gap-4 sm:gap-6">
                      {post.minuteRead > 0 && (
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-200">
                          <div className="p-1 rounded-md bg-gray-100 dark:bg-gray-800">
                            <Clock size={14} className="opacity-70" />
                          </div>
                          <span className="text-sm font-medium">
                            {post.minuteRead} min read
                          </span>
                        </div>
                      )}
                      {post.views > 0 && (
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-200">
                          <div className="p-1 rounded-md bg-gray-100 dark:bg-gray-800">
                            <Eye size={14} className="opacity-70" />
                          </div>
                          <span className="text-sm font-medium">
                            {post.views > 1000
                              ? `${(post.views / 1000).toFixed(1)}k`
                              : post.views}{" "}
                            views
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  className="space-y-3 mt-4 sm:mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  {post.categories && post.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {post.categories.map((category) => (
                        <span
                          key={category._id}
                          className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag.tagID || tag.name}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                        >
                          <TagIcon size={8} className="mr-1" />
                          {tag.name || "Unnamed Tag"}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 mt-6 sm:mt-8 overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <div className="p-4 sm:p-6 lg:p-8">
                <div
                  className={`${proseClasses} prose-code:group relative prose-code:before:content-none prose-code:after:content-none`}
                  dangerouslySetInnerHTML={{
                    __html: post.content || "No content available",
                  }}
                />
              </div>
            </motion.div>
            <motion.div
              className="mt-6 sm:mt-8 mb-8 sm:mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <div className="flex justify-center">
                  <Link
                    to="/blog"
                    className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Blog
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.article>
        </div>
      </motion.div>
    </div>
  );
}
