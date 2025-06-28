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
  ChevronDown,
  ChevronUp,
  Globe,
  HandHeart,
} from "lucide-react";
import ArticleCard from "../components/ArticleCard";
import { environment } from "../environments/environment";
import type { Category, Post } from "../Types/types";
import dummyImage from "../assets/yahya_glass.png";

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

// Hero Section - Main introduction banner
const HeroSection = () => {
  return (
    <section
      className="text-center py-20 relative text-white"
      style={{
        backgroundImage: `url(${dummyImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-cyan-900/60 to-indigo-900/80 dark:from-black/10 dark:via-gray-900/70 dark:to-black" />
      <div className="relative max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
          Welcome to Yahya&apos;s Engineering Hub
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90 leading-relaxed">
          Sharing Experiences, Engineering ideas, networks, and cloud automation
          — discover posts crafted with detail and technical expertise.
        </p>
      </div>
    </section>
  );
};

// Category Filter Section - Filter controls for posts
const CategoryFilterSection = ({
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
  const [showFilters, setShowFilters] = useState(false);

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* Mobile filter toggle */}
      <div className="md:hidden flex justify-center mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200"
        >
          <Filter size={16} />
          <span className="font-medium">
            {showFilters ? "Hide Categories" : "Show Categories"}
          </span>
          {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Category filter buttons */}
      <div
        className={`flex-wrap gap-3 items-center justify-center md:flex ${
          showFilters ? "flex" : "hidden"
        } md:!flex`}
      >
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-6 py-3 text-sm font-semibold rounded-full border-2 transition-all duration-200 ${
            selectedCategory === null
              ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-700 dark:border-blue-500 shadow-lg"
              : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
          }`}
        >
          All Posts
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() =>
              setSelectedCategory(
                selectedCategory === cat.name ? null : cat.name
              )
            }
            className={`px-6 py-3 text-sm font-semibold rounded-full border-2 transition-all duration-200 ${
              selectedCategory === cat.name
                ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-700 dark:border-blue-500 shadow-lg"
                : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </section>
  );
};

// Articles Grid Section - Display posts in a responsive grid
const ArticlesGridSection = ({
  posts,
  categories,
  theme,
}: {
  posts: Post[];
  categories: Category[];
  theme: string;
}) => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      {/* Section header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Latest Articles
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Dive into technical insights, cloud automation, and engineering
          solutions
        </p>
      </div>

      {/* Posts grid */}
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((article, index) => {
          // Every 6th item spans 2 columns on large screens for visual variety
          const spanClass = index % 6 === 0 ? "lg:col-span-2" : "lg:col-span-1";

          return (
            <div
              key={article.id}
              className={`group transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl min-h-[280px] ${spanClass}`}
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
          );
        })}
      </div>

      {/* Empty state */}
      {posts.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <Star size={48} className="mx-auto mb-4" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            No posts found
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            Try selecting a different category or check back later for new
            content.
          </p>
        </div>
      )}
    </section>
  );
};

interface SupportLink {
  name: string;
  url: string;
  type: "donation" | "education";
  icon: React.ElementType;
}

interface Props {
  theme: "dark" | "light";
}

export const PalestineSupportSection = ({ theme }: Props) => {
  const supportLinks: SupportLink[] = [
    {
      name: "Medical Aid for Palestinians",
      url: "https://www.map.org.uk/",
      type: "donation",
      icon: Heart,
    },
    {
      name: "UNRWA Emergency Appeal",
      url: "https://donate.unrwa.org/",
      type: "donation",
      icon: HandHeart,
    },
    {
      name: "Decolonize Palestine",
      url: "https://decolonizepalestine.com/",
      type: "education",
      icon: Globe,
    },
  ];

  const bg = theme === "dark" ? "bg-gray-800" : "bg-white";
  const textSecondary = theme === "dark" ? "text-gray-400" : "text-gray-600";
  const textAccent = theme === "dark" ? "text-red-400" : "text-red-600";
  const linkBg =
    theme === "dark"
      ? "bg-gray-700 hover:bg-gray-600 text-white"
      : "bg-gray-100 hover:bg-gray-200 text-gray-900";

  return (
    <section
      className={`max-w-7xl mx-auto p-8 ${bg} rounded-xl shadow-sm pb-8`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Text Block */}
        <div className="md:w-1/3">
          <div className="flex items-center gap-2 mb-2 text-sm font-medium">
            <HandHeart size={16} className="text-red-500" />
            <span className={textAccent}>Solidarity</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
            Support Palestine
          </h2>
          <p className={`text-sm mt-1 ${textSecondary}`}>
            Every link makes a difference — donate or learn more.
          </p>
        </div>

        {/* Support Links */}
        <div className="md:w-2/3 flex flex-wrap gap-3">
          {supportLinks.map((link) => {
            const Icon = link.icon;
            const iconColor =
              link.type === "donation" ? "text-red-500" : "text-blue-500";

            return (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${linkBg}`}
              >
                <Icon size={16} className={iconColor} />
                <span>{link.name}</span>
                <ExternalLink size={12} className="opacity-70" />
              </a>
            );
          })}
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

  // Filter posts based on selected category
  const filteredPosts = selectedCategory
    ? posts.filter((p: Post) => {
        const cat = categories.find((c: Category) => c.id === p.categoryId);
        return cat?.name === selectedCategory;
      })
    : posts;

  return (
    <div
      className={`min-h-screen transition-colors duration-300  pb-8 ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* 1. Hero Section - Main banner */}
      <HeroSection />

      {/* 2. Category Filter Section - Post filtering */}
      <CategoryFilterSection
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        theme={theme}
      />

      {/* 3. Articles Grid Section - Main content */}
      <ArticlesGridSection
        posts={filteredPosts}
        categories={categories}
        theme={theme}
      />

      {/* 4. Palestine Support Section - Solidarity section (moved to end) */}
      <PalestineSupportSection theme={theme} />
    </div>
  );
}
