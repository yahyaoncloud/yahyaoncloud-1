import { Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import { useTheme } from "../Contexts/ThemeContext";

interface ArticleCardProps {
  post: {
    _id: string;
    title: string;
    slug?: string;
    summary: string;
    author: string;
    excerpt?: string;
    coverImage?: string;
    createdAt: Date;
    categories: string[];
    types?: string;
    tags?: string[];
  };
  className?: string;
}

export default function ArticleCard({
  post,
  className = "",
}: ArticleCardProps) {
  const { theme } = useTheme();
  if (!post || !post._id) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateExcerpt = (text: string) => {
    const maxLength = 120;
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  const truncateTitle = (text: string) => {
    const maxLength = 50;
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  return (
    <motion.div
      className={`rounded-md overflow-hidden shadow-lg transition-all duration-300 ${
        theme === "dark"
          ? "bg-zinc-800 border-zinc-700"
          : "bg-zinc-50 border-zinc-200"
      } hover:shadow-xl hover:-translate-y-1 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300 }}
      whileHover={{ scale: 1.02 }}
    >
      <Link
        prefetch="render"
        to={`/blog/post/${post.slug}`}
        className="block h-full"
      >
        {post.coverImage && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {post.categories && post.categories.length > 0 && (
              <div className="absolute top-3 left-3 flex flex-wrap justify-between gap-2">
                {post.categories.map((cat, index) => (
                  <>
                    <span
                      key={`${cat}-${index}`}
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        theme === "dark"
                          ? "bg-indigo-600 text-white"
                          : "bg-indigo-500 text-white"
                      }`}
                    >
                      {cat}
                    </span>
                    {/* <span>{post}</span> */}
                  </>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="p-5 flex flex-col h-full">
          <h3
            className={`font-bold text-lg mb-2 transition-colors ${
              theme === "dark"
                ? "text-white group-hover:text-indigo-300"
                : "text-zinc-900 group-hover:text-indigo-500"
            }`}
          >
            {truncateTitle(post.title)}
          </h3>

          {post.excerpt && (
            <p
              className={`text-sm mb-4 line-clamp-2 flex-grow ${
                theme === "dark" ? "text-zinc-300" : "text-zinc-600"
              }`}
            >
              {truncateExcerpt(post.excerpt || post.summary)}
            </p>
          )}

          <div className="flex justify-between items-center text-xs mt-auto">
            <div
              className={`flex items-center ${
                theme === "dark" ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              <Calendar size={14} className="mr-1" />
              <span>{formatDate(post?.createdAt)}</span>
            </div>

            <div
              className={`flex items-center font-medium ${
                theme === "dark" ? "text-indigo-400" : "text-indigo-500"
              }`}
            >
              <span>Read</span>
              <ArrowRight size={14} className="ml-1" />
            </div>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {post.tags.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className={`text-xs px-2 py-1 rounded-full ${
                    theme === "dark"
                      ? "bg-zinc-700 text-zinc-300"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
