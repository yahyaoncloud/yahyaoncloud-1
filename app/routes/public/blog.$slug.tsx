import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getBlogPostBySlug, type BlogPost } from "~/Services/content.server";
import MarkdownViewer from "~/components/MarkdownViewer";
import { LuArrowLeft, LuArrowUp } from "~/components/ui/icons";

export const headers = () => ({
  "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
});

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.post) {
    return [{ title: "Post Not Found — Yahya" }];
  }
  return [
    { title: `${data.post.title} — Yahya` },
    { name: "description", content: data.post.summary || data.post.title },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { slug } = params;
  if (!slug) {
    throw new Response("Post slug is required", { status: 400 });
  }

  const post = await getBlogPostBySlug(slug);
  if (!post) {
    throw new Response("Blog post not found", { status: 404 });
  }

  return json(
    { post },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
      },
    }
  );
}

export default function BlogPostDetail() {
  const { post } = useLoaderData<{ post: BlogPost }>();

  return (
    <article className="space-y-6 sm:space-y-8 text-sm sm:text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
      {/* Breadcrumb Navigation Bar (Navbar UI Reference) */}
      <nav
        className="flex items-center justify-between gap-3 text-xs sm:text-sm font-mono"
        aria-label="Breadcrumb"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Link
            to="/blog"
            prefetch="intent"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-zinc-700 dark:text-zinc-300 bg-zinc-100/60 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-colors"
          >
            <LuArrowLeft size={13} />
            <span>Blog</span>
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700 select-none text-base">/</span>
          <span className="text-zinc-800 dark:text-zinc-200 font-medium truncate max-w-[200px] sm:max-w-sm">
            {post.slug}
          </span>
        </div>

        {post.displayDate && (
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100/70 dark:bg-zinc-900/70 text-zinc-500 dark:text-zinc-400 text-xs border border-zinc-200/60 dark:border-zinc-800/60">
            {post.displayDate}
          </span>
        )}
      </nav>

      {/* Article Header Card (Navbar Surface Reference) */}
      <header className="space-y-4 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="space-y-2.5">
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-zinc-500 dark:text-zinc-400">
            {post.displayDate && (
              <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-800/60 font-medium">
                {post.displayDate}
              </span>
            )}
            {post.author && (
              <>
                <span className="text-zinc-300 dark:text-zinc-700 select-none">•</span>
                <span>By {post.author}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight break-words">
            {post.title}
          </h1>

          {/* Summary */}
          {post.summary && (
            <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed max-w-3xl pt-0.5">
              {post.summary}
            </p>
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {post.tags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center text-xs font-mono px-2.5 py-1 rounded-md bg-zinc-100/80 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200/70 dark:border-zinc-800/70 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Article Content */}
      <main className="pt-1 sm:pt-2">
        <MarkdownViewer content={post.content} />
      </main>

      {/* Footer Navigation Bar (Navbar UI Reference) */}
      <footer className="pt-8 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-xs sm:text-sm font-mono">
        <Link
          to="/blog"
          prefetch="intent"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-zinc-200/70 dark:border-zinc-800/70 hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 transition-colors"
        >
          <LuArrowLeft size={13} />
          <span>All posts</span>
        </Link>
        <a
          href="#top"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors"
        >
          <span>Top</span>
          <LuArrowUp size={13} />
        </a>
      </footer>
    </article>
  );
}
