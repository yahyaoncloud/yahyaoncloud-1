import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../components/ui/hover-card";
import "../styles/md-button.css";
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
  BookOpen,
  User,
} from "lucide-react";
import { useTheme } from "../Contexts/ThemeContext";
import { getAuthorByAuthorId, getPostBySlug } from "../Services/post.server";
import { marked } from "marked";
import type { Author, Post } from "../Types/types";
import { proseClasses } from "../styles/prose";
import { useState, useEffect, useRef } from "react";
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

// Custom hook for enhancing blog content with improved animations
export function useEnhanceBlogContent() {
  useEffect(() => {
    const article = document.querySelector("article") || document;
    // --- TABLE WRAP ---
    article.querySelectorAll("table").forEach((table) => {
      if (table.parentElement?.classList.contains("overflow-x-auto")) return;
      const wrapper = document.createElement("div");
      wrapper.className =
        "overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800";
      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(table);
      table.className +=
        " min-w-full divide-y divide-gray-200 dark:divide-gray-700";
    });

    // Add copy buttons and language indicators to code blocks
    article.querySelectorAll("pre").forEach((pre) => {
      if (pre.querySelector(".copy-button")) return;

      // Create wrapper if it doesn't exist
      if (!pre.parentElement?.classList.contains("code-block-wrapper")) {
        const wrapper = document.createElement("div");
        wrapper.className = "code-block-wrapper relative";
        pre.parentNode?.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
      }

      // Get language from code element class
      const codeElement = pre.querySelector("code");
      let language = "code";
      if (codeElement) {
        const classList = Array.from(codeElement.classList);
        const langClass = classList.find((cls) => cls.startsWith("language-"));
        if (langClass) {
          language = langClass.replace("language-", "");
        }
      }

      // Create language indicator
      const langIndicator = document.createElement("div");
      langIndicator.className = "language-indicator";
      langIndicator.textContent = language;

      // Create copy button
      const button = document.createElement("button");
      button.className = "copy-button";
      button.setAttribute("aria-label", "Copy code to clipboard");

      // Set copy icon
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="m5 15-2 0a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      `;

      // Handle copy functionality
      button.addEventListener("click", async () => {
        if (!codeElement) return;
        const codeText = codeElement.textContent;
        try {
          await navigator.clipboard.writeText(codeText);
          // Show success state
          const originalHTML = button.innerHTML;
          button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          `;
          button.classList.add("copied");
          // Reset after 2.5 seconds
          setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove("copied");
          }, 2500);
        } catch (error) {
          console.error("Failed to copy code:", error);
        }
      });

      // Add hover effects to wrapper
      const wrapper = pre.parentElement;
      wrapper.addEventListener("mouseenter", () => {
        button.classList.add("visible");
      });
      wrapper.addEventListener("mouseleave", () => {
        button.classList.remove("visible");
      });

      // Add button and language indicator to wrapper
      wrapper.appendChild(button);
      wrapper.appendChild(langIndicator);
    });
  }, []);
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.25, 0, 1],
    },
  },
};

const buttonVariants = {
  hover: {
    scale: 1.05,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
    transition: { duration: 0.2 },
  },
  tap: { scale: 0.95 },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.25, 0, 1],
    },
  },
};

// --- Component ---
export default function PostPage() {
  const { theme } = useTheme();
  const { post, author } = useLoaderData<{
    post: Post;
    author: Author | null;
  }>();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likes || 0);
  const [isScrolled, setIsScrolled] = useState(false);
  const contentRef = useRef(null);
  const metaRef = useRef(null);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, -100]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.7]);
  const contentInView = useInView(contentRef, { once: true, margin: "-100px" });
  const metaInView = useInView(metaRef, { once: true, margin: "-50px" });

  useEnhanceBlogContent();

  // Handle scroll for floating navigation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Post not found
          </h1>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/blog"
              className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
              Back to Blog
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid date";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    // Add API call here to update likes
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
        // You could add a toast notification here
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
    <div className="max-w-xl md:max-w-6xl min-h-screen bg-gradient-to-br mx-auto from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Floating Navigation */}
      <motion.div
        className={`fixed top-16 sm:top-18 left-2 right-2 sm:left-4 sm:right-4 z-50 transition-all duration-500 ${
          isScrolled ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0"
        }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: isScrolled ? 1 : 0, y: isScrolled ? 0 : -20 }}
      >
        <div className="mx-auto max-w-5xl">
          <motion.div
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative flex flex-col md:flex-row sm:items-center justify-between px-3 sm:px-6 py-3 sm:py-4 gap-3 sm:gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/blog"
                  className="flex items-center gap-2 sm:gap-3 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 font-medium text-sm sm:text-base"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Back to Blog</span>
                </Link>
              </motion.div>
              <div className="flex-1 sm:px-4">
                <h1 className="text-xs sm:text-sm items-center text-pink-500 md:justify-center italic gap-4 flex font-serif text-center  dark:text-indigo-300 truncate">
                  <span>Now Reading:</span> <p>{post.title}</p>
                </h1>
              </div>

              <div className=" flex items-center gap-2 sm:gap-3">
                <motion.button
                  onClick={handleLike}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-300 font-medium text-xs sm:text-sm ${
                    isLiked
                      ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 shadow-md"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 shadow-sm hover:shadow-md"
                  }`}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Heart
                    className={`w-3 h-3 sm:w-4 sm:h-4 ${
                      isLiked ? "fill-current" : ""
                    }`}
                  />
                  <span className="hidden sm:inline">{likeCount}</span>
                </motion.button>

                <motion.button
                  onClick={handleShare}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 font-medium shadow-sm hover:shadow-md text-xs sm:text-sm"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Share</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Hero Section */}
      <motion.div
        className="relative overflow-hidden mx-auto"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        {post.coverImage && (
          <div className="relative h-[600px]  ">
            <motion.img
              src={dummyImage}
              alt={post.title}
              className="w-full h-full object-cover"
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: [0.25, 0.25, 0, 1] }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

            {/* Hero Content Overlay */}
            <motion.div
              className="absolute inset-0 flex items-end"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 1, ease: [0.25, 0.25, 0, 1] }}
            >
              <div className="w-full p-4 sm:p-6 md:p-8 lg:p-12">
                <div className="mx-auto flex flex-col gap-6 max-w-5xl">
                  <div className="flex flex-col md:gap-3 ">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      variants={buttonVariants}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      <Link
                        to="/blog"
                        className="flex w-20 items-center gap-2 p-2 bg-white/10 backdrop-blur-xl rounded-lg text-white hover:bg-white/20 transition-all duration-300 border border-white/20 shadow-lg font-medium text-sm"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                      </Link>
                    </motion.div>
                  </div>

                  <motion.h1
                    className="text-5xl md:text-4xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 1,
                      duration: 1,
                      ease: [0.25, 0.25, 0, 1],
                    }}
                  >
                    {post.title}
                  </motion.h1>

                  {post.summary && (
                    <motion.p
                      className="text-sm sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-6 sm:mb-8 leading-relaxed max-w-4xl font-light"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2, duration: 0.8 }}
                    >
                      {post.summary}
                    </motion.p>
                  )}

                  <motion.div
                    className="flex  flex-row mb-10 md:mb-4 items-start sm:items-center gap-3 sm:gap-4"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 0.8 }}
                  >
                    <motion.button
                      onClick={handleLike}
                      className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl backdrop-blur-xl transition-all duration-300 border font-medium shadow-lg text-sm sm:text-base ${
                        isLiked
                          ? "bg-red-500/20 border-red-400/50 text-white"
                          : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                      }`}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Heart
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          isLiked ? "fill-current" : ""
                        }`}
                      />
                      <span>{likeCount}</span>
                    </motion.button>

                    <motion.button
                      onClick={handleShare}
                      className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-xl rounded-lg sm:rounded-xl text-white hover:bg-white/20 transition-all duration-300 border border-white/20 shadow-lg font-medium text-sm sm:text-base"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Share</span>
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="relative mx-auto z-10 max-w-xl md:max-w-5xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mx-auto max-w-5xl px-3 sm:px-4 md:px-6 lg:px-8 -mt-2 sm:-mt-4">
          {/* Article Header Card (for posts without cover image) */}
          {!post.coverImage && (
            <motion.div
              className="mb-6 sm:mb-8 bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              variants={cardVariants}
            >
              <div className="p-4 sm:p-6 md:p-8 lg:p-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/blog"
                      className="flex items-center gap-2 sm:gap-3 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 font-medium text-sm sm:text-base"
                    >
                      <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Back to Blog</span>
                    </Link>
                  </motion.div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <motion.button
                      onClick={handleLike}
                      className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-300 font-medium shadow-sm hover:shadow-md text-xs sm:text-sm ${
                        isLiked
                          ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Heart
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          isLiked ? "fill-current" : ""
                        }`}
                      />
                      <span>{likeCount}</span>
                    </motion.button>

                    <motion.button
                      onClick={handleShare}
                      className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 font-medium shadow-sm hover:shadow-md text-xs sm:text-sm"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Share</span>
                    </motion.button>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-indigo-800 dark:text-indigo-300 mb-6 sm:mb-8 leading-tight">
                  {post.title}
                </h1>

                {post.summary && (
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed font-light italic">
                    {post.summary}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Author & Meta Information */}
          <motion.div
            ref={metaRef}
            className="mb-6 sm:mb-8 bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            variants={cardVariants}
            initial="hidden"
            animate={metaInView ? "visible" : "hidden"}
          >
            <div className="p-4 sm:p-6 md:p-8 lg:p-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 sm:gap-8">
                {/* Author Info */}
                {author && (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <motion.button
                        className="flex items-center gap-3 sm:gap-6 group hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl sm:rounded-2xl p-2 sm:p-4 -m-2 sm:-m-4 transition-all duration-300 text-left"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="relative">
                          <motion.div
                            className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-xl"
                            whileHover={{ rotate: 5, scale: 1.1 }}
                            transition={{ duration: 0.3 }}
                          >
                            {author.authorName?.charAt(0).toUpperCase() || "A"}
                          </motion.div>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-gray-900 dark:text-white text-lg sm:text-xl group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200 truncate">
                            {author.authorName || "Unknown Author"}
                          </span>
                          {author.authorProfession && (
                            <span className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-1 sm:mb-2 truncate">
                              {author.authorProfession}
                            </span>
                          )}
                          <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                            <time
                              dateTime={post.createdAt}
                              className="truncate"
                            >
                              {formatDate(post.createdAt)}
                            </time>
                          </div>
                        </div>
                      </motion.button>
                    </HoverCardTrigger>
                    <HoverCardContent
                      className="w-80 sm:w-96 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xl border-0 bg-white dark:bg-gray-800"
                      side="bottom"
                      align="start"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex gap-4 sm:gap-6">
                          <motion.div
                            className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-xl flex-shrink-0"
                            whileHover={{ rotate: 5, scale: 1.05 }}
                          >
                            {author.authorName?.charAt(0).toUpperCase() || "A"}
                          </motion.div>
                          <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white text-lg sm:text-xl truncate">
                                {author.authorName || "Unknown Author"}
                              </h4>
                              {author.authorProfession && (
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">
                                  {author.authorProfession}
                                </p>
                              )}
                            </div>

                            {author.ContactDetails && (
                              <div className="flex flex-wrap gap-2 sm:gap-3">
                                {author.ContactDetails.website && (
                                  <motion.a
                                    href={author.ContactDetails.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg sm:rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors font-medium shadow-sm"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <FaGlobeAsia size={14} />
                                    <span className="hidden sm:inline">
                                      Website
                                    </span>
                                  </motion.a>
                                )}
                                {author.ContactDetails.linkedin && (
                                  <motion.a
                                    href={author.ContactDetails.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg sm:rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors font-medium shadow-sm"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <FaLinkedin size={14} />
                                    <span className="hidden sm:inline">
                                      LinkedIn
                                    </span>
                                  </motion.a>
                                )}
                                {author.ContactDetails.github && (
                                  <motion.a
                                    href={author.ContactDetails.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg sm:rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium shadow-sm"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <FaGithub size={14} />
                                    <span className="hidden sm:inline">
                                      GitHub
                                    </span>
                                  </motion.a>
                                )}
                              </div>
                            )}

                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-600">
                              Member since {formatDate(author.createdAt)}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </HoverCardContent>
                  </HoverCard>
                )}

                {/* Meta Stats */}
                <motion.div
                  className="flex flex-wrap items-center gap-4 sm:gap-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  {post.minuteRead > 0 && (
                    <motion.div
                      className="flex items-center gap-2 sm:gap-3 text-gray-600 dark:text-gray-400"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 shadow-md">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base sm:text-lg font-bold">
                          {post.minuteRead} min
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                          read time
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {post.views > 0 && (
                    <motion.div
                      className="flex items-center gap-2 sm:gap-3 text-gray-600 dark:text-gray-400"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 shadow-md">
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base sm:text-lg font-bold">
                          {post.views > 1000
                            ? `${(post.views / 1000).toFixed(1)}k`
                            : post.views}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                          views
                        </span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </div>

              {/* Categories and Tags */}
              <motion.div
                className="mt-6 sm:mt-8 space-y-4 sm:space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, staggerChildren: 0.1 }}
              >
                {post.categories && post.categories.length > 0 && (
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Categories
                    </h3>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {post.categories.map((category, index) => (
                        <motion.span
                          key={category._id}
                          className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 dark:from-indigo-900/30 dark:to-purple-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-sm"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {category.name}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {post.tags && post.tags.length > 0 && (
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {post.tags.map((tag, index) => (
                        <motion.span
                          key={tag.tagID || tag.name}
                          className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.8 + index * 0.05 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <TagIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-2" />
                          {tag.name || "Unnamed Tag"}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Article Content */}
          <motion.article
            ref={contentRef}
            className="mb-8 sm:mb-12 bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            variants={cardVariants}
            initial="hidden"
            animate={contentInView ? "visible" : "hidden"}
          >
            <div className="p-4 sm:p-6 md:p-8 lg:p-12">
              <motion.div
                className={proseClasses}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </motion.article>

          {/* Back to Blog CTA */}
          <motion.div
            className="text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/blog"
                className="inline-flex items-center gap-3 sm:gap-4 px-6 sm:px-8 py-3 sm:py-4 bg-indigo-800 dark:bg-indigo-600 dark:text-white text-slate-900 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Back to Blog</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
