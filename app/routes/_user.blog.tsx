import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ExternalLink,
  Filter,
  ChevronDown,
  ChevronUp,
  Globe,
  HandHeart,
  Star,
  ArrowRight,
  Clock,
  Eye,
  Zap,
} from "lucide-react";
import dummyImage from "../assets/yahya_glass.png";
import { json, Link, useLoaderData } from "@remix-run/react";
import { LoaderFunction } from "@remix-run/node";
import { getPosts, getAllCategories } from "../Services/post.server";
import { Category, Post } from "../Types/types";

const dummyImage2 =
  "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=600&fit=crop";

type LoaderData = {
  posts: Post[];
  categories: Category[];
};
// Mock data for demonstration

// implement loader functions for post: Post[] and categories: Category[] in jsx
export const loader: LoaderFunction = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const pageParam = url.searchParams.get("page");
    const page = pageParam ? parseInt(pageParam, 10) : 1;

    const posts = await getPosts("published", 10, page);
    const categories = await getAllCategories();

    if (!posts?.length) {
      console.warn("No posts found");
    }
    if (!categories?.length) {
      console.warn("No categories found");
    }

    return json({ posts, categories, page });
  } catch (error) {
    console.error("Loader error:", error);
    return json({ posts: null, categories: null }, { status: 500 });
  }
};

// Animation variants
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

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

