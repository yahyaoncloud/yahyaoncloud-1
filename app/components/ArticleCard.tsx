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
    excerpt?: string;
    coverImage?: string;
    createdAt: string;
    category: string;
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

  // Truncate excerpt to approximately two lines (assuming ~100-120 characters for two lines in typical layouts)
  const truncateExcerpt = (text: string) => {
    const maxLength = 120; // Rough estimate for two lines
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };
  const truncateTitle = (text: string) => {
    const maxLength = 50; // Rough estimate for two lines
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  return (
    <motion.div
      className={`rounded-lg overflow-hidden shadow-lg transition-all duration-300 ${
        theme === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      } hover:shadow-xl hover:-translate-y-1 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300 }}
      whileHover={{ scale: 1.02 }}
    >
      <Link to={`/admin/post/${post._id}`} className="block h-full">
        {post.coverImage && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {post.category && (
              <span
                className={`absolute top-3 left-3 px-2 py-1 text-xs font-medium rounded-full ${
                  theme === "dark"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                }`}
              >
                {post.category}
              </span>
            )}
          </div>
        )}
        <div className="p-5 flex flex-col h-full">
          <h3
            className={`font-bold text-lg mb-2 transition-colors ${
              theme === "dark"
                ? "text-white group-hover:text-blue-300"
                : "text-gray-900 group-hover:text-blue-500"
            }`}
          >
            {truncateTitle(post.title)}
          </h3>

          {post.excerpt && (
            <p
              className={`text-sm mb-4 line-clamp-2 flex-grow ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {truncateExcerpt(post.excerpt || post.summary)}
            </p>
          )}

          <div className="flex justify-between items-center text-xs mt-auto">
            <div
              className={`flex items-center ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <Calendar size={14} className="mr-1" />
              <span>{formatDate(post.createdAt)}</span>
            </div>

            <div
              className={`flex items-center font-medium ${
                theme === "dark" ? "text-blue-400" : "text-blue-500"
              }`}
            >
              <span>Read</span>
              <ArrowRight size={14} className="ml-1" />
            </div>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className={`text-xs px-2 py-1 rounded-full ${
                    theme === "dark"
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-100 text-gray-600"
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
