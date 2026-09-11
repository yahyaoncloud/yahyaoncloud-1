import { json, type MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getAllBlogPosts } from "~/Services/content.server";
import { LuRss } from "~/components/ui/icons";

export const headers = () => ({
  "Cache-Control": "public, max-age=120, s-maxage=600, stale-while-revalidate=86400",
});

export const meta: MetaFunction = () => {
  return [
    { title: "Writing & Notes — Yahya" },
    {
      name: "description",
      content:
        "Engineering articles, technical deep dives, and architectural notes on cloud platforms, Kubernetes, and network infrastructure.",
    },
  ];
};

export async function loader() {
  const posts = await getAllBlogPosts();
  const summaryPosts = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    displayDate: p.displayDate,
    tags: p.tags,
  }));
  return json(
    { posts: summaryPosts },
    {
      headers: {
        "Cache-Control": "public, max-age=120, s-maxage=600, stale-while-revalidate=86400",
      },
    }
  );
}

export default function BlogIndex() {
  const { posts } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-8 sm:space-y-10 text-[15px] md:text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
      {/* Header Section (Navbar Design Language Reference) */}
      <header className="space-y-3 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Writing & Notes
            </h1>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">
              Engineering articles, architectural notes, and deep dives on cloud infrastructure, Kubernetes, and network systems.
            </p>
          </div>

          {/* RSS / Atom Feed Action Pills with subtle indigo hover */}
          <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
            <a
              href="/rss.xml"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/60 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all shadow-2xs active:scale-95"
              title="RSS Feed"
            >
              <LuRss size={12} />
              <span>RSS</span>
            </a>
            <a
              href="/atom.xml"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/60 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all shadow-2xs active:scale-95"
              title="Atom Feed"
            >
              <span>Atom</span>
            </a>
          </div>
        </div>
      </header>

      {/* Blog Posts List */}
      <main className="space-y-5 sm:space-y-6">
        {posts.length === 0 ? (
          <div className="py-12 text-center text-sm font-mono text-zinc-400">
            No articles published yet.
          </div>
        ) : (
          posts.map((post) => (
            <article key={post.slug} className="group space-y-1.5">
              <Link
                to={`/blog/${post.slug}`}
                prefetch="intent"
                className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4 min-w-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-base sm:text-lg text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {post.title}
                  </span>
                  <span className="inline-block opacity-0 group-hover:opacity-100 text-indigo-600 dark:text-indigo-400 transition-all duration-150 transform group-hover:translate-x-0.5 text-xs">
                    →
                  </span>
                </div>

                <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500 shrink-0 select-none">
                  {post.displayDate}
                </span>
              </Link>

              {post.summary && (
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {post.summary}
                </p>
              )}

              {/* Tags if available */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {post.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-100/70 dark:bg-zinc-900/70 text-zinc-500 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-800/60 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))
        )}
      </main>

      {/* Footer Navigation Bar */}
      <footer className="pt-8 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-xs sm:text-sm font-mono">
        <Link
          to="/"
          prefetch="intent"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-zinc-200/70 dark:border-zinc-800/70 hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 transition-colors"
        >
          <span>← Back home</span>
        </Link>
        <a
          href="#top"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors"
        >
          <span>Top ↑</span>
        </a>
      </footer>
    </div>
  );
}
