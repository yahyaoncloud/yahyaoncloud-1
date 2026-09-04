import { useState } from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAllResearchPapers, type ResearchPaper } from "~/Services/content.server";
import MarkdownViewer from "~/components/MarkdownViewer";

export const headers = () => ({
  "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
});

export async function loader() {
  const papers = await getAllResearchPapers();
  return json(
    { papers },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
      },
    }
  );
}

function PaperItem({ paper }: { paper: ResearchPaper }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article className="space-y-2.5 pb-6 border-b border-zinc-100 dark:border-zinc-900 last:border-b-0">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-2 min-w-0">
        <span className="font-mono text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          {paper.venue}
        </span>
        <span className="font-mono text-[11px] sm:text-xs text-zinc-400 dark:text-zinc-500 shrink-0">
          {paper.year}
        </span>
      </div>

      <h3 className="font-medium text-base sm:text-lg text-zinc-900 dark:text-zinc-100 leading-snug break-words">
        {paper.title}
      </h3>

      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 break-words">
        {paper.authors.join(", ")}
      </p>

      <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base pt-0.5 leading-relaxed">
        {paper.abstract}
      </p>

      {/* Tags */}
      {paper.tags && paper.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {paper.tags.map((tag, i) => (
            <span
              key={i}
              className="text-[11px] sm:text-xs font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-800/80"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3.5 sm:gap-5 pt-2 text-xs sm:text-sm font-mono">
        {paper.content && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline cursor-pointer transition-colors py-1 inline-flex items-center gap-1"
          >
            <span>{isExpanded ? "Hide Findings" : "Read Full Findings"}</span>
            <span className="text-xs">{isExpanded ? "↑" : "→"}</span>
          </button>
        )}
        {paper.pdfUrl && (
          <a
            href={paper.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="group text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors inline-flex items-center gap-1 py-1"
          >
            <span>PDF Document</span>
            <span className="inline-block transition-transform duration-200 group-hover:-rotate-45 origin-center text-xs">
              →
            </span>
          </a>
        )}
      </div>

      {isExpanded && paper.content && (
        <div className="mt-4 pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80 overflow-x-hidden">
          <MarkdownViewer content={paper.content} />
        </div>
      )}
    </article>
  );
}

export default function ResearchIndex() {
  const { papers } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Research & Publications
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Technical papers, architecture benchmarks, and experimental studies on Zero-Trust network topologies and eBPF traffic engineering.
        </p>
      </div>

      {/* Papers List */}
      <div className="space-y-6 sm:space-y-8">
        {papers.map((paper: ResearchPaper) => (
          <PaperItem key={paper.slug} paper={paper} />
        ))}
      </div>
    </div>
  );
}
