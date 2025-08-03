import { useState } from "react";
import { useTheme } from "../Contexts/ThemeContext";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Heart,
  ExternalLink,
  Filter,
  ChevronDown,
  ChevronUp,
  Globe,
  HandHeart,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ArticleCard from "../components/ArticleCard";
import { Category, Post, Tag, Type } from "../Types/types";
import dummyImage from "../assets/yahya_glass.png";
import {
  getPosts,
  getAllCategories,
  getAllTags,
  getTypeById,
  getAllTypes,
} from "../Services/post.server";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
  hover: {
    scale: 1.02,
    y: -5,
    transition: {
      duration: 0.2,
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
};

type LoaderData = {
  posts: Post[];
  categories: Category[];
  tags: Tag[];
  types: Type[];
};

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Fetch posts and categories directly from the service
    const posts = await getPosts(); // Fetch published posts, default limit 10, page 1
    const categories = await getAllCategories();
    const tags = await getAllTags();
    const types = await getAllTypes();

    // If you need a specific type by ID, uncomment and use:
    // const type = await getTypeById(posts.types._id);

    // console.log(types);

    return json({
      posts: posts,
      categories: categories,
      tags: tags,
      types: types,
    });
  } catch (error) {
    console.error("Loader error:", error);
    return json(
      {
        posts: [],
        categories: [],
        tags: [],
        types: [],
      },
      { status: 500 }
    );
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
      className="text-center bg-transparent py-20 relative "
      style={{
        backgroundImage: `url(${dummyImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      initial="hidden"
      animate="visible"
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-cyan-900/60 to-indigo-900/80 dark:from-black/10 dark:via-gray-900/70 dark:to-black" />
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
}: {
  categories: Category[];
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
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
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200"
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
                ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-700 dark:border-blue-500 shadow-lg"
                : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
            }`}
          >
            All Posts
          </motion.button>
          {categories.map((cat, index) => (
            <motion.button
              key={cat._id}
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
                  ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-700 dark:border-blue-500 shadow-lg"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
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
const ArticlesGridSection = ({ posts }: { posts: Post[] }) => {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      {/* Section header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-4xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Latest Articles
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Dive into technical insights, cloud automation, and engineering
          solutions
        </p>
      </motion.div>

      {/* Posts grid with AnimatePresence for smooth transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={posts.map((p) => p._id).join("-")} // Unique key for different filtered sets
          className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          layout
        >
          {posts.map((article, index) => {
            const spanClass =
              index % 6 === 0 ? "lg:col-span-2" : "lg:col-span-1";

            return (
              <motion.div
                key={article._id}
                variants={cardVariants}
                whileHover="hover"
                layout
                className={`group min-h-[280px] ${spanClass}`}
              >
                <ArticleCard
                  post={{
                    _id: article._id,
                    title: article.title,
                    slug: article.slug ?? article._id,
                    summary: article.summary,
                    excerpt: article.summary,
                    coverImage: article.coverImages || dummyImage,
                    createdAt: article.createdAt,
                    author: article.authorId,
                    categories:
                      article.categories?.map((c: Category) => c.name) || [],
                    tags: article.tags?.map((c: Tag) => c.name) || [],
                  }}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Empty state with smooth animation */}
      {posts.length === 0 && (
        <motion.div
          className="text-center h-64 p-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div
            className="text-gray-400 dark:text-gray-600 mb-4"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Star size={48} className="mx-auto mb-4" />
          </motion.div>
          <motion.h3
            className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.3 }}
          >
            No posts found
          </motion.h3>
          <motion.p
            className="text-gray-500 dark:text-gray-500"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Try selecting a different category or check back later for new
            content.
          </motion.p>
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

  const bg = theme === "dark" ? "bg-gray-800" : "bg-white";
  const textSecondary = theme === "dark" ? "text-gray-400" : "text-gray-600";
  const textAccent = theme === "dark" ? "text-red-400" : "text-red-600";
  const linkBg =
    theme === "dark"
      ? "bg-gray-700 hover:bg-gray-600 text-white"
      : "bg-gray-100 hover:bg-gray-200 text-gray-900";

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

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.3,
        ease: "easeIn",
      },
    },
    hover: {
      scale: 1.02,
      y: -5,
      transition: {
        duration: 0.2,
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
  };

  return (
    <motion.section
      className={`max-w-7xl mx-auto p-8 ${bg} rounded-xl shadow-sm pb-8`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      variants={cardVariants}
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
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
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
              link.type === "donation" ? "text-red-500" : "text-blue-500";

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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${linkBg}`}
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
  const { posts, categories } = useLoaderData<LoaderData>();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter posts based on selected category
  const filteredPosts = selectedCategory
    ? posts.filter((p: Post) =>
        p.categories?.some((c: Category) => c.name === selectedCategory)
      )
    : posts;

  return (
    <div
      className={`min-h-screen mx-auto max-w-5xl transition-colors duration-300 pb-8
      }`}
    >
      {/* 1. Hero Section - Main banner */}
      <HeroSection />

      {/* 2. Category Filter Section - Post filtering */}
      <CategoryFilterSection
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* 3. Articles Grid Section - Main content */}
      <ArticlesGridSection posts={filteredPosts} />

      {/* 4. Palestine Support Section - Solidarity section */}
      <PalestineSupportSection theme={theme} />
    </div>
  );
}
