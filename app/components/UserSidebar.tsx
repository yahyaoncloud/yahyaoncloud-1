import { motion } from "framer-motion";
import { useTheme } from "../Contexts/ThemeContext";
import { Link, useRouteLoaderData } from "@remix-run/react";
import { Mail, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import { Author, ContactDetails, Post } from "../Types/types";
import { FaLinkedin, FaGithub, FaTwitter, FaGlobe } from "react-icons/fa";

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

  return socialLinks;
}

// Safe data extraction with error handling
function useSafeLoaderData() {
  try {
    const loaderData = useRouteLoaderData<LoaderData>("routes/_user");
    // console.log(loaderData?.data.author.contactDetails);
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
    // Use loader data if available and valid, otherwise fall back to props
    const finalRecentPosts =
      loaderPosts && loaderPosts.length > 0
        ? loaderPosts.slice(0, 5) // Limit to 5 recent posts
        : propRecentPosts.slice(0, 5);

    const finalSocialLinks = loaderAuthor
      ? convertContactDetailsToSocialLinks(loaderAuthor)
      : propSocialLinks;

    return {
      recentPosts: finalRecentPosts,
      socialLinks: finalSocialLinks,
    };
  }, [loaderPosts, loaderAuthor, propRecentPosts, propSocialLinks]);

  // Optional: Log only in development
  //   if (process.env.NODE_ENV === "development") {
  //     console.log("Sidebar Data Status:", {
  //       hasLoaderError: hasError,
  //       loaderPostsCount: loaderPosts?.length || 0,
  //       hasAuthor: !!loaderAuthor,
  //       finalPostsCount: recentPosts.length,
  //       finalSocialLinksCount: socialLinks.length,
  //     });
  //   }

  return (
    <motion.div
      className={`p-6 flex max-w-full dark:bg-slate-950/30 border-slate-800 bg-slate-200 rounded-xl items-center justify-center flex-col gap-4 ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Newsletter */}
      <motion.div
        className={`rounded-2xl w-full p-6 border ${
          theme === "dark"
            ? "bg-gray-800/50 border-gray-700 backdrop-blur-sm"
            : "bg-white/80 border-gray-200 backdrop-blur-sm shadow-sm"
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3
          className={`text-lg font-semibold mb-4 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Newsletter
        </h3>
        <p
          className={`text-sm mb-4 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Get new blog posts delivered to your inbox.
        </p>
        <div className="flex gap-2 mx-auto w-auto flex-col">
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`flex rounded-xl px-3 py-2 border ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <button
            onClick={() => {
              if (email.trim()) {
                onSubscribe(email.trim());
                setEmail("");
              }
            }}
            disabled={!email.trim()}
            className={`px-4 py-2 w-full justify-center rounded-xl flex items-center gap-2 font-medium text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              theme === "dark"
                ? "bg-blue-600 hover:bg-blue-500 text-white disabled:hover:bg-blue-600"
                : "bg-blue-500 hover:bg-blue-600 text-white disabled:hover:bg-blue-500"
            }`}
          >
            <Mail size={16} />
            Subscribe
          </button>
        </div>
      </motion.div>

      {/* More Posts - Only show if we have posts */}
      {recentPosts.length > 0 && (
        <motion.div
          className={`rounded-2xl w-full p-6 borde dark:bg-gray-800/50 dark:border-gray-700 backdrop-blur-sm"
              bg-white border-gray-200 backdrop-blur-sm shadow-sm"
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            More Posts
          </h3>
          <div className="flex flex-col gap-3">
            {recentPosts.map((post, index) => (
              <Link
                key={post._id || post.slug || index}
                to={`/blog/post/${post.slug}`}
                className={`flex items-center justify-between p-3 rounded-xl group transition-all duration-300 dark:bg-gray-700/30 dark:hover:bg-gray-700/50 dark:border-slate-600 border border-slate-300 dark:text-gray-300 dark:hover:text-white
                    bg-gray-100/30 hover:bg-gray-100 text-gray-700 hover:text-gray-900`}
              >
                <span className="text-sm font-medium line-clamp-2">
                  {post.title}
                </span>
                <ChevronRight
                  size={14}
                  className={`transition-transform group-hover:translate-x-1 flex-shrink-0 ml-2 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                />
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Follow - Only show if we have social links */}
      {socialLinks.length > 0 && (
        <motion.div
          className={`rounded-2xl w-full p-6 border ${
            theme === "dark"
              ? "bg-blue-800/10  border-blue-600"
              : "bg-white/80 border-gray-200 backdrop-blur-sm shadow-sm"
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Follow Me
          </h3>
          <div className="grid grid-cols-3 items-center justify-center">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.id || social.href || index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-3 p-3 rounded-xl transition-all duration-300 dark:hover:bg-gray-700/50 dark:text-gray-300 dark:hover:text-white border-800"
                      hover:bg-gray-100 text-gray-700 hover:text-slate-900 border-200"
                  }`}
                >
                  <Icon size={28} />
                </a>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Fallback message when no data is available */}
      {recentPosts.length === 0 && socialLinks.length === 0 && hasError && (
        <motion.div
          className={`rounded-2xl w-full p-6 border ${
            theme === "dark"
              ? "bg-gray-800/50 border-gray-700 backdrop-blur-sm"
              : "bg-white/80 border-gray-200 backdrop-blur-sm shadow-sm"
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <p
            className={`text-sm text-center ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Content loading...
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
