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
      className="text-zinc-500 dark:text-zinc-300 hover:text-indigo-600"
      aria-label={social.id}
    >
      <Icon size={20} />
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
  <div className="max-w-3xl mx-auto mb-8">
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
  <div className="py-4">
    <div className="flex md:flex-nowrap justify-between items-center gap-2 text-base">
      <Link
        to={`/blog/post/${post.slug}`}
        className="font-medium md:text-nowrap text-indigo-600 dark:text-indigo-400 hover:underline"
      >
        {post.title}
      </Link>
      <span className="text-zinc-400 h-px w-full bg-zinc-300 dark:bg-zinc-700" />
      <span className="text-sm text-zinc-500 dark:text-zinc-400 text-nowrap">
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
      <div className="max-w-3xl mx-auto ">
        <p className="text-zinc-500 dark:text-zinc-400 text-center">
          No posts found matching your search.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto  space-y-12">
      {Object.entries(groupedPosts)
        .filter(([category]) => category.toLowerCase() !== "work-life")
        .map(([category, posts]) => (
          <MotionSection key={category}>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
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

const TopCards = () => (
  <div className="max-w-3xl mx-auto mb-12">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MotionSection className="rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
          Upcoming Event
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
          Join our DevOps Meetup on Sep 10th — networking, cloud, and Kubernetes
          deep dives.
        </p>
        <Link
          to="/events"
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center"
        >
          Learn more <ExternalLink className="ml-1 h-4 w-4" />
        </Link>
      </MotionSection>
      <MotionSection className="rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
          Latest News
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
          Our open-source project just crossed 5k stars on GitHub. Thanks for
          the support!
        </p>
        <a
          href="https://github.com/yourrepo"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center"
        >
          View project <ExternalLink className="ml-1 h-4 w-4" />
        </a>
      </MotionSection>
    </div>
  </div>
);

const SupportCard = () => (
  <div className="max-w-3xl mx-auto mt-16">
    <MotionSection className="rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/30 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-3">
        Stand with Gaza, Syria, and Sudan
      </h3>
      <p className="text-sm text-red-700 dark:text-red-300 mb-3">
        We stand in solidarity with those affected by ongoing conflicts.
        Consider donating or amplifying voices.
      </p>
      <div className="flex flex-wrap gap-4 text-sm">
        {[
          { href: "https://www.unrwa.org/donate", label: "Gaza Relief" },
          {
            href: "https://www.unicef.org/emergencies/war-syria",
            label: "Help Syria",
          },
          {
            href: "https://donate.unhcr.org/int/en/sudan",
            label: "Support Sudan",
          },
        ].map(({ href, label }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {label} <Globe className="ml-1 h-4 w-4" />
          </a>
        ))}
      </div>
    </MotionSection>
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
    <div className="max-w-3xl mx-auto px-4 mt-12 mb-12">
      <MotionSection>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-6">
          Life & Work
        </h2>
        <div className="space-y-6">
          {lifePosts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </MotionSection>
    </div>
  );
};

const HeroSection = ({ socials }: { socials: SocialLink[] }) => (
  <MotionSection className="max-w-3xl mx-auto mt-4  py-12">
    <div className="flex items-center justify-between mb-2">
      <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
        Hi, I'm Yahya
      </h1>
      <div className="flex gap-3">
        {socials.map((social) => (
          <SocialIcon key={social.id} social={social} />
        ))}
      </div>
    </div>
    <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
      Cloud + DevOps Engineer. Writing about systems, automation, and
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
      <div className="flex w-full items-center justify-center">
        <Link
          to="/blog/posts"
          className="px-4 py-2 rounded text-sm text-center max-w-48 border border-zinc-400 dark:border-zinc-700 bg-zinc-300 dark:bg-zinc-900 hover:border-zinc-500 dark:hover:bg-zinc-700"
        >
          Browse more articles
        </Link>
      </div>
      <SupportCard />
    </div>
  );
}
