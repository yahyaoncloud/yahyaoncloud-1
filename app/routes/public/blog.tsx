import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getAllBlogPosts, type BlogPost } from "~/Services/content.server";

export async function loader() {
  const posts = await getAllBlogPosts();
  return json({ posts });
}

export default function BlogIndex() {
  const { posts } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-8 text-[15px] md:text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
      {/* Blog Posts List with Hairline Connectors */}
      <div className="space-y-4">
        {posts.map((post: BlogPost) => (
          <div key={post.slug} className="group">
            <Link
              to={`/blog/${post.slug}`}
              className="flex items-baseline justify-between py-1 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors"
            >
              <span className="font-normal text-zinc-800 dark:text-zinc-200 group-hover:underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-4 shrink-0 text-[15px] md:text-base">
                {post.title}
              </span>
              <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800 mx-2 md:mx-3" />
              <span className="font-mono text-xs md:text-sm text-zinc-400 dark:text-zinc-500 shrink-0">
                {post.displayDate}
              </span>
            </Link>
          </div>
        ))}
      </div>

      {/* Subscription Note */}
      <div className="pt-6 text-xs md:text-sm text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
        <span>Subscribe with</span>
        <a
          href="/rss.xml"
          className="text-zinc-700 dark:text-zinc-300 hover:underline"
        >
          RSS
        </a>
        <span>or</span>
        <a
          href="/atom.xml"
          className="text-zinc-700 dark:text-zinc-300 hover:underline"
        >
          Atom
        </a>
      </div>
    </div>
  );
}
