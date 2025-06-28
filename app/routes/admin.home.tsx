import { useState } from "react";
import { useTheme } from "../Contexts/ThemeContext";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Heart,
  ExternalLink,
  TrendingUp,
  Clock,
  Star,
  Filter,
} from "lucide-react";
import ArticleCard from "../components/ArticleCard";
import { environment } from "~/environments/environment";
import type { Category, Post } from "../Types/types";
import dummyImage from "../assets/yahya_glass.png";
import ColorBlendBackground from "~/components/ColorBlend";

// Loader function to fetch posts and categories
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const [postsRes, categoriesRes] = await Promise.all([
      fetch(`${environment.GO_BACKEND_URL}/posts`),
      fetch(`${environment.GO_BACKEND_URL}/categories`),
    ]);

    if (!postsRes.ok || !categoriesRes.ok) {
      throw new Error("Failed to fetch data");
    }

    const posts: Post[] = await postsRes.json();
    const categories: Category[] = await categoriesRes.json();

    return json({ posts, categories });
  } catch (error) {
    console.error("Loader error:", error);
    return json({ posts: [], categories: [] }, { status: 500 });
  }
}

// Hero Section Component
const HeroSection = ({
  theme,
  textColor,
}: {
  theme: string;
  textColor: string;
}) => {
  const bgGradient =
    theme === "dark"
      ? "bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700"
      : "bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600";

  return (
    <>
      <section className={`relative ${bgGradient} text-white py-20`}>
        <ColorBlendBackground animationDuration={4} className="custom-class" />
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Welcome to My Blog
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            Discover insights, stories, and perspectives on technology, life,
            and everything in between
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              <TrendingUp size={16} />
              <span className="text-sm">Latest Insights</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              <Star size={16} />
              <span className="text-sm">Quality Content</span>
            </div>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-4 -left-4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </section>
    </>
  );
};

