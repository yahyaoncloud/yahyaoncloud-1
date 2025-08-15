// Sidebar.tsx
import { motion } from "framer-motion";
import { useTheme } from "../Contexts/ThemeContext";
import { Link, useRouteLoaderData } from "@remix-run/react";
import { Mail, ChevronRight, Zap } from "lucide-react";
import { useState, useMemo } from "react";
import { Author, ContactDetails, Post } from "../Types/types";
import { FaLinkedin, FaGithub, FaTwitter, FaGlobe, FaCoffee } from "react-icons/fa";

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

interface RootLoaderData {
  data: {
    posts: Post[];
    author: Author | null;
  };
  message: string | null;
  isEmpty: boolean;
}

const containerVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.25, 0, 1],
    },
  },
};

const buttonVariants = {
  hover: { scale: 1.05, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)" },
  tap: { scale: 0.95 },
};

function convertContactDetailsToSocialLinks(contactDetails: ContactDetails): SocialLink[] {
  const socialLinks: SocialLink[] = [];
  if (contactDetails?.email) {
    socialLinks.push({ id: "email", label: "Email", href: `mailto:${contactDetails.email}`, icon: Mail });
  }
  if (contactDetails?.linkedin) {
    socialLinks.push({ id: "linkedin", label: "LinkedIn", href: contactDetails.linkedin, icon: FaLinkedin });
  }
  if (contactDetails?.github) {
    socialLinks.push({ id: "github", label: "GitHub", href: contactDetails.github, icon: FaGithub });
  }
  if (contactDetails?.twitter) {
    socialLinks.push({ id: "twitter", label: "Twitter", href: contactDetails.twitter, icon: FaTwitter });
  }
  if (contactDetails?.website) {
    socialLinks.push({ id: "website", label: "Website", href: contactDetails.website, icon: FaGlobe });
  }
  if (contactDetails?.buyCoffee) {
    socialLinks.push({ id: "buyCoffee", label: "Buy Me Coffee", href: contactDetails.buyCoffee, icon: FaCoffee });
  }
  return socialLinks;
}

function useSafeLoaderData() {
  try {
    const loaderData = useRouteLoaderData<RootLoaderData>("routes/_user");
    return {
      posts: loaderData?.data?.posts || [],
      author: loaderData?.data?.author?.contactDetails || null,
      message: loaderData?.message || null,
      isEmpty: loaderData?.isEmpty || false,
      hasError: false,
    };
  } catch (error) {
    console.warn("Failed to load route data:", error);
    return {
      posts: [],
      author: null,
      message: "Failed to load sidebar content",
      isEmpty: true,
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
  const { posts: loaderPosts, author: loaderAuthor, message, isEmpty, hasError } = useSafeLoaderData();

  const { recentPosts, socialLinks } = useMemo(() => {
    const finalRecentPosts =
      loaderPosts && loaderPosts.length > 0 ? loaderPosts.slice(0, 5) : propRecentPosts.slice(0, 5);
    const finalSocialLinks = loaderAuthor ? convertContactDetailsToSocialLinks(loaderAuthor) : propSocialLinks;
    return { recentPosts: finalRecentPosts, socialLinks: finalSocialLinks };
  }, [loaderPosts, loaderAuthor, propRecentPosts, propSocialLinks]);

  const renderNoPostsFallback = () => (
    <motion.div
      className="rounded-lg p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
      variants={cardVariants}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="mb-4"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Zap
          size={32}
          className={`mx-auto mb-3 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}
        />
      </motion.div>
      <motion.h3
        className={`text-lg font-bold mb-3 text-center ${theme === "dark" ? "text-white" : "text-gray-900"}`}
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {message || "No Posts Available"}
      </motion.h3>
      <motion.p
        className={`text-sm text-center ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.4 }}
      >
        We're crafting new content. Subscribe below to stay updated!
      </motion.p>
    </motion.div>
  );

  return (
    <motion.div
      className={`flex flex-col gap-6 p-6 bg-slate-300 dark:bg-slate-900 rounded-xl  border border-gray-200 dark:border-gray-700 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Newsletter */}
      <motion.div
        className="rounded-lg p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
        variants={cardVariants}
      >
        <h3 className={`text-lg font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Newsletter
        </h3>
        <p className={`text-sm mb-4 leading-relaxed ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
          Stay updated with the latest blog posts delivered to your inbox.
        </p>
        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`rounded-xl py-2 px-2 border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ${theme === "dark"
              ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
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
            className={`flex items-center justify-center gap-2 py-2 rounded-xl font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Mail size={16} />
            Subscribe
          </motion.button>
        </div>
      </motion.div>

      {/* More Posts or Fallback */}
      {recentPosts.length > 0 ? (
        <motion.div
          className="rounded-lg p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
          variants={cardVariants}
        >
          <h3 className={`text-lg font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            More Posts
          </h3>
          <div className="flex flex-col gap-3">
            {recentPosts.map((post, index) => (
              <motion.div
                key={post._id || post.slug || index}
                variants={cardVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={`/blog/post/${post.slug}`}
                  className={`flex items-center justify-between px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-100/50 to-white/50 dark:from-gray-700/30 dark:to-gray-800/30 hover:bg-gradient-to-r hover:from-indigo-100/50 hover:to-purple-100/50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 transition-all duration-300 text-sm font-medium ${theme === "dark" ? "text-gray-300 hover:text-white" : "text-slate-700 hover:text-cyan-800"
                    }`}
                >
                  <span className="line-clamp-2">{post.title}</span>
                  <ChevronRight
                    size={14}
                    className={`transition-transform group-hover:translate-x-1 flex-shrink-0 ml-2 ${theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        isEmpty && renderNoPostsFallback()
      )}

      {/* Follow */}
      {socialLinks.length > 0 && (
        <motion.div
          className="rounded-lg p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
          variants={cardVariants}
        >
          <h3 className={`text-xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Follow Me
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.id || social.href || index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center p-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-100/50 to-white/50 dark:from-gray-700/30 dark:to-gray-800/30 hover:bg-gradient-to-r hover:from-indigo-100/50 hover:to-purple-100/50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 transition-all duration-300 ${theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-indigo-800"
                    }`}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Icon size={24} />
                </motion.a>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}