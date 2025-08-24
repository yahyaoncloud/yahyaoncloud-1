import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { LoaderFunction, json, Link, useLoaderData } from "@remix-run/react";
import {
  Github,
  Linkedin,
  Mail,
  Search,
  Globe,
  ExternalLink,
} from "lucide-react";
import {
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import {
  getPosts,
  getAllCategories,
  getAllPortfolios,
} from "../Services/post.server";

// Types
interface Post {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
  createdAt: string;
  categories?: Array<{ name: string }>;
}

interface SocialLink {
  id: string;
  href: string;
}

interface Category {
  name: string;
}

interface LoaderData {
  posts: Post[];
  categories: Category[];
  socials: SocialLink[];
}

// Constants
const SOCIAL_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  linkedin: FaLinkedin,
  github: FaGithub,
  twitter: FaTwitter,
  youtube: FaYoutube,
  instagram: FaInstagram,
  email: Mail,
};

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// Loader
export const loader: LoaderFunction = async () => {
  try {
    const [posts, categories, portfolioData] = await Promise.all([
      getPosts("published", 50, 1),
      getAllCategories(),
      getAllPortfolios(),
    ]);

    const socialLinksObj = portfolioData[0]?.socialLinks || {};
    console.log(socialLinksObj)
    const socials: SocialLink[] = Object.entries(socialLinksObj)
      .map(([id, href]) => ({ id, href: String(href) }))
      .filter((social) => social.href);

    return json<LoaderData>({ posts, categories, socials });
  } catch (error) {
    console.error("Loader error:", error);
    return json<LoaderData>(
      { posts: [], categories: [], socials: [] },
      { status: 500 }
    );
  }
};

// Utility Components
const SocialIcon = ({ social }: { social: SocialLink }) => {
  const Icon = SOCIAL_ICONS[social.id];
  if (!Icon) return null;
  return (
    <a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      className=" text-zinc-500  dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200"
      aria-label={social.id}
    >
      <Icon size={24} />
    </a>
  );
};

const MotionSection = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.section
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    variants={fadeIn}
  >
    {children}
  </motion.section>
);

// Main Components
const SearchBox = ({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (q: string) => void;
}) => (
  <div className="max-w-3xl mx-auto mb-8 px-4 md:px-0">
    <div className="relative">
      <Search className="absolute left-3 top-2.5 text-zinc-400" size={18} />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search posts..."
        className="w-full pl-10 pr-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  </div>
);

