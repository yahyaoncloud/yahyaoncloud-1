import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getAllBlogPosts, type BlogPost } from "~/Services/content.server";

export const headers = () => ({
  "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
});

export async function loader() {
  const posts = await getAllBlogPosts();
  return json(
    { posts },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
      },
    }
  );
}

export default function BlogIndex() {
  const { posts } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-8 text-[15px] md:text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
      {/* Blog Posts List with Hairline Connectors */}
      <div className="space-y-3.5">
        {posts.map((post: BlogPost) => (
          <div key={post.slug} className="group">
            <Link
              to={`/blog/${post.slug}`}
              prefetch="intent"
              className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 sm:py-1 text-zinc-800 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors gap-1 sm:gap-3 min-w-0"
              title={post.title}
            >
              <span className="font-normal text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:underline decoration-indigo-300 dark:decoration-indigo-700 underline-offset-4 text-[15px] md:text-base min-w-0 sm:truncate">
                {post.title}
              </span>
              <div className="hidden sm:block flex-1 h-px bg-zinc-200 dark:bg-zinc-800 group-hover:bg-indigo-300 dark:group-hover:bg-indigo-900/60 min-w-[20px] shrink-0 transition-colors" />
              <span className="font-mono text-xs md:text-xs text-zinc-400 dark:text-zinc-500 shrink-0 select-none">
                {post.displayDate}
              </span>
            </Link>
          </div>
        ))}
      </div>

      {/* Subscription Note */}
      <div className="pt-6 text-xs md:text-sm text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 font-mono">
        <span>Subscribe with</span>
        <a
          href="/rss.xml"
          className="text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          RSS
        </a>
        <span>or</span>
        <a
          href="/atom.xml"
          className="text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Atom
        </a>
      </div>
    </div>
  );
}