// Hero Section Component
const HeroSection = () => {
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
      className="relative rounded-xl text-center bg-transparent py-10 sm:py-12 md:py-16 lg:py-20 xl:py-24 overflow-hidden"
      style={{
        backgroundImage: `url(${dummyImage2})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "50vh",
      }}
      initial="hidden"
      animate="visible"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-cyan-900/60 to-indigo-900/80 dark:from-black/20 dark:via-gray-900/70 dark:to-black/80" />
      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
        variants={heroVariants}
      >
        <motion.h1
          className="text-6xl lg:text-6xl xl:text-7xl font-extrabold mb-4 sm:mb-6 leading-tight text-indigo-300"
          variants={heroVariants}
        >
          Welcome to Yahya's Engineering Hub
        </motion.h1>
        <motion.p
          className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto text-white/90 leading-relaxed mb-6 sm:mb-8"
          variants={heroVariants}
          transition={{ delay: 0.2 }}
        >
          Sharing Experiences, Engineering ideas, networks, and cloud automation
          — discover posts crafted with detail and technical expertise.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
          variants={heroVariants}
          transition={{ delay: 0.4 }}
        >
          <button className="group bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base">
            <span className="flex items-center gap-2">
              Explore Articles
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform sm:w-5 sm:h-5"
              />
            </span>
          </button>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

// Featured Post Section
const FeaturedPostSection = ({ post }: { post?: Post }) => {
  if (!post) return null;

  return (
    <motion.section
      className="max-w-5xl rounded-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUp}
    >
      <motion.div
        className="text-center mb-6 sm:mb-8 md:mb-12"
        variants={fadeInUp}
      >
        <h2
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold 
                       mb-2 sm:mb-3 md:mb-4 text-indigo-800 dark:text-indigo-300"
        >
          Featured Article
        </h2>
        <p
          className="text-sm sm:text-base md:text-lg text-gray-600 italic dark:text-gray-400 
                      max-w-2xl mx-auto px-4"
        >
          Whats on demand? find out more.
        </p>
      </motion.div>

      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl 
                   overflow-hidden hover:shadow-2xl transition-all duration-300"
        variants={cardVariants}
        whileHover="hover"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Image section */}
          <div className="relative aspect-[16/9] sm:aspect-[4/3] lg:aspect-square overflow-hidden">
            <img
              // src={post.coverImage || dummyImage2}
              src={dummyImage}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              loading="lazy"
            />
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
              <span
                className="bg-blue-600 text-white px-2 sm:px-3 py-1 
                             rounded-full text-xs sm:text-sm font-medium"
              >
                Featured
              </span>
            </div>
          </div>

          {/* Content section */}
          <div className="p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-center">
            <div
              className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 
                           mb-2 sm:mb-3 md:mb-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400"
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <Clock size={14} className="sm:w-4 sm:h-4" />
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Eye size={14} className="sm:w-4 sm:h-4" />
                <span>Featured Read</span>
              </div>
            </div>

            <h3
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold 
                          mb-2 sm:mb-3 md:mb-4 text-gray-900 dark:text-white leading-tight"
            >
              {post.title}
            </h3>

            <p
              className="text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 md:mb-6 
                          text-sm sm:text-base lg:text-lg leading-relaxed line-clamp-3"
            >
              {post.summary}
            </p>

            <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
              {post.categories?.slice(0, 3).map((cat) => (
                <span
                  key={cat._id}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                           px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
                >
                  {cat.name}
                </span>
              ))}
            </div>

            <motion.button
              className="group bg-blue-600 hover:bg-blue-700 text-white 
                         px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold 
                         transition-all duration-200 self-start text-sm sm:text-base
                         w-full sm:w-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to={`/blog/post/${post.slug}`}>
                <span className="flex items-center justify-center gap-2">
                  Read Full Article
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform sm:w-5 sm:h-5"
                  />
                </span>
              </Link>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
};

// Category Filter Section
const CategoryFilterSection = ({
  categories,
  selectedCategory,
  setSelectedCategory,
}) => {
  const [showAllCategories, setShowAllCategories] = useState(false);

  const buttonVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
    hover: { scale: 1.05, y: -2, transition: { duration: 0.2 } },
  };

  // Show only first 4 categories on mobile, all on desktop
  const visibleCategories = showAllCategories
    ? categories
    : categories.slice(0, 4);

  return (
    <motion.section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10 lg:py-12"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <motion.div
        className="text-center mb-4 sm:mb-6 md:mb-8"
        variants={fadeInUp}
      >
        <h2
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold 
                       mb-2 sm:mb-3 md:mb-4 text-indigo-800 dark:text-indigo-300"
        >
          Browse by Category
        </h2>
      </motion.div>

      {/* Mobile: Stacked layout with show more */}
      <div className="md:hidden space-y-3">
        <div className="flex flex-wrap gap-2 justify-center">
          <motion.button
            custom={0}
            variants={buttonVariants}
            whileHover="hover"
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 text-sm font-semibold rounded-full border-2 
                       transition-all duration-200 ${
                         selectedCategory === null
                           ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                           : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700"
                       }`}
          >
            All Posts
          </motion.button>

          {visibleCategories.map((cat, index) => (
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
              className={`px-4 py-2 text-sm font-semibold rounded-full border-2 
                         transition-all duration-200 ${
                           selectedCategory === cat.name
                             ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                             : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700"
                         }`}
            >
              {cat.name}
            </motion.button>
          ))}
        </div>

        {categories.length > 4 && (
          <div className="text-center">
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="text-blue-600 dark:text-blue-400 text-sm font-medium 
                         flex items-center justify-center gap-1 mx-auto hover:text-blue-700"
            >
              {showAllCategories ? "Show Less" : "Show More"}
              {showAllCategories ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Tablet & Desktop: Horizontal scroll or wrapped grid */}
      <div className="hidden md:block">
        {/* Tablet: Horizontal scroll */}
        <div className="md:block lg:hidden mb-4">
          <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            <motion.button
              custom={0}
              variants={buttonVariants}
              whileHover="hover"
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 snap-start px-6 py-3 text-sm font-semibold 
                         rounded-full border-2 transition-all duration-200 min-w-[120px] ${
                           selectedCategory === null
                             ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                             : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700"
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
                className={`flex-shrink-0 snap-start px-6 py-3 text-sm font-semibold 
                           rounded-full border-2 transition-all duration-200 min-w-[120px] ${
                             selectedCategory === cat.name
                               ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                               : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700"
                           }`}
              >
                {cat.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Desktop: Wrapped grid */}
        <motion.div
          className="hidden lg:flex flex-wrap gap-3 justify-center"
          initial="hidden"
          animate="visible"
        >
          <motion.button
            custom={0}
            variants={buttonVariants}
            whileHover="hover"
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-3 text-base font-semibold rounded-full border-2 
                       transition-all duration-200 ${
                         selectedCategory === null
                           ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                           : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700"
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
              className={`px-6 py-3 text-base font-semibold rounded-full border-2 
                         transition-all duration-200 ${
                           selectedCategory === cat.name
                             ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                             : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700"
                         }`}
            >
              {cat.name}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

// Articles Grid Section
const ArticlesGridSection = ({ posts }: { posts: Post[] }) => {
  return (
    <motion.section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <motion.div
        className="text-center mb-6 sm:mb-8 md:mb-12"
        variants={fadeInUp}
      >
        <h2
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold 
                       mb-2 sm:mb-3 md:mb-4 text-indigo-800 dark:text-indigo-300"
        >
          Latest Articles
        </h2>
        <p
          className="text-sm sm:text-base md:text-lg italic text-gray-600 dark:text-gray-400 
                      max-w-2xl mx-auto px-4"
        >
          Check out recent articles
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={posts.map((p) => p._id).join("-")}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3
                     gap-4 sm:gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {posts.map((article, index) => {
            const isFirstPost = index === 0 && posts.length > 1;
            // First post spans 2 columns on larger screens
            const gridSpan = isFirstPost
              ? "sm:col-span-2 lg:col-span-2 xl:col-span-2"
              : "";

            return (
              <motion.div
                key={article._id}
                variants={cardVariants}
                whileHover="hover"
                layout
                className={`group ${gridSpan}`}
              >
                <div
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg 
                               overflow-hidden hover:shadow-2xl transition-all duration-300 h-full
                               flex flex-col"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/9] sm:aspect-[4/3] overflow-hidden flex-shrink-0">
                    <img
                      // src={article.coverImage || dummyImage2}
                      src={dummyImage}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    {isFirstPost && (
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                        <span
                          className="bg-yellow-500 text-black px-2 sm:px-3 py-1 
                                       rounded-full text-xs sm:text-sm font-medium"
                        >
                          Latest
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-4 md:p-6 flex-1 flex flex-col">
                    {/* Meta info */}
                    <div
                      className="flex flex-wrap items-center gap-2 sm:gap-3 
                                   mb-2 sm:mb-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400"
                    >
                      <span>
                        {new Date(article.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {article.categories?.slice(0, 2).map((cat) => (
                          <span
                            key={cat._id}
                            className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 
                                     px-2 py-1 rounded-full text-xs"
                          >
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold 
                                  mb-2 sm:mb-3 text-gray-900 dark:text-white line-clamp-2 
                                  group-hover:text-blue-600 dark:group-hover:text-blue-400 
                                  transition-colors flex-shrink-0
                                  leading-tight"
                    >
                      {article.title}
                    </h3>

                    {/* Summary */}
                    <p
                      className="text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 
                                  text-xs sm:text-sm md:text-base line-clamp-3 flex-1
                                  leading-relaxed"
                    >
                      {article.summary}
                    </p>

                    {/* Read more link */}
                    <Link to={`/blog/post/${article.slug}`}>
                      <button
                        className="text-blue-600 dark:text-blue-400 font-semibold 
                                     hover:text-blue-700 dark:hover:text-blue-300 
                                     transition-colors flex items-center gap-1 group 
                                     text-xs sm:text-sm md:text-base self-start mt-auto"
                      >
                        Read More
                        <ArrowRight
                          size={14}
                          className="group-hover:translate-x-1 transition-transform sm:w-4 sm:h-4"
                        />
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* No posts message */}
      {posts.length === 0 && (
        <motion.div
          className="text-center py-12 sm:py-16 md:py-20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div
            className="text-gray-400 dark:text-gray-600 mb-3 sm:mb-4"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Star size={36} className="mx-auto mb-3 sm:mb-4 sm:w-12 sm:h-12" />
          </motion.div>
          <motion.h3
            className="text-lg sm:text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.3 }}
          >
            No posts found
          </motion.h3>
          <motion.p
            className="text-sm sm:text-base text-gray-500 dark:text-gray-500"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Try selecting a different category or check back later for new
            content.
          </motion.p>
        </motion.div>
      )}
    </motion.section>
  );
};

// Cloud Computing Spotlight Section
const CloudComputingSection = ({ posts }: { posts: Post[] }) => {
  if (!posts || posts.length === 0) return null;
  const featuredPost = posts[0];
  const otherPosts = posts.slice(1, 5);

  return (
    <motion.section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <motion.div
        className="text-center mb-6 sm:mb-8 md:mb-12"
        variants={fadeInUp}
      >
        <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3 md:mb-4">
          <h2
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold 
                         text-indigo-800 dark:text-indigo-300"
          >
            Talking Cloud
          </h2>
        </div>
        <p
          className="text-sm sm:text-base md:text-lg italic text-gray-600 dark:text-gray-400 
                      max-w-2xl mx-auto px-4"
        >
          Articles related to cloud space. find tutorials, case studies and much
          more.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Big Central Card */}
        <motion.div
          className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-purple-700 
                     rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl"
          variants={cardVariants}
          whileHover="hover"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 h-full min-h-[400px] sm:min-h-[450px] lg:min-h-[500px]">
            {/* Image section */}
            <div className="relative overflow-hidden">
              <img
                // src={featuredPost.coverImage || dummyImage2}
                src={dummyImage}
                alt={featuredPost.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            {/* Content section */}
            <div className="p-4 sm:p-6 md:p-8 lg:p-12 text-white flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2 sm:mb-3 md:mb-4">
                <span
                  className="bg-white/20 px-2 sm:px-3 py-1 rounded-full 
                               text-xs sm:text-sm font-medium"
                >
                  Featured Topic
                </span>
              </div>
              <h3
                className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold 
                           mb-2 sm:mb-3 md:mb-4 leading-tight"
              >
                {featuredPost.title}
              </h3>
              <p
                className="text-white/90 mb-3 sm:mb-4 md:mb-6 
                           text-sm sm:text-base leading-relaxed line-clamp-3 flex-1"
              >
                {featuredPost.summary}
              </p>
              <Link to={`/blog/post/${featuredPost.slug}`}>
                <motion.button
                  className="bg-white text-blue-600 px-4 sm:px-6 py-2 sm:py-3 
                         rounded-full font-semibold hover:bg-gray-100 
                         transition-colors self-start text-sm sm:text-base
                         w-full sm:w-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center justify-center gap-2">
                    Explore Now
                    <ArrowRight size={16} className="sm:w-5 sm:h-5" />
                  </span>
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Smaller Cards */}
        <div className="space-y-3 sm:space-y-4 lg:space-y-6">
          {otherPosts.map((post, index) => (
            <motion.div
              key={post._id}
              className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl 
                         shadow-lg overflow-hidden hover:shadow-xl 
                         transition-all duration-300"
              variants={cardVariants}
              custom={index + 1}
              whileHover="hover"
            >
              <Link to={`/blog/post/${post.slug}`}>
                <div className="flex gap-3 sm:gap-4 p-3 sm:p-4">
                  {/* Thumbnail */}
                  <div
                    className="w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24 
                               flex-shrink-0 rounded-lg overflow-hidden"
                  >
                    <img
                      // src={post.coverImage || dummyImage2}
                      src={dummyImage}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4
                        className="font-semibold text-gray-900 dark:text-white 
                      mb-1 sm:mb-2 line-clamp-2 text-sm sm:text-base lg:text-lg
                      leading-tight"
                      >
                        {post.title}
                      </h4>
                      <p
                        className="text-gray-600 dark:text-gray-400 
                                 text-xs sm:text-sm line-clamp-2 mb-1 sm:mb-2
                                 leading-relaxed"
                      >
                        {post.summary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      <ArrowRight
                        size={12}
                        className="text-blue-600 dark:text-blue-400 sm:w-4 sm:h-4
                               flex-shrink-0"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

// Palestine Support Section
const PalestineSupportSection = ({ theme }) => {
  const supportLinks = [
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

  const linkVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  return (
    <motion.section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl 
                   shadow-xl p-4 sm:p-6 md:p-8 lg:p-12"
        variants={cardVariants}
      >
        <div
          className="flex flex-col lg:flex-row lg:items-center justify-between 
                       gap-4 sm:gap-6 lg:gap-8"
        >
          {/* Text content */}
          <motion.div
            className="lg:w-1/3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="flex items-center gap-2 mb-2 sm:mb-3 md:mb-4 
                           text-xs sm:text-sm font-medium"
            >
              <HandHeart size={16} className="text-red-500 sm:w-5 sm:h-5" />
              <span className="text-red-600 dark:text-red-400">Solidarity</span>
            </div>
            <h2
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold 
                          text-gray-900 dark:text-white mb-2 sm:mb-3 md:mb-4"
            >
              Support Palestine
            </h2>
            <p
              className="text-gray-600 dark:text-gray-400 text-sm sm:text-base 
                         leading-relaxed"
            >
              Every link makes a difference — donate or learn more about the
              ongoing humanitarian crisis.
            </p>
          </motion.div>

          {/* Links */}
          <div className="lg:w-2/3">
            {/* Mobile: Stacked layout */}
            <div className="flex flex-col sm:hidden gap-3">
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
                    className="flex items-center gap-3 px-4 py-3 rounded-xl 
                             bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 
                             dark:hover:bg-gray-600 text-gray-900 dark:text-white 
                             transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
                  >
                    <Icon size={16} className={iconColor} />
                    <span className="font-medium flex-1">{link.name}</span>
                    <ExternalLink size={14} className="opacity-70" />
                  </motion.a>
                );
              })}
            </div>

            {/* Tablet & Desktop: Flexible layout */}
            <div className="hidden sm:flex flex-wrap gap-3 lg:gap-4 justify-start lg:justify-end">
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
                    className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 
                             rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 
                             dark:hover:bg-gray-600 text-gray-900 dark:text-white 
                             transition-all duration-200 shadow-lg hover:shadow-xl 
                             text-sm sm:text-base whitespace-nowrap"
                  >
                    <Icon size={16} className={`${iconColor} sm:w-5 sm:h-5`} />
                    <span className="font-medium">{link.name}</span>
                    <ExternalLink
                      size={14}
                      className="opacity-70 sm:w-4 sm:h-4"
                    />
                  </motion.a>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
};

// Main Homepage Component
export default function Homepage() {
  // Use loader data
  const { posts, categories } = useLoaderData<LoaderData>();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [theme] = useState("light"); // Mock theme

  // Filter posts based on selected category
  const filteredPosts = selectedCategory
    ? posts.filter((p) =>
        p.categories?.some((c) => c.name === selectedCategory)
      )
    : posts;

  // Get featured post (first post or most recent)
  const featuredPost = posts.length > 0 ? posts[0] : null;

  // Cloud posts (filtering for cloud-related posts)
  const cloudPosts = posts.filter((post) =>
    post.categories?.some(
      (cat) =>
        cat.name.toLowerCase().includes("cloud") ||
        cat.name.toLowerCase().includes("computing")
    )
  );

  return (
    <div className="min-h-screen max-w-5xl rouded-xl bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Featured Post Section */}
      <FeaturedPostSection post={featuredPost} />

      {/* 3. Category Filter Section */}
      <CategoryFilterSection
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* 4. Articles Grid Section */}
      <ArticlesGridSection posts={filteredPosts} />

      {/* 5. Cloud Computing Spotlight Section */}
      <CloudComputingSection posts={cloudPosts} />

      {/* 6. Palestine Support Section */}
      <PalestineSupportSection theme={theme} />
    </div>
  );
}
