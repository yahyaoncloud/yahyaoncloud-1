import { useState } from "react";
import { useTheme } from "../Contexts/ThemeContext";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Heart,
  ExternalLink,
  Search,
  Filter,
  TrendingUp,
  Clock,
  BookOpen,
  Grid3X3,
  List,
  Star,
  Eye,
} from "lucide-react";
import ArticleCard from "../components/ArticleCard";
import { environment } from "~/environments/environment";
import type { Category, Post } from "../Types/types";
import dummyImage from "../assets/yahya_glass.png";

// Helper function to add emojis and colors to categories
function getCategoryEmoji(categoryName: string): string {
  const emojiMap: { [key: string]: string } = {
    Technology: "💻",
    "Web Development": "🌐",
    "Cloud Computing": "☁️",
    Programming: "⚡",
    Tutorial: "📚",
    React: "⚛️",
    JavaScript: "🟨",
    DevOps: "🔧",
    AI: "🤖",
    "Machine Learning": "🧠",
    Database: "🗄️",
    Mobile: "📱",
    Design: "🎨",
    Security: "🔒",
    Performance: "🚀",
    Testing: "🧪",
    Career: "💼",
    News: "📰",
    Opinion: "💭",
    Review: "⭐",
  };

  return emojiMap[categoryName] || "📝";
}

function getCategoryColor(categoryName: string): string {
  const colorMap: { [key: string]: string } = {
    Technology: "from-blue-500 to-blue-600",
    "Web Development": "from-green-500 to-green-600",
    "Cloud Computing": "from-sky-500 to-sky-600",
    Programming: "from-purple-500 to-purple-600",
    Tutorial: "from-orange-500 to-orange-600",
    React: "from-cyan-500 to-cyan-600",
    JavaScript: "from-yellow-500 to-yellow-600",
    DevOps: "from-red-500 to-red-600",
    AI: "from-pink-500 to-pink-600",
    "Machine Learning": "from-indigo-500 to-indigo-600",
    Database: "from-emerald-500 to-emerald-600",
    Mobile: "from-teal-500 to-teal-600",
    Design: "from-rose-500 to-rose-600",
    Security: "from-gray-500 to-gray-600",
    Performance: "from-lime-500 to-lime-600",
    Testing: "from-violet-500 to-violet-600",
    Career: "from-amber-500 to-amber-600",
    News: "from-slate-500 to-slate-600",
    Opinion: "from-stone-500 to-stone-600",
    Review: "from-zinc-500 to-zinc-600",
  };

  return colorMap[categoryName] || "from-gray-500 to-gray-600";
}

// Loader function to fetch all articles from /posts
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const [postsRes, categoriesRes] = await Promise.all([
      fetch(`${environment.GO_BACKEND_URL}/posts`),
      fetch(`${environment.GO_BACKEND_URL}/categories`),
    ]);

    const posts = await postsRes.json();
    console.log("Posts received:", posts);

    const categories = await categoriesRes.json();

    return json({ posts, categories });
  } catch (error) {
    console.error("Loader error:", error);
    return json({ posts: [], categories: [] }, { status: 500 });
  }
}