const PostCard = ({ post }: { post: Post }) => (
  <div className="py-3 md:py-4">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-2">
      <Link
        to={`/blog/post/${post.slug}`}
        className="group font-medium text-indigo-600 dark:text-indigo-400 leading-tight transition-colors duration-200"
      >
        <span className="relative">
          {post.title}
          <span className="absolute bottom-0 left-0 w-0 h-px bg-current transition-all duration-200 group-hover:w-full" />
        </span>
      </Link>
      <div className="hidden md:flex items-center flex-1 mx-3">
        <span className="h-px w-full bg-zinc-300 dark:bg-zinc-700" />
      </div>
      <span className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mt-1 md:mt-0">
        {new Date(post.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </span>
    </div>
    {post.summary && (
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
        {post.summary}
      </p>
    )}
  </div>
);
const TopicSections = ({ posts }: { posts: Post[] }) => {
  const groupedPosts = useMemo(
    () =>
      posts.reduce((acc, post) => {
        const category = post.categories?.[0]?.name || "Other";
        acc[category] = acc[category] || [];
        acc[category].push(post);
        return acc;
      }, {} as Record<string, Post[]>),
    [posts]
  );

  if (!Object.keys(groupedPosts).length) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-0">
        <p className="text-zinc-500 dark:text-zinc-400 text-center">
          No posts found matching your search.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-0 space-y-8 md:space-y-12">
      {Object.entries(groupedPosts)
        .filter(([category]) => category.toLowerCase() !== "work-life")
        .map(([category, posts]) => (
          <MotionSection key={category}>
            <h2 className="text-lg md:text-xl font-semibold text-zinc-900 dark:text-white mb-3 md:mb-4">
              {category}
            </h2>
            <div className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-700">
              {posts.slice(0, 2).map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
            {posts.length > 2 && (
              <motion.div className="mt-3" variants={fadeIn}>
                <Link
                  to={`/blog/posts?category=${category}`}
                  className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  See all {posts.length} posts →
                </Link>
              </motion.div>
            )}
          </MotionSection>
        ))}
    </div>
  );
};

const dummyCards = [
  {
    title: "New AWS Features",
    description: "Highlights from AWS re:Invent 2025.",
    link: "/blog/aws-features"
  },
  {
    title: "Kubernetes Tips",
    description: "Best practices for managing workloads at scale.",
    link: "/blog/kubernetes-tips"
  }
];

const TopCards = () => (
  <div className="max-w-3xl mx-auto mb-8 md:mb-12 px-4 md:px-0">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
      {dummyCards.map((card) => (
        <MotionSection
          key={card.title}
          className="rounded border text-center items-center flex flex-col justify-center h-32 md:h-44 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/20 shadow-sm p-4 md:p-6"
        >
          <h3 className="text-lg md:text-xl text-zinc-800 dark:text-zinc-200 font-semibold">
            {card.title}
          </h3>
          <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400">
            {card.description}
          </p>
          <a
            href={card.link}
            className="mt-2 text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
          >
            Read More
          </a>
        </MotionSection>
      ))}
    </div>
  </div>
);


const SupportCard = () => (
  <div className="max-w-3xl mx-auto mt-12 md:mt-16 px-4 md:px-0">
    <motion.section
      className="relative overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/30"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
      }}
    >
      {/* Background Pattern/Image */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10 ">
        <div className="absolute right-0 top-0 w-32 md:w-48 h-full">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full object-cover text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Abstract geometric pattern representing solidarity */}
            <defs>
              <pattern id="solidarity" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.3" />
                <path d="M5 5 L15 15 M15 5 L5 15" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#solidarity)" />
            <path d="M60 20 Q80 40 60 60 Q40 40 60 20" fill="currentColor" opacity="0.1" />
          </svg>
        </div>
      </div>

      {/* Content with smooth transition effect */}
      <motion.div
        className="relative z-10 p-4 md:p-6 pr-20 md:pr-32"
        variants={{
          hidden: { x: -20, opacity: 0 },
          visible: {
            x: 0,
            opacity: 1,
            transition: {
              duration: 0.6,
              ease: "easeOut",
              delay: 0.2
            }
          }
        }}
      >
        <motion.h3
          className="text-base md:text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2"
          variants={{
            hidden: { y: 10, opacity: 0 },
            visible: {
              y: 0,
              opacity: 1,
              transition: { delay: 0.3, duration: 0.4 }
            }
          }}
        >
          Stand in Solidarity
        </motion.h3>

        <motion.p
          className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed"
          variants={{
            hidden: { y: 10, opacity: 0 },
            visible: {
              y: 0,
              opacity: 1,
              transition: { delay: 0.4, duration: 0.4 }
            }
          }}
        >
          Supporting those affected by ongoing conflicts in Gaza, Syria, and Sudan.
        </motion.p>

        <motion.div
          className="flex flex-col gap-2 text-sm"
          variants={{
            hidden: { y: 10, opacity: 0 },
            visible: {
              y: 0,
              opacity: 1,
              transition: { delay: 0.5, duration: 0.4 }
            }
          }}
        >
          {[
            { href: "https://www.unrwa.org/donate", label: "Gaza Relief" },
            { href: "https://www.unicef.org/emergencies/war-syria", label: "Help Syria" },
            { href: "https://donate.unhcr.org/int/en/sudan", label: "Support Sudan" },
          ].map(({ href, label }, index) => (
            <motion.a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
              variants={{
                hidden: { x: -10, opacity: 0 },
                visible: {
                  x: 0,
                  opacity: 1,
                  transition: {
                    delay: 0.6 + (index * 0.1),
                    duration: 0.3
                  }
                }
              }}
            >
              <Globe className="mr-2 h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="relative">
                {label}
                <span className="absolute bottom-0 left-0 w-0 h-px bg-current transition-all duration-200 group-hover:w-full" />
              </span>
            </motion.a>
          ))}
        </motion.div>
      </motion.div>

      {/* Subtle right-side accent */}
      <motion.div
        className="absolute right-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-zinc-300 dark:via-zinc-600 to-transparent"
        variants={{
          hidden: { scaleY: 0 },
          visible: {
            scaleY: 1,
            transition: {
              delay: 0.7,
              duration: 0.8,
              ease: "easeOut"
            }
          }
        }}
      />
    </motion.section>
  </div>
);
const LifeBlogSection = ({ posts }: { posts: Post[] }) => {
  const lifePosts = useMemo(
    () =>
      posts.filter((post) =>
        post.categories?.some(
          (category) => category.name.toLowerCase() === "work-life"
        )
      ),
    [posts]
  );

  if (!lifePosts.length) return null;

  return (
    <div className="mx-auto p-4 rounded-md dark:bg-indigo-950 bg-indigo-800 border border-indigo-200 dark:border-indigo-800  mt-8 md:mt-12 mb-4 md:mb-12">
      <MotionSection>
        <h2 className="text-lg md:text-2xl font-semibold text-zinc-200 dark:text-white mb-2 md:mb-6">
          Life & Work
        </h2>
        <div className="space-y-4 md:space-y-3 divide-y divide-zinc-200 dark:divide-zinc-700">
          {lifePosts.map((post) => (
            <div className="py-3 md:py-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-2">
                <Link
                  to={`/blog/post/${post.slug}`}
                  className="font-medium text-indigo-200 dark:text-indigo-400 hover:underline leading-tight"
                >
                  {post.title}
                </Link>
                <div className="hidden md:flex items-center flex-1 mx-3">
                  <span className="h-px w-full bg-zinc-300 dark:bg-zinc-700" />
                </div>
                <span className="text-xs md:text-sm text-zinc-100 dark:text-zinc-400 mt-1 md:mt-0">
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              {post.summary && (
                <p className="mt-1 text-sm text-zinc-100 dark:text-zinc-400 line-clamp-2">
                  {post.summary}
                </p>
              )}
            </div>
          ))}
        </div>
      </MotionSection>
    </div>
  );
};