// Category Filter Component
const CategoryFilter = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  theme,
}: {
  categories: Category[];
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  theme: string;
}) => {
  return (
    <section
      className={`${
        theme === "dark" ? "bg-gray-800/50" : "bg-white/70"
      } backdrop-blur-sm border-b ${
        theme === "dark" ? "border-gray-700" : "border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter
            size={20}
            className={theme === "dark" ? "text-blue-400" : "text-blue-600"}
          />
          <h2
            className={`text-lg font-semibold ${
              theme === "dark" ? "text-gray-100" : "text-gray-900"
            }`}
          >
            Filter by Category
          </h2>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hidden pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap ${
              selectedCategory === null
                ? "bg-blue-500 text-white shadow-lg transform scale-105"
                : theme === "dark"
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Articles
          </button>
          {categories.map((category) => (
            <button
              key={category.id || category.catID || category.slug}
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === category.name ? null : category.name
                )
              }
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap ${
                selectedCategory === category.name
                  ? "bg-blue-500 text-white shadow-lg transform scale-105"
                  : theme === "dark"
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

// Featured Articles Section
const FeaturedSection = ({
  posts,
  categories,
  theme,
  textColor,
}: {
  posts: Post[];
  categories: Category[];
  theme: string;
  textColor: string;
}) => {
  const featuredPosts = posts.slice(0, 3);

  if (featuredPosts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Star
          size={24}
          className={theme === "dark" ? "text-yellow-400" : "text-yellow-500"}
        />
        <h2 className={`text-3xl font-bold ${textColor}`}>Featured Articles</h2>
        <div
          className={`flex-1 h-1 rounded-full bg-gradient-to-r ${
            theme === "dark"
              ? "from-yellow-400 to-orange-500"
              : "from-yellow-500 to-orange-600"
          }`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {featuredPosts.map((article: Post, index) => (
          <div
            key={article.id}
            className={`${
              index === 0 ? "lg:col-span-2 lg:row-span-2" : ""
            } group`}
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
                  categories.find((c: Category) => c.id === article.catID)
                    ?.name || "Uncategorized",
                tags: article.tags?.map((tagObj) =>
                  typeof tagObj === "string" ? tagObj : tagObj.name
                ),
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

// Recent Articles Section
const RecentArticlesSection = ({
  filteredPosts,
  categories,
  selectedCategory,
  theme,
  textColor,
}: {
  filteredPosts: Post[];
  categories: Category[];
  selectedCategory: string | null;
  theme: string;
  textColor: string;
}) => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Clock
          size={24}
          className={theme === "dark" ? "text-blue-400" : "text-blue-600"}
        />
        <h2 className={`text-3xl font-bold ${textColor}`}>
          {selectedCategory
            ? `${selectedCategory} Articles`
            : "Recent Articles"}
        </h2>
        <div
          className={`flex-1 h-1 rounded-full bg-gradient-to-r ${
            theme === "dark"
              ? "from-blue-400 to-purple-500"
              : "from-blue-600 to-purple-600"
          }`}
        />
      </div>

      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((article: Post) => (
            <ArticleCard
              key={article.id}
              post={{
                _id: article.id,
                title: article.title,
                slug: article.slug ?? article.id,
                summary: article.summary,
                excerpt: article.summary,
                coverImage: article.coverImage?.url || dummyImage,
                createdAt: article.createdAt,
                category:
                  categories.find((c: Category) => c.id === article.catID)
                    ?.name || "Uncategorized",
                tags: article.tags?.map((tagObj) =>
                  typeof tagObj === "string" ? tagObj : tagObj.name
                ),
              }}
            />
          ))}
        </div>
      ) : (
        <div
          className={`text-center py-12 ${
            theme === "dark" ? "bg-gray-800/30" : "bg-gray-50/50"
          } rounded-2xl`}
        >
          <div
            className={`text-6xl mb-4 ${
              theme === "dark" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            📝
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${textColor}`}>
            No articles found
          </h3>
          <p
            className={`${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {selectedCategory
              ? `No articles found in the "${selectedCategory}" category.`
              : "No articles are available at the moment."}
          </p>
        </div>
      )}
    </section>
  );
};

// Palestine Support Section (Fixed)
const PalestineSection = ({
  theme,
  textColor,
}: {
  theme: string;
  textColor: string;
}) => {
  const supportLinks = [
    {
      name: "UNRWA",
      href: "https://www.unrwa.org/donate",
      description: "UN Relief for Palestine Refugees",
      icon: "🏥",
    },
    {
      name: "Medical Aid",
      href: "https://www.map.org.uk/donate",
      description: "Medical Aid for Palestinians",
      icon: "⚕️",
    },
    {
      name: "Gaza Relief",
      href: "https://www.pcrf.net/",
      description: "Palestine Children's Relief Fund",
      icon: "👶",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div
        className={`rounded-2xl p-8 border-2 ${
          theme === "dark"
            ? "bg-gradient-to-br from-red-900/20 to-green-900/20 border-red-500/30"
            : "bg-gradient-to-br from-red-50 to-green-50 border-red-200"
        } backdrop-blur-sm`}
      >
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Heart size={28} className="text-red-500 animate-pulse" />
            <h2 className={`text-3xl font-bold ${textColor}`}>
              Stand with Palestine
            </h2>
            <Heart size={28} className="text-red-500 animate-pulse" />
          </div>
          <p
            className={`text-lg ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            } max-w-2xl mx-auto`}
          >
            Every contribution helps provide humanitarian aid and support to
            those in need. Together, we can make a difference in the lives of
            Palestinian families.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {supportLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                theme === "dark"
                  ? "bg-gray-800/50 border-gray-600 hover:border-red-400 hover:bg-gray-700/70"
                  : "bg-white/80 border-gray-200 hover:border-red-300 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{link.icon}</span>
                  <h3
                    className={`text-xl font-semibold ${textColor} group-hover:text-red-500 transition-colors`}
                  >
                    {link.name}
                  </h3>
                </div>
                <ExternalLink
                  size={20}
                  className={`${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  } group-hover:text-red-500 transition-colors transform group-hover:translate-x-1`}
                />
              </div>
              <p
                className={`${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                } leading-relaxed`}
              >
                {link.description}
              </p>

              <div
                className={`mt-4 w-full h-1 rounded-full bg-gradient-to-r from-red-500 to-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
              />
            </a>
          ))}
        </div>

        <div className="text-center mt-8">
          <p
            className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            } italic`}
          >
            "And whoever saves a life, it is considered as if he saved an entire
            world." - Quran 5:32
          </p>
        </div>
      </div>
    </section>
  );
};

// Main Homepage Component
export default function Homepage() {
  const { theme } = useTheme();
  const { posts, categories } = useLoaderData<typeof loader>();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredPosts = selectedCategory
    ? posts.filter((p: Post) => {
        const cat = categories.find((c: Category) => c.id === p.categoryId);
        return cat?.name === selectedCategory;
      })
    : posts;

  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-900";

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Hero Section */}
      <HeroSection theme={theme} textColor={textColor} />

      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        theme={theme}
      />

      {/* Featured Articles (only show when no category is selected) */}
      {!selectedCategory && (
        <FeaturedSection
          posts={posts}
          categories={categories}
          theme={theme}
          textColor={textColor}
        />
      )}

      {/* Recent/Filtered Articles */}
      <RecentArticlesSection
        filteredPosts={selectedCategory ? filteredPosts : posts.slice(3)} // Skip first 3 if showing featured
        categories={categories}
        selectedCategory={selectedCategory}
        theme={theme}
        textColor={textColor}
      />

      {/* Palestine Support Section */}
      <PalestineSection theme={theme} textColor={textColor} />

      {/* Animated Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-3 z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${
              theme === "dark" ? "rgb(96 165 250)" : "rgb(59 130 246)"
            } 1px, transparent 0)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>
    </div>
  );
}
