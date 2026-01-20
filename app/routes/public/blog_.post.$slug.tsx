import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { useTheme } from "~/Contexts/ThemeContext";
import {
  findPostBySlug,
  getPosts,
} from "~/Services/post.prisma.server";
import { getCategories } from "~/Services/category.prisma.server";
import { getTags } from "~/Services/tag.prisma.server";
import { marked } from "marked";
import { proseClasses } from "~/styles/prose";
import { useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Eye,
  Calendar,
  Share2,
  Share,
  Linkedin
} from "lucide-react";
import dummyImage from "~/assets/yahya_glass.png";
import { cacheHeader } from "pretty-cache-header";
import { getMarkdownContent } from "~/utils/cloudinary.server";

// --- Meta ---
export function meta({
  data,
}: {
  data: { post: any };
}) {
  return [
    { title: `${data?.post?.title || "Post"} - Yahya on Cloud` },
    { name: "description", content: data?.post?.summary || "" },
    { property: "og:title", content: data?.post?.title },
    { property: "og:description", content: data?.post?.summary },
    { property: "og:image", content: data?.post?.coverImage || dummyImage },
  ];
}

// --- Loader ---
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { slug } = params;
  if (!slug) {
    throw new Response("Slug is required", { status: 400 });
  }

  const post = await findPostBySlug(slug);
  if (!post) {
    throw new Response("Not Found", { status: 404 });
  }

  let content = post.content || "";

  if (content.startsWith("https://res.cloudinary.com")) {
    try {
      const publicId = content.match(/\/raw\/upload\/(.+)$/)?.[1];
      if (publicId) {
        content = await getMarkdownContent(slug, publicId);
      }
    } catch (error) {
      console.error(`Failed to fetch Markdown for post ${slug}:`, error);
      // Fallback to summary or empty if critical
    }
  }

  // Fetch dependencies
  const [allCategories, allTags, postsResult] = await Promise.all([
    getCategories(),
    getTags(),
    getPosts({ status: 'published', limit: 4, page: 1 }), // Fetch a few for "related"
  ]);

  // Enrich post with category and tag objects
  const categories = allCategories.filter(c => post.categoryIds.includes(c.id));
  const tags = allTags.filter(t => post.tagIds.includes(t.id));

  const enrichedPost = {
    ...post,
    categories,
    tags,
    content: marked(content)
  };

  const relatedPosts = postsResult.posts
    .filter(p => p.id !== post.id)
    .slice(0, 4);

  return json(
    {
      post: enrichedPost,
      author: post.author,
      relatedPosts,
    },
    {
      headers: {
        "Cache-Control": cacheHeader({
          public: true,
          maxAge: "5min",
          sMaxage: "15min",
          staleWhileRevalidate: "1day",
          staleIfError: "1h",
        }),
      },
    }
  );
};