const HeroSection = ({ socials }: { socials: SocialLink[] }) => (
  <MotionSection className="max-w-3xl mx-auto py-6 px-4 md:px-0">
    <div className="flex items-center justify-between mb-2 mt-6 md:mt-10">
      <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100">
        Yahya
      </h1>
      <div className="gap-3 mt-1 sm:mt-0 md:flex md:flex-row grid grid-cols-3">
        {socials.map((social) => (
          <SocialIcon key={social.id} social={social} />
        ))}
      </div>
    </div>
    <p className="text-sm sm:text-base md:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
      Cloud DevOps Engineer. Writing about systems, automation, networking and
      engineering.
    </p>
  </MotionSection>
);

export default function Homepage() {
  const { posts, socials } = useLoaderData<LoaderData>();
  const [query, setQuery] = useState("");

  const filteredPosts = useMemo(
    () =>
      query
        ? posts.filter(
          (post) =>
            post.title.toLowerCase().includes(query.toLowerCase()) ||
            post.summary?.toLowerCase().includes(query.toLowerCase()) ||
            post.categories?.some((category) =>
              category.name.toLowerCase().includes(query.toLowerCase())
            )
        )
        : posts,
    [query, posts]
  );

  return (
    <div className="min-h-screen">
      <HeroSection socials={socials} />
      <TopCards />
      <SearchBox query={query} setQuery={setQuery} />
      <TopicSections posts={filteredPosts} />
      <LifeBlogSection posts={filteredPosts} />
      <div className="flex w-full items-center justify-center px-4 md:px-0">
        <Link
          to="/blog/posts"
          className="px-4 py-2 rounded text-lg text-center w-full max-w-56  text-indigo-800 dark:text-indigo-400 hover:underline"
        >
          Browse more articles
        </Link>
      </div>
      <SupportCard />
    </div>
  );
}