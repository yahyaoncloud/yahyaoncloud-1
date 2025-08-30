import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, useSearchParams } from "@remix-run/react";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { Search, Calendar } from "lucide-react";
import { getPosts, getAllCategories } from "../Services/post.server";

// --- Meta ---
export function meta() {
  return [
    { title: "Articles - Yahya on Cloud" },
    {
      name: "description",
      content:
        "Explore technical articles on cloud computing, DevOps, and web development.",
    },
    { property: "og:title", content: "Articles - Yahya on Cloud" },
    {
      property: "og:description",
      content: "Technical articles on cloud computing and web development",
    },
  ];
}

// --- Utility: serialize MongoDB document ---
function serializePost(post) {
  return {
    _id: post._id?.toString(),
    title: String(post.title || "Untitled"),
    slug: String(post.slug || ""),
    summary: post.summary || "",
    categories: post.categories || [], // Assuming categories contain both name and slug
    createdAt:
      post.createdAt instanceof Date
        ? post.createdAt.toISOString()
        : post.createdAt,
  };
}

// --- Loader ---
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const selectedCategorySlug = url.searchParams.get("category") || "";

    const [posts, categories] = await Promise.all([
      getPosts(),
      getAllCategories()
    ]);

    const serializedPosts = posts.map(serializePost);
    return json({
      posts: serializedPosts,
      categories,
      filters: { search, selectedCategorySlug }
    });
  } catch (error) {
    console.error("Loader error:", error);
    return json({
      posts: [],
      categories: [],
      filters: { search: "", selectedCategorySlug: "" }
    });
  }
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// --- Main Component ---
export default function ArticlesListPage() {
  const { posts, categories, filters } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState(filters.selectedCategorySlug);

  const formatDate = (date) => {
    const d = new Date(date);
    return isNaN(d.getTime())
      ? "Invalid date"
      : d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
  };

  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.summary?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category slug
    if (selectedCategorySlug) {
      filtered = filtered.filter((post) =>
        post.categories?.some(cat => cat.slug === selectedCategorySlug)
      );
    }

    // Sort by date (newest first)
    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [posts, searchTerm, selectedCategorySlug]);

  // Group posts by category for display
  const groupedPosts = useMemo(() => {
    if (searchTerm || selectedCategorySlug) {
      return { "Search Results": filteredPosts };
    }

    const groups = {};
    filteredPosts.forEach((post) => {
      const category = post.categories?.[0]?.name || "Other";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(post);
    });

    return groups;
  }, [filteredPosts, searchTerm, selectedCategorySlug]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedCategorySlug) params.set("category", selectedCategorySlug);
    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedCategorySlug, setSearchParams]);

  const handleCategoryChange = (categorySlug) => {
    setSelectedCategorySlug(categorySlug);
    setSearchTerm(""); // Clear search when selecting category
  };

  return (
    <div className="min-h-screen p-4">
      <motion.div
        className="py-8 px-4 md:px-0 w-full max-w-3xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {/* Header */}
        <motion.div
          className="mb-8"
          variants={fadeIn}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Browse Articles
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Technical insights on cloud computing, DevOps, and engineering
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          className="mb-6"
          variants={fadeIn}
        >
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange("")}
              className={`px-3 py-1 text-sm rounded-full border transition-colors duration-200 ${!selectedCategorySlug
                ? "bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300"
                : "border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600"
                }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.slug}
                onClick={() => handleCategoryChange(category.slug)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors duration-200 ${selectedCategorySlug === category.slug
                  ? "bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300"
                  : "border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600"
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          className="mb-8"
          variants={fadeIn}
        >
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </motion.div>

        {/* Articles List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredPosts.length === 0 ? (
            <motion.div
              className="text-center py-12"
              variants={itemVariants}
            >
              <Search className="mx-auto w-8 h-8 text-zinc-400 mb-3" />
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
                No articles found
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Try adjusting your search terms or category filter
              </p>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedPosts).map(([categoryName, categoryPosts]) => (
                <motion.div key={categoryName} variants={itemVariants}>
                  {!searchTerm && !selectedCategorySlug && (
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                      {categoryName}
                    </h2>
                  )}
                  <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
                    {categoryPosts.map((post) => (
                      <div
                        key={post._id}
                        className="py-3 md:py-4"
                      >
                        <Link
                          to={`/blog/post/${post.slug}`}
                          className="group block"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-2">
                            <span className="relative font-medium text-indigo-600 dark:text-indigo-400 leading-tight transition-colors duration-200">
                              {post.title}
                              <span className="absolute bottom-0 left-0 w-0 h-px bg-current transition-all duration-200 group-hover:w-full" />
                            </span>

                            <div className="hidden md:flex items-center flex-1 mx-3">
                              <span className="h-px w-full bg-zinc-300 dark:bg-zinc-700" />
                            </div>

                            <div className="flex items-center gap-2 text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mt-1 md:mt-0">
                              <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                              <span>{formatDate(post.createdAt)}</span>
                            </div>
                          </div>
                          {post.summary && (
                            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                              {post.summary}
                            </p>
                          )}
                        </Link>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Results Summary */}
        {filteredPosts.length > 0 && (
          <motion.div
            className="mt-8 text-center"
            variants={fadeIn}
          >
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {searchTerm || selectedCategorySlug
                ? `Found ${filteredPosts.length} article${filteredPosts.length === 1 ? '' : 's'}${searchTerm ? ` matching "${searchTerm}"` : ''
                }${selectedCategorySlug
                  ? ` in ${categories.find(cat => cat.slug === selectedCategorySlug)?.name || 'category'}`
                  : ''}`
                : `${filteredPosts.length} article${filteredPosts.length === 1 ? '' : 's'} published`
              }
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}