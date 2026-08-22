import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getBlogPostBySlug, type BlogPost } from "~/Services/content.server";
import MarkdownViewer from "~/components/MarkdownViewer";

export async function loader({ params }: LoaderFunctionArgs) {
  const { slug } = params;
  if (!slug) {
    throw new Response("Post slug is required", { status: 400 });
  }

  const post = await getBlogPostBySlug(slug);
  if (!post) {
    throw new Response("Blog post not found", { status: 404 });
  }

  return json({ post });
}

export default function BlogPostDetail() {
  const { post } = useLoaderData<{ post: BlogPost }>();

  return (
    <article className="space-y-6 text-sm sm:text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
      {/* Title & Trailing Meta Line matching Siraj Chokshi screenshot */}
      <header className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center gap-2 text-xs sm:text-[13px] font-mono text-zinc-400 dark:text-zinc-500">
          <span className="text-zinc-500 dark:text-zinc-400">{post.author || "@yahyaoncloud"}</span>
          <span>|</span>
          <span>{post.displayDate}</span>
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800 ml-1" />
        </div>
      </header>

      {/* Article Content */}
      <main className="pt-2">
        <MarkdownViewer content={post.content} />
      </main>

      {/* Footer Navigation */}
      <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs sm:text-sm text-zinc-500">
        <Link
          to="/blog"
          className="text-zinc-900 dark:text-zinc-100 font-medium hover:underline"
        >
          ← All posts
        </Link>
        <a
          href="#top"
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          Top
        </a>
      </div>
    </article>
  );
}
