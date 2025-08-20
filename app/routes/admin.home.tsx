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
import { motion, AnimatePresence } from "framer-motion"; // Import Framer Motion
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
  // Animation variants for the hero section
  const heroVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <motion.section
      className="text-center py-20 relative text-white"
      style={{
        backgroundImage: `url(${dummyImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      initial="hidden"
      animate="onscreen"
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/70 via-cyan-900/60 to-indigo-900/80 dark:from-black/10 dark:via-zinc-900/70 dark:to-black" />
      <motion.div
        className="relative max-w-4xl mx-auto px-4"
        initial="hidden"
        animate="visible"
        variants={heroVariants}
      >
        <motion.h1
          className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight"
          variants={heroVariants}
        >
          Welcome to Yahya's Engineering Hub
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl max-w-2xl mx-auto opacity-90 leading-relaxed"
          variants={heroVariants}
          transition={{ delay: 0.2 }}
        >
          Sharing Experiences, Engineering ideas, networks, and cloud automation
          — discover posts crafted with detail and technical expertise.
        </motion.p>
      </motion.div>
    </motion.section>
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

  // Animation variants for filter buttons
  const buttonVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* Mobile filter toggle */}
      <motion.div
        className="md:hidden flex justify-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Filter size={16} />
          <span className="font-medium">
            {showFilters ? "Hide Categories" : "Show Categories"}
          </span>
          {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </motion.button>
      </motion.div>

      {/* Category filter buttons */}
      <AnimatePresence>
        <motion.div
          className={`flex-wrap gap-3 items-center justify-center md:flex ${
            showFilters ? "flex" : "hidden"
          } md:!flex`}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.button
            custom={0}
            variants={buttonVariants}
            whileHover="hover"
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-3 text-sm font-semibold rounded-full border-2 transition-all duration-200 ${
              selectedCategory === null
                ? "bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-700 dark:border-indigo-500 shadow-lg"
                : "bg-zinc-50 text-zinc-700 border-zinc-300 hover:bg-indigo-50 hover:border-indigo-300 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-700"
            }`}
          >
            All Posts
          </motion.button>
          {categories.map((cat, index) => (
            <motion.button
              key={cat.id}
              custom={index + 1}
              variants={buttonVariants}
              whileHover="hover"
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === cat.name ? null : cat.name
                )
              }
              className={`px-6 py-3 text-sm font-semibold rounded-full border-2 transition-all duration-200 ${
                selectedCategory === cat.name
                  ? "bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-700 dark:border-indigo-500 shadow-lg"
                  : "bg-zinc-50 text-zinc-700 border-zinc-300 hover:bg-indigo-50 hover:border-indigo-300 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-700"
              }`}
            >
              {cat.name}
            </motion.button>
          ))}
        </motion.div>
      </AnimatePresence>
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
  // Animation variants for article cards
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
    hover: { scale: 1.02, transition: { duration: 0.3 } },
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      {/* Section header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-4xl md:text-4xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">
          Latest Articles
        </h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Dive into technical insights, cloud automation, and engineering
          solutions
        </p>
      </motion.div>

      {/* Posts grid */}
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {posts.map((article, index) => {
            const spanClass =
              index % 6 === 0 ? "lg:col-span-2" : "lg:col-span-1";

            return (
              <motion.div
                key={article.id}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                className={`group min-h-[280px] ${spanClass}`}
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
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {posts.length === 0 && (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-zinc-400 dark:text-zinc-600 mb-4">
            <Star size={48} className="mx-auto mb-4" />
          </div>
          <h3 className="text-xl font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
            No posts found
          </h3>
          <p className="text-zinc-500 dark:text-zinc-500">
            Try selecting a different category or check back later for new
            content.
          </p>
        </motion.div>
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

  const bg = theme === "dark" ? "bg-zinc-800" : "bg-zinc-50";
  const textSecondary = theme === "dark" ? "text-zinc-400" : "text-zinc-600";
  const textAccent = theme === "dark" ? "text-red-400" : "text-red-600";
  const linkBg =
    theme === "dark"
      ? "bg-zinc-700 hover:bg-zinc-600 text-white"
      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900";

  // Animation variants for support links
  const linkVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  return (
    <motion.section
      className={`max-w-7xl mx-auto p-8 ${bg} rounded-md shadow-sm pb-8`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Text Block */}
        <motion.div
          className="md:w-1/3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-2 text-sm font-medium">
            <HandHeart size={16} className="text-red-500" />
            <span className={textAccent}>Solidarity</span>
          </div>
          <h2 className="text-4xl font-bold text-zinc-900 dark:text-white">
            Support Palestine
          </h2>
          <p className={`text-sm mt-1 ${textSecondary}`}>
            Every link makes a difference — donate or learn more.
          </p>
        </motion.div>

        {/* Support Links */}
        <div className="md:w-2/3 flex flex-wrap gap-3">
          {supportLinks.map((link, index) => {
            const Icon = link.icon;
            const iconColor =
              link.type === "donation" ? "text-red-500" : "text-indigo-500";

            return (
              <motion.a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                custom={index}
                variants={linkVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${linkBg}`}
              >
                <Icon size={16} className={iconColor} />
                <span>{link.name}</span>
                <ExternalLink size={12} className="opacity-70" />
              </motion.a>
            );
          })}
        </div>
      </div>
    </motion.section>
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
      className={`min-h-screen transition-colors duration-300 pb-8 ${
        theme === "dark" ? "bg-zinc-950" : "bg-zinc-50"
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

      {/* 4. Palestine Support Section - Solidarity section */}
      <PalestineSupportSection theme={theme} />
    </div>
  );
}