// --- Enhance Blog Content ---
export function useEnhanceBlogContent() {
  useEffect(() => {
    const article = document.querySelector("article") || document;

    // --- TABLE WRAP ---
    article.querySelectorAll("table").forEach((table) => {
      if (table.parentElement?.classList.contains("overflow-x-auto")) return;
      const wrapper = document.createElement("div");
      wrapper.className =
        "overflow-x-auto bg-white dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-700 ";
      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(table);
      table.className +=
        " min-w-full divide-y divide-zinc-200 dark:divide-zinc-700";
    });

    // --- CODE BLOCKS ---
    article.querySelectorAll("pre").forEach((pre) => {
      if (pre.parentElement?.classList.contains("code-block-wrapper")) return;

      const wrapper = document.createElement("div");
      wrapper.className =
        "code-block-wrapper relative overflow-hidden rounded my-4";
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      // --- LANGUAGE LABEL ---
      const codeElement = pre.querySelector("code");
      let language = "code";
      if (codeElement) {
        const classList = Array.from(codeElement.classList);
        const langClass = classList.find((cls) => cls.startsWith("language-"));
        if (langClass) language = langClass.replace("language-", "");
      }
      const langLabel = document.createElement("div");
      langLabel.textContent = language;
      langLabel.className =
        "absolute bottom-2 right-2 text-xs font-mono px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300";
      wrapper.appendChild(langLabel);

      // --- COPY BUTTON ---
      const button = document.createElement("button");
      button.setAttribute("aria-label", "Copy code");
      button.className =
        "copy-button absolute top-2 right-2 p-1 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 opacity-0 transition-opacity hover:opacity-100";
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      `;

      button.addEventListener("click", async () => {
        if (!codeElement) return;
        try {
          await navigator.clipboard.writeText(codeElement.textContent || "");
          button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          `;
          setTimeout(() => {
            button.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="m5 15-2 0a2 2 0 0 1-2-2V4a2 2 0 0 1 2 2v1"></path>
              </svg>
            `;
          }, 2000);
        } catch (err) {
          console.error(err);
        }
      });

      wrapper.addEventListener("mouseenter", () => {
        button.style.opacity = "1";
      });
      wrapper.addEventListener("mouseleave", () => {
        button.style.opacity = "0";
      });

      wrapper.appendChild(button);
    });
  }, []);
}

// --- More Articles Component ---
const MoreArticlesCards = ({ posts }: { posts: any[] }) => {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!posts || posts.length === 0) return null;

  return (
    <motion.section
      className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-medium font-mono text-zinc-900 dark:text-zinc-100">
          More Articles
        </h2>
        <Link
          to="/blog/posts"
          className="group flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors"
        >
          <span className="relative">
            View all
            <span className="absolute bottom-0 left-0 w-0 h-px bg-current transition-all duration-200 group-hover:w-full" />
          </span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post, idx) => (
          <motion.article
            key={post.id}
            className="group relative bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6 hover:shadow-lg transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-600 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
             {post.coverImage && (
              <div className="mb-4 overflow-hidden rounded">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            <div className="space-y-3">
              <Link
                to={`/blog/post/${post.slug}`}
                className="group block text-base font-medium font-mono text-zinc-900 dark:text-zinc-100 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors line-clamp-2 leading-tight"
              >
                <span className="relative">
                  {post.title}
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-current transition-all duration-200 group-hover:w-full" />
                </span>
              </Link>

              <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                {post.summary}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-700">
                <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
                  {formatDate(post.date || post.createdAt)}
                </span>
                {post.minuteRead > 0 && (
                   <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                    <Clock size={12} />
                    {post.minuteRead} min
                  </span>
                )}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </motion.section>
  );
};

// --- Animation Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// --- Component ---
export default function PostPage() {
  const { theme } = useTheme();
  const { post, author, relatedPosts } = useLoaderData<typeof loader>();

  useEnhanceBlogContent();

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: post.title,
      text: post.summary || post.title,
      url: window.location.href,
    };
    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      } catch {
        // ignore
      }
    }
  };

  return (
    <motion.div
      className="w-[90vw] md:w-auto max-w-[1200px] mx-auto md:px-[2vw] px-[5vw] py-[5vh] space-y-[5vh]"
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
    >
      {/* Navigation */}
      <motion.div variants={fadeInUp}>
        <Link
          to="/blog/posts"
          className="group inline-flex mb-4 items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="relative">
             Articles
             <span className="absolute bottom-0 left-0 w-0 h-px bg-current transition-all duration-200 group-hover:w-full" />
          </span>
        </Link>
      </motion.div>
      
      {/* Header */}
      <motion.header variants={fadeInUp} className="space-y-8">
        <h1 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
          {post.title}
        </h1>

        {/* Minimalist Meta Line */}
        <div className="flex items-center gap-3 text-base text-zinc-500 dark:text-zinc-400 pb-8 border-b border-zinc-200 dark:border-zinc-700">
            <a
              href="https://www.linkedin.com/in/ykinwork1"
              target="_blank"
              rel="noopener noreferrer"
              className="group hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Linkedin size={14} />
              <span className="relative">
                {author?.authorName || "Yahya"}
                <span className="absolute bottom-0 left-0 w-0 h-px bg-current transition-all duration-200 group-hover:w-full" />
              </span>
            </a>

          <span>|</span>
          <time dateTime={(post.date || post.createdAt) as any}>{formatDate(post.date || post.createdAt)}</time>
          
           <button
            onClick={handleShare}
            className="group flex items-center gap-1.5 text-zinc-400 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors ml-auto"
          >
            <Share2 size={14} />
            <span className="hidden sm:inline relative">
              Share
               <span className="absolute bottom-0 left-0 w-0 h-px bg-current transition-all duration-200 group-hover:w-full" />
            </span>
          </button>
        </div>

        {post.summary && (
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {post.summary}
          </p>
        )}

        {/* Cover Image */}
        {post.coverImage && (
          <div className="w-full overflow-hidden rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
             <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-auto max-h-[60vh] object-cover"
            />
          </div>
        )}

        {/* Categories & Tags */}
        {(post.categories?.length > 0 || post.tags?.length > 0) && (
          <div className="flex flex-wrap gap-3 text-xs">
            {post.categories?.map((category: any) => (
              <Link
                key={category.id}
                to={`/blog/posts?category=${category.slug || category.id}`}
                className="group text-zinc-600 dark:text-zinc-400 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors"
              >
                <span className="relative">
                  {category.name}
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-current transition-all duration-200 group-hover:w-full" />
                </span>
              </Link>
            ))}
            {post.tags?.map((tag: any) => (
              <Link
                key={tag.id}
                to={`/blog/posts?tag=${tag.id}`} 
                className="group text-zinc-500 dark:text-zinc-500 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors"
              >
                <span className="relative">
                  #{tag.name}
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-current transition-all duration-200 group-hover:w-full" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </motion.header>

      {/* Article Content */}
      <motion.section variants={fadeInUp}>
        <article
          className={proseClasses}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </motion.section>

      {/* More Articles Section */}
      <MoreArticlesCards posts={relatedPosts} />
    </motion.div>
  );
}


