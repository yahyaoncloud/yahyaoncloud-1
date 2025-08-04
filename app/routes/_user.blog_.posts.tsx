import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, useSearchParams } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  TagIcon,
  Clock,
  Eye,
  Heart,
  Search,
  Filter,
  Grid,
  List,
  TrendingUp,
  BookOpen,
  User,
  ChevronRight,
  Star,
  Zap,
} from "lucide-react";
import { useTheme } from "../Contexts/ThemeContext";
import {
  getPosts,
  getAllCategories,
  getAllTags,
} from "../Services/post.server";
import type { Author, Post, Category, Tag } from "../Types/types";
import { useState, useEffect, useMemo } from "react";
import dummyImage from "../assets/yahya_glass.png";

// --- Meta ---
export function meta() {
  return [
    { title: "Articles - Yahya on Cloud" },
    {
      name: "description",
      content:
        "Explore technical articles, insights, and tutorials on cloud computing, DevOps, and modern web development.",
    },
    { property: "og:title", content: "Articles - Yahya on Cloud" },
    {
      property: "og:description",
      content:
        "Technical articles and insights on cloud computing and web development",
    },
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
    featured: post.featured || false,
    trending: post.trending || false,
  };
}

// --- Loader ---
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const category = url.searchParams.get("category") || "";
    const tag = url.searchParams.get("tag") || "";
    const sortBy = url.searchParams.get("sort") || "newest";

    const posts = await getPosts();
    const categories = await getAllCategories();
    const tags = await getAllTags();

    const serializedPosts = posts.map(serializePost);

    return json({
      posts: serializedPosts,
      categories: categories || [],
      tags: tags || [],
      filters: { search, category, tag, sortBy },
    });
  } catch (error) {
    console.error("Loader error:", error);
    return json({
      posts: [],
      categories: [],
      tags: [],
      filters: { search: "", category: "", tag: "", sortBy: "newest" },
    });
  }
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  hover: {
    y: -5,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

// --- Components ---
const PostCard = ({ post, index }: { post: Post; index: number }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid date";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  return (
    <motion.div variants={cardVariants} whileHover="hover" className="group">
      <Link to={`/blog/${post.slug}`} className="block">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-300 h-full">
          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            <motion.img
              src={post.coverImage || dummyImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {post.featured && (
                <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                  <Star className="w-3 h-3" />
                  Featured
                </span>
              )}
              {post.trending && (
                <span className="flex items-center gap-1 px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  Trending
                </span>
              )}
            </div>

            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 ${
                isLiked
                  ? "bg-red-500/80 text-white"
                  : "bg-white/80 text-gray-700 hover:bg-white/90"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Categories */}
            {post.categories && post.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {post.categories.slice(0, 2).map((category) => (
                  <span
                    key={category._id}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-md"
                  >
                    {category.name}
                  </span>
                ))}
                {post.categories.length > 2 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    +{post.categories.length - 2} more
                  </span>
                )}
              </div>
            )}

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
              {post.title}
            </h3>

            {/* Summary */}
            {post.summary && (
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
                {post.summary}
              </p>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.tagID || tag.name}
                    className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-md"
                  >
                    <TagIcon className="w-2 h-2 mr-1" />
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Meta */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                {post.minuteRead > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{post.minuteRead} min</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Heart
                    className={`w-4 h-4 ${
                      isLiked ? "fill-current text-red-500" : ""
                    }`}
                  />
                  <span>{likeCount}</span>
                </div>
                {post.views > 0 && (
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>
                      {post.views > 1000
                        ? `${(post.views / 1000).toFixed(1)}k`
                        : post.views}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const FeaturedPost = ({ post }: { post: Post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid date";
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 shadow-2xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="absolute inset-0">
        <img
          src={post.coverImage || dummyImage}
          alt={post.title}
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/80 via-purple-600/80 to-pink-600/80"></div>
      </div>

      <div className="relative p-8 md:p-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-medium">
            <Zap className="w-4 h-4" />
            Featured Article
          </span>
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-3 py-1.5 backdrop-blur-md rounded-full transition-all duration-200 ${
              isLiked
                ? "bg-red-500/80 text-white"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            <span className="text-sm font-medium">{likeCount}</span>
          </button>
        </div>

        <Link to={`/blog/${post.slug}`} className="block group">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight group-hover:text-yellow-200 transition-colors duration-200">
            {post.title}
          </h2>

          {post.summary && (
            <p className="text-white/90 text-lg mb-6 leading-relaxed max-w-3xl">
              {post.summary}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
              {post.minuteRead > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{post.minuteRead} min read</span>
                </div>
              )}
              {post.views > 0 && (
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  <span>
                    {post.views > 1000
                      ? `${(post.views / 1000).toFixed(1)}k`
                      : post.views}{" "}
                    views
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-white group-hover:text-yellow-200 transition-colors duration-200">
              <span className="font-medium">Read Article</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
};

// --- Main Component ---
export default function ArticlesListPage() {
  const { theme } = useTheme();
  const { posts, categories, tags, filters } = useLoaderData<{
    posts: Post[];
    categories: Category[];
    tags: Tag[];
    filters: { search: string; category: string; tag: string; sortBy: string };
  }>();

  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [selectedCategory, setSelectedCategory] = useState(filters.category);
  const [selectedTag, setSelectedTag] = useState(filters.tag);
  const [sortBy, setSortBy] = useState(filters.sortBy);

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let filtered = [...posts];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.summary?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((post) =>
        post.categories?.some((cat) => cat.slug === selectedCategory)
      );
    }

    // Tag filter
    if (selectedTag) {
      filtered = filtered.filter((post) =>
        post.tags?.some((tag) => tag.name === selectedTag)
      );
    }

    // Sort
    switch (sortBy) {
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "popular":
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "liked":
        filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      default: // newest
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    return filtered;
  }, [posts, searchTerm, selectedCategory, selectedTag, sortBy]);

  const featuredPost = posts.find((post) => post.featured);
  const trendingPosts = posts.filter((post) => post.trending).slice(0, 3);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedTag) params.set("tag", selectedTag);
    if (sortBy !== "newest") params.set("sort", sortBy);

    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedCategory, selectedTag, sortBy, setSearchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <motion.div
        className="relative py-16 md:py-24 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-pink-600/10"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-indigo-800 dark:text-indigo-300 mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Technical Articles & Insights
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Explore the latest in cloud computing, DevOps, and modern web
            development
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full border border-gray-200 dark:border-gray-700">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {posts.length} Articles
              </span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full border border-gray-200 dark:border-gray-700">
              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Expert Authors
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Featured Post */}
      {featuredPost && (
        <motion.div
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <FeaturedPost post={featuredPost} />
        </motion.div>
      )}

      {/* Filters and Search */}
      <motion.div
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
                <option value="liked">Most Liked</option>
              </select>

              {/* View Mode */}
              <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || selectedCategory || selectedTag) && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Active filters:
              </span>
              {searchTerm && (
                <span className="flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm("")}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm">
                  Category:{" "}
                  {categories.find((c) => c.slug === selectedCategory)?.name}
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="hover:text-purple-600 dark:hover:text-purple-400"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedTag && (
                <span className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm">
                  Tag: {selectedTag}
                  <button
                    onClick={() => setSelectedTag("")}
                    className="hover:text-green-600 dark:hover:text-green-400"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                  setSelectedTag("");
                }}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Trending Posts */}
      {trendingPosts.length > 0 && (
        <motion.div
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Trending Now
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingPosts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <PostCard post={post} index={index} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Results Counter */}
      <motion.div
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400">
            {filteredPosts.length === 0 ? (
              "No articles found matching your criteria"
            ) : (
              <>
                Showing{" "}
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {filteredPosts.length}
                </span>{" "}
                article{filteredPosts.length !== 1 ? "s" : ""}
                {(searchTerm || selectedCategory || selectedTag) &&
                  " matching your filters"}
              </>
            )}
          </p>
        </div>
      </motion.div>

      {/* Posts Grid/List */}
      <motion.div
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="wait">
          {filteredPosts.length === 0 ? (
            <motion.div
              key="no-results"
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                No articles found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Try adjusting your search terms or filters to find what you're
                looking for.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                  setSelectedTag("");
                }}
                className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear All Filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={`${viewMode}-${filteredPosts.length}`}
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
                  : "space-y-6"
              }
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                >
                  {viewMode === "grid" ? (
                    <PostCard post={post} index={index} />
                  ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300">
                      <div className="md:flex">
                        <div className="md:w-64 h-48 md:h-auto">
                          <img
                            src={post.coverImage || dummyImage}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              {post.categories &&
                                post.categories.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {post.categories
                                      .slice(0, 2)
                                      .map((category) => (
                                        <span
                                          key={category._id}
                                          className="inline-flex items-center px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-md"
                                        >
                                          {category.name}
                                        </span>
                                      ))}
                                  </div>
                                )}

                              <Link to={`/blog/${post.slug}`} className="group">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                                  {post.title}
                                </h3>
                              </Link>

                              {post.summary && (
                                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                                  {post.summary}
                                </p>
                              )}

                              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    {new Date(
                                      post.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                {post.minuteRead > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{post.minuteRead} min</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Heart className="w-4 h-4" />
                                  <span>{post.likes || 0}</span>
                                </div>
                                {post.views > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Eye className="w-4 h-4" />
                                    <span>
                                      {post.views > 1000
                                        ? `${(post.views / 1000).toFixed(1)}k`
                                        : post.views}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-indigo-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-pink-400/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
