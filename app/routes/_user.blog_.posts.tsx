import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, useSearchParams } from "@remix-run/react";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { Search, Calendar } from "lucide-react";
import { getPosts } from "../Services/post.server";

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
    const posts = await getPosts();
    const serializedPosts = posts.map(serializePost);
    return json({ posts: serializedPosts, filters: { search } });
  } catch (error) {
    console.error("Loader error:", error);
    return json({ posts: [], filters: { search: "" } });
  }
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// --- Main Component ---
export default function ArticlesListPage() {
  const { posts, filters } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(filters.search);

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
    return searchTerm
      ? posts.filter((post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      : posts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [posts, searchTerm]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    setSearchParams(params, { replace: true });
  }, [searchTerm, setSearchParams]);

  return (
    <div className="md:h-[80vh]  overflow-hidden">
      <motion.div
        className="py-8 px-6 md:px-8 w-full max-w-7xl mx-auto flex flex-col h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-indigo-800 dark:text-indigo-300 mb-6">
          Technical Articles & Insights
        </h1>
        <div className="relative mb-6 w-full max-w-7xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <motion.div
          className="flex-1 overflow-y-auto auto-hide-scrollbar w-full max-w-3xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredPosts.length === 0 ? (
            <div className="text-center py-8">
              <Search className="mx-auto w-10 h-10 text-zinc-400 mb-4" />
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                No articles found
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Try adjusting your search terms.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post, index) => (
                <motion.div key={post._id} variants={itemVariants}>
                  <Link
                    to={`/blog/post/${post.slug}`}
                    className="block   border-b border-zinc-200 dark:border-zinc-700 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4 w-full justify-between">
                      <h3 className="md:text-nowrap text-xs w-auto md:text-sm font-semibold text-zinc-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline">
                        {post.title}
                      </h3>
                      <span className="w-full h-[1px] bg-zinc-500 dark:bg-zinc-400" />
                      <div className="flex items-center gap-2 text-xs md:text-nowrap text-zinc-500 dark:text-zinc-400">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
        {/* <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-10 w-72 h-72 bg-indigo-400/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl"></div>
          <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-indigo-400/5 rounded-full blur-3xl"></div>
        </div> */}
      </motion.div>
    </div>
  );
}