export default function Homepage() {
  const { theme } = useTheme();
  const { posts, categories } = useLoaderData<typeof loader>();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter and search logic
  const filteredPosts = posts.filter((post: Post) => {
    const matchesCategory = selectedCategory
      ? categories.find((c) => c.id === post.categoryId)?.name ===
        selectedCategory
      : true;

    const matchesSearch = searchTerm
      ? post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.summary?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    return matchesCategory && matchesSearch;
  });

  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    // For popular, you could use view count, likes, etc. For now, using recent as fallback
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-900";
  const subtextColor = theme === "dark" ? "text-gray-400" : "text-gray-600";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";
  const bgColor = theme === "dark" ? "bg-gray-900" : "bg-gray-50";
  const cardBg = theme === "dark" ? "bg-gray-800" : "bg-white";

  // Get featured categories with enhanced data
  const featuredCategories = categories
    .map((cat) => ({
      ...cat,
      postCount: posts.filter(
        (p) => categories.find((c) => c.id === p.categoryId)?.name === cat.name
      ).length,
      emoji: getCategoryEmoji(cat.name),
      color: getCategoryColor(cat.name),
    }))
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, 8);

  return (
    <div className={`min-h-screen ${bgColor}`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-8">
              <Star className="w-4 h-4 text-yellow-500 mr-2" />
              <span className={`text-sm font-medium ${textColor}`}>
                Welcome to the Knowledge Hub
              </span>
            </div>

            <h1
              className={`text-6xl md:text-7xl font-bold mb-8 ${textColor} leading-tight`}
            >
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Discover
              </span>
              <br />
              Tech Insights
            </h1>

            <p
              className={`text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed ${subtextColor}`}
            >
              Deep dive into the latest technologies, frameworks, and
              development practices. From tutorials to industry insights, find
              everything you need to level up your skills.
            </p>

            {/* Enhanced Search Bar */}
            <div className="max-w-3xl mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative">
                <Search
                  className={`absolute left-6 top-1/2 transform -translate-y-1/2 ${subtextColor} group-hover:text-blue-500 transition-colors duration-200`}
                  size={24}
                />
                <input
                  type="text"
                  placeholder="Search for articles, tutorials, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-16 pr-6 py-6 rounded-3xl border-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                    theme === "dark"
                      ? "bg-gray-800/80 backdrop-blur-sm border-gray-700 text-gray-100 placeholder-gray-400"
                      : "bg-white/80 backdrop-blur-sm border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            <div
              className={`${cardBg} rounded-3xl p-8 border ${borderColor} text-center group hover:scale-105 transition-transform duration-300 shadow-lg`}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <BookOpen className="text-white" size={32} />
              </div>
              <div className={`text-4xl font-bold mb-2 ${textColor}`}>
                {posts.length}
              </div>
              <div className={`${subtextColor} font-medium`}>
                Articles Published
              </div>
            </div>

            <div
              className={`${cardBg} rounded-3xl p-8 border ${borderColor} text-center group hover:scale-105 transition-transform duration-300 shadow-lg`}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <Filter className="text-white" size={32} />
              </div>
              <div className={`text-4xl font-bold mb-2 ${textColor}`}>
                {categories.length}
              </div>
              <div className={`${subtextColor} font-medium`}>Categories</div>
            </div>

            <div
              className={`${cardBg} rounded-3xl p-8 border ${borderColor} text-center group hover:scale-105 transition-transform duration-300 shadow-lg`}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <TrendingUp className="text-white" size={32} />
              </div>
              <div className={`text-4xl font-bold mb-2 ${textColor}`}>10K+</div>
              <div className={`${subtextColor} font-medium`}>
                Monthly Readers
              </div>
            </div>

            <div
              className={`${cardBg} rounded-3xl p-8 border ${borderColor} text-center group hover:scale-105 transition-transform duration-300 shadow-lg`}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                <Eye className="text-white" size={32} />
              </div>
              <div className={`text-4xl font-bold mb-2 ${textColor}`}>50K+</div>
              <div className={`${subtextColor} font-medium`}>Total Views</div>
            </div>
          </div>
        </div>

        {/* Enhanced animated background */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
          </div>
        </div>
      </div>

      {/* Enhanced Categories Section */}
      <div className={`py-20 border-t ${borderColor}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${textColor}`}>
              Explore by Category
            </h2>
            <p className={`text-xl ${subtextColor} max-w-2xl mx-auto`}>
              Dive deep into specific topics and find exactly what you're
              looking for
            </p>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {featuredCategories.map((category) => (
              <button
                key={category.id}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === category.name ? null : category.name
                  )
                }
                className={`group relative overflow-hidden rounded-3xl p-8 border-2 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
                  selectedCategory === category.name
                    ? "border-blue-500 shadow-2xl transform scale-105"
                    : theme === "dark"
                    ? "border-gray-700 hover:border-blue-500"
                    : "border-gray-200 hover:border-blue-400"
                } ${cardBg}`}
              >
                {/* Background Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                ></div>

                {/* Category Content */}
                <div className="relative z-10">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {category.emoji}
                  </div>

                  <h3
                    className={`text-xl font-bold mb-3 ${
                      selectedCategory === category.name
                        ? "text-blue-600"
                        : textColor
                    } group-hover:text-blue-600 transition-colors duration-300`}
                  >
                    {category.name}
                  </h3>

                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium px-3 py-1 rounded-full ${
                        theme === "dark"
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {category.postCount} articles
                    </span>

                    {selectedCategory === category.name && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Quick Filter Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                !selectedCategory
                  ? "bg-blue-600 text-white shadow-lg"
                  : theme === "dark"
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              All Categories
            </button>

            {["Technology", "Tutorial", "JavaScript", "React"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-lg"
                    : theme === "dark"
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {getCategoryEmoji(cat)} {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Filter Controls */}
      <div className={`py-8 border-t ${borderColor}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <h3 className={`text-2xl font-bold ${textColor}`}>
                {selectedCategory
                  ? `${selectedCategory} Articles`
                  : "All Articles"}
                <span className={`text-lg font-normal ml-2 ${subtextColor}`}>
                  ({sortedPosts.length})
                </span>
              </h3>

              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-300 hover:scale-105 ${
                    theme === "dark"
                      ? "border-gray-600 text-gray-400 hover:text-white hover:border-gray-500"
                      : "border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400"
                  }`}
                >
                  ✕ Clear filter
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div
                className={`flex rounded-xl border-2 ${borderColor} overflow-hidden`}
              >
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 transition-all duration-300 ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : theme === "dark"
                      ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Grid3X3 size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 border-l-2 ${borderColor} transition-all duration-300 ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white"
                      : theme === "dark"
                      ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <List size={20} />
                </button>
              </div>

              {/* Sort Controls */}
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${subtextColor}`}>
                  Sort by:
                </span>
                <div
                  className={`flex rounded-xl border-2 ${borderColor} overflow-hidden`}
                >
                  <button
                    onClick={() => setSortBy("recent")}
                    className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
                      sortBy === "recent"
                        ? "bg-blue-600 text-white"
                        : theme === "dark"
                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Clock size={16} className="inline mr-2" />
                    Recent
                  </button>
                  <button
                    onClick={() => setSortBy("popular")}
                    className={`px-4 py-2 text-sm font-medium border-l-2 ${borderColor} transition-all duration-300 ${
                      sortBy === "popular"
                        ? "bg-blue-600 text-white"
                        : theme === "dark"
                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <TrendingUp size={16} className="inline mr-2" />
                    Popular
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search Results Info */}
          {searchTerm && (
            <div
              className={`mt-4 p-4 rounded-xl ${
                theme === "dark" ? "bg-gray-800" : "bg-blue-50"
              } border ${borderColor}`}
            >
              <p className={`text-sm ${textColor}`}>
                <strong>{sortedPosts.length}</strong> articles found for "
                {searchTerm}"{selectedCategory && ` in ${selectedCategory}`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {sortedPosts.length > 0 ? (
          <div
            className={`grid gap-8 ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            }`}
          >
            {sortedPosts.map((article: Post) => (
              <div
                key={article.id}
                className={viewMode === "list" ? "max-w-4xl mx-auto" : ""}
              >
                <ArticleCard
                  post={{
                    _id: article.id,
                    title: article.title,
                    slug: article.slug ?? article.id,
                    summary: article.summary,
                    excerpt: article.summary,
                    coverImage: article.coverImage?.url || dummyImage,
                    createdAt: article.createdAt,
                    category:
                      categories.find((c) => c.id === article.catID)?.name ||
                      "Uncategorized",
                    tags: article.tags?.map((tagObj) =>
                      typeof tagObj === "string" ? tagObj : tagObj.name
                    ),
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
              <Search className="w-16 h-16 text-gray-600" />
            </div>
            <h3 className={`text-3xl font-bold mb-4 ${textColor}`}>
              No articles found
            </h3>
            <p className={`text-lg mb-8 max-w-md mx-auto ${subtextColor}`}>
              {searchTerm
                ? `No articles match "${searchTerm}"${
                    selectedCategory ? ` in ${selectedCategory}` : ""
                  }`
                : selectedCategory
                ? `No articles in ${selectedCategory} category`
                : "No articles available"}
            </p>
            {(searchTerm || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory(null);
                }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                View All Articles
              </button>
            )}
          </div>
        )}
      </div>

      {/* Palestine Support Section */}
      <div className={`py-20 border-t ${borderColor}`}>
        <div className="max-w-6xl mx-auto px-4">
          <div
            className={`rounded-3xl p-12 border-2 shadow-2xl ${
              theme === "dark"
                ? "bg-gradient-to-r from-green-900/30 to-red-900/30 border-green-800"
                : "bg-gradient-to-r from-green-50 to-red-50 border-green-200"
            }`}
          >
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-2xl mr-6 bg-gradient-to-b from-green-500 to-red-500 flex items-center justify-center">
                <Heart size={24} className="text-white" />
              </div>
              <h3 className={`text-3xl font-bold ${textColor}`}>
                Support Palestine
              </h3>
            </div>

            <p className={`text-xl mb-10 max-w-3xl ${subtextColor}`}>
              Stand with Palestine in their time of need. Every contribution
              helps provide humanitarian aid, medical support, and essential
              resources to those affected by the crisis.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: "UNRWA",
                  href: "https://www.unrwa.org/donate",
                  description:
                    "UN Relief and Works Agency for Palestine Refugees",
                  icon: "🏢",
                },
                {
                  name: "Medical Aid",
                  href: "https://www.map.org.uk/donate",
                  description:
                    "Medical Aid for Palestinians - Healthcare Support",
                  icon: "🏥",
                },
                {
                  name: "Children's Relief",
                  href: "https://www.pcrf.net/",
                  description: "Palestine Children's Relief Fund",
                  icon: "👶",
                },
              ].map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700 hover:border-green-500"
                      : "bg-white border-gray-200 hover:border-green-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{link.icon}</span>
                      <span className={`text-xl font-bold ${textColor}`}>
                        {link.name}
                      </span>
                    </div>
                    <ExternalLink
                      size={20}
                      className={`${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      } group-hover:text-green-500 transition-colors duration-300`}
                    />
                  </div>
                  <p className={`${subtextColor} leading-relaxed`}>
                    {link.description}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
