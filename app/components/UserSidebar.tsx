import { motion } from "framer-motion";
import { useTheme } from "../Contexts/ThemeContext";
import { Link, useRouteLoaderData } from "@remix-run/react";
import { Mail, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import { Author, ContactDetails, Post } from "../Types/types";
import {
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaGlobe,
  FaCoffee,
} from "react-icons/fa";

interface SocialLink {
  id?: string;
  label?: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
}

interface SidebarProps {
  recentPosts?: { _id?: string; title?: string; href?: string; slug: string }[];
  socialLinks?: SocialLink[];
  onSubscribe: (email: string) => void;
  className?: string;
}

type LoaderData = {
  data: {
    posts: Post[];
    author: Author;
  };
};

// Animation variants for consistent motion
const containerVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.25, 0, 1],
    },
  },
};

const buttonVariants = {
  hover: { scale: 1.03, boxShadow: "0 6px 20px rgba(0, 0, 0, 0.12)" },
  tap: { scale: 0.97 },
};

// Helper function to convert ContactDetails to SocialLinks
function convertContactDetailsToSocialLinks(
  contactDetails: ContactDetails
): SocialLink[] {
  const socialLinks: SocialLink[] = [];

  if (contactDetails?.email) {
    socialLinks.push({
      id: "email",
      label: "Email",
      href: `mailto:${contactDetails.email}`,
      icon: Mail,
    });
  }

  if (contactDetails?.linkedin) {
    socialLinks.push({
      id: "linkedin",
      label: "LinkedIn",
      href: contactDetails.linkedin,
      icon: FaLinkedin,
    });
  }

  if (contactDetails?.github) {
    socialLinks.push({
      id: "github",
      label: "GitHub",
      href: contactDetails.github,
      icon: FaGithub,
    });
  }

  if (contactDetails?.twitter) {
    socialLinks.push({
      id: "twitter",
      label: "Twitter",
      href: contactDetails.twitter,
      icon: FaTwitter,
    });
  }

  if (contactDetails?.website) {
    socialLinks.push({
      id: "website",
      label: "Website",
      href: contactDetails.website,
      icon: FaGlobe,
    });
  }
  if (contactDetails?.buyCoffee) {
    socialLinks.push({
      id: "buyCoffee",
      label: "Buy Me Coffee",
      href: contactDetails.buyCoffee,
      icon: FaCoffee,
    });
  }

  return socialLinks;
}

// Safe data extraction with error handling
function useSafeLoaderData() {
  try {
    const loaderData = useRouteLoaderData<LoaderData>("routes/_user");
    return {
      posts: loaderData?.data?.posts || [],
      author: loaderData?.data?.author.contactDetails || null,
      hasError: false,
    };
  } catch (error) {
    console.warn("Failed to load route data:", error);
    return {
      posts: [],
      author: null,
      hasError: true,
    };
  }
}

export default function Sidebar({
  recentPosts: propRecentPosts = [],
  socialLinks: propSocialLinks = [],
  onSubscribe,
  className = "",
}: SidebarProps) {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");

  // Safe data loading with error handling
  const {
    posts: loaderPosts,
    author: loaderAuthor,
    hasError,
  } = useSafeLoaderData();

  // Memoize the final data to avoid unnecessary recalculations
  const { recentPosts, socialLinks } = useMemo(() => {
    const finalRecentPosts =
      loaderPosts && loaderPosts.length > 0
        ? loaderPosts.slice(0, 4) // Reduced from 5 to 4
        : propRecentPosts.slice(0, 4);

    const finalSocialLinks = loaderAuthor
      ? convertContactDetailsToSocialLinks(loaderAuthor)
      : propSocialLinks;

    return {
      recentPosts: finalRecentPosts,
      socialLinks: finalSocialLinks,
    };
  }, [loaderPosts, loaderAuthor, propRecentPosts, propSocialLinks]);

  return (
    <motion.div
      className={`flex flex-col gap-4 p-6 m-4 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-700 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Newsletter */}
      <motion.div className="relative" variants={cardVariants}>
        <h3
          className={`text-base font-bold mb-2 ${theme === "dark" ? "text-white" : "text-zinc-900"
            }`}
        >
          Newsletter
        </h3>
        <p
          className={`text-xs mb-3 leading-relaxed ${theme === "dark" ? "text-zinc-300" : "text-zinc-600"
            }`}
        >
          Stay updated with the latest posts.
        </p>
        <div className="flex flex-col gap-2">
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`rounded-md px-2 py-1.5 border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ${theme === "dark"
              ? "bg-zinc-700 border-zinc-600 text-zinc-100 placeholder-zinc-400"
              : "bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-50"
              }`}
          />
          <motion.button
            onClick={() => {
              if (email.trim()) {
                onSubscribe(email.trim());
                setEmail("");
              }
            }}
            disabled={!email.trim()}
            className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs`}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Mail size={14} />
            Subscribe
          </motion.button>
        </div>
      </motion.div>

      {/* More Posts */}
      {recentPosts.length > 0 && (
        <motion.div className="" variants={cardVariants}>
          <h3
            className={`text-base font-bold mb-3 ${theme === "dark" ? "text-white" : "text-zinc-900"
              }`}
          >
            More Posts
          </h3>
          <div className="flex flex-col gap-2">
            {recentPosts.map((post, index) => (
              <motion.div
                key={post._id || post.slug || index}
                variants={cardVariants}
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.99 }}
              >
                <Link
                  to={`/blog/post/${post.slug}`}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-md border border-zinc-200/50 dark:border-zinc-700/50 bg-gradient-to-r from-zinc-100/50 to-white/50 dark:from-zinc-700/30 dark:to-zinc-800/30 hover:bg-gradient-to-r hover:from-indigo-100/50 hover:to-purple-100/50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 transition-all duration-300 text-xs font-medium ${theme === "dark"
                    ? "text-zinc-300 hover:text-white"
                    : "text-zinc-700 hover:text-indigo-800"
                    }`}
                >
                  <span className="line-clamp-2 text-xs leading-tight">
                    {post.title}
                  </span>
                  <ChevronRight
                    size={12}
                    className={`transition-transform group-hover:translate-x-1 flex-shrink-0 ml-1.5 ${theme === "dark" ? "text-zinc-400" : "text-zinc-50"
                      }`}
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Follow */}
      {socialLinks.length > 0 && (
        <motion.div className="" variants={cardVariants}>
          <h3
            className={`text-base font-bold mb-3 ${theme === "dark" ? "text-white" : "text-zinc-900"
              }`}
          >
            Follow Me
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.id || social.href || index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center p-2 rounded-md border border-zinc-200/50 dark:border-zinc-700/50 bg-gradient-to-r from-zinc-100/50 to-white/50 dark:from-zinc-700/30 dark:to-zinc-800/30 hover:bg-gradient-to-r hover:from-indigo-100/50 hover:to-purple-100/50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 transition-all duration-300 ${theme === "dark"
                    ? "text-zinc-300 hover:text-white"
                    : "text-zinc-700 hover:text-indigo-800"
                    }`}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Icon size={16} />
                </motion.a>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Fallback Message */}
      {recentPosts.length === 0 && socialLinks.length === 0 && hasError && (
        <motion.div
          className="rounded-md p-4 bg-zinc-200/90 dark:bg-zinc-800/90 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-700/50 shadow-md"
          variants={cardVariants}
        >
          <p
            className={`text-xs text-center ${theme === "dark" ? "text-zinc-400" : "text-zinc-600"
              }`}
          >
            Content loading...
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
