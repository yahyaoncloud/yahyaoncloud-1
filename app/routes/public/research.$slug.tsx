import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getResearchBySlug, type ResearchPaper } from "~/Services/content.server";
import MarkdownViewer from "~/components/MarkdownViewer";
import {
  LuArrowLeft,
  LuArrowUp,
  LuArrowUpRight,
  LuFileText,
  LuLink,
} from "~/components/ui/icons";

export const headers = () => ({
  "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
});

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.paper) {
    return [{ title: "Research Paper Not Found — Yahya" }];
  }
  return [
    { title: `${data.paper.title} — Research | Yahya` },
    { name: "description", content: data.paper.abstract },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { slug } = params;
  if (!slug) {
    throw new Response("Research slug is required", { status: 400 });
  }

  const paper = await getResearchBySlug(slug);
  if (!paper) {
    throw new Response("Research paper not found", { status: 404 });
  }

  return json(
    { paper },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
      },
    }
  );
}

export default function ResearchPaperDetail() {
  const { paper } = useLoaderData<{ paper: ResearchPaper }>();

  return (
    <article className="space-y-6 sm:space-y-8 text-sm sm:text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
      {/* Breadcrumb Navigation Bar (Navbar UI Reference) */}
      <nav
        className="flex items-center justify-between gap-3 text-xs sm:text-sm font-mono"
        aria-label="Breadcrumb"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Link
            to="/research"
            prefetch="intent"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 border border-zinc-200/70 dark:border-zinc-800/70 transition-colors"
          >
            <LuArrowLeft size={13} />
            <span>Research</span>
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700 select-none text-base">/</span>
          <span className="text-zinc-800 dark:text-zinc-200 font-medium truncate max-w-[200px] sm:max-w-sm">
            {paper.slug}
          </span>
        </div>

        {paper.year && (
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100/70 dark:bg-zinc-900/70 text-zinc-500 dark:text-zinc-400 text-xs border border-zinc-200/60 dark:border-zinc-800/60">
            {paper.year}
          </span>
        )}
      </nav>

      {/* Research Paper Header Card (Navbar Surface Styling Reference) */}
      <header className="space-y-4 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="space-y-2.5">
          {/* Venue & Metadata Row */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-zinc-500 dark:text-zinc-400">
            {paper.venue && (
              <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-800/60 font-medium">
                {paper.venue}
              </span>
            )}
            {paper.year && (
              <span className="sm:hidden font-mono text-zinc-400 dark:text-zinc-500">
                • {paper.year}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight break-words">
            {paper.title}
          </h1>

          {/* Authors */}
          {paper.authors && paper.authors.length > 0 && (
            <p className="text-xs sm:text-sm font-mono text-zinc-500 dark:text-zinc-400 pt-0.5">
              By {paper.authors.join(", ")}
            </p>
          )}
        </div>

        {/* Tags */}
        {paper.tags && paper.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {paper.tags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center text-xs font-mono px-2.5 py-1 rounded-md bg-zinc-100/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200/70 dark:border-zinc-800/70 hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons (Navbar Button UI Reference with subtle indigo hover) */}
        {(paper.pdfUrl || paper.doi) && (
          <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs sm:text-sm font-mono">
            {paper.pdfUrl && (
              <a
                href={paper.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white shadow-xs active:scale-[0.98] transition-all"
              >
                <LuFileText size={14} />
                <span>PDF Document</span>
                <LuArrowUpRight size={13} className="opacity-70" />
              </a>
            )}
            {paper.doi && (
              <a
                href={
                  paper.doi.startsWith("http")
                    ? paper.doi
                    : `https://doi.org/${paper.doi}`
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-2xs active:scale-[0.98] transition-all"
              >
                <LuLink size={14} />
                <span>DOI: {paper.doi}</span>
                <LuArrowUpRight size={13} className="opacity-60" />
              </a>
            )}
          </div>
        )}
      </header>

      {/* Abstract Callout Card */}
      {paper.abstract && (
        <section className="rounded-xl p-5 sm:p-6 bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800/70 space-y-2">
          <div className="font-mono text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
            Abstract
          </div>
          <p className="text-zinc-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed">
            {paper.abstract}
          </p>
        </section>
      )}

      {/* Full Findings / Paper Content */}
      {paper.content && (
        <main className="pt-1 sm:pt-2">
          <MarkdownViewer content={paper.content} />
        </main>
      )}

      {/* Footer Navigation Bar (Navbar UI Reference) */}
      <footer className="pt-8 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-xs sm:text-sm font-mono">
        <Link
          to="/research"
          prefetch="intent"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-zinc-200/70 dark:border-zinc-800/70 hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 transition-colors"
        >
          <LuArrowLeft size={13} />
          <span>All research</span>
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
