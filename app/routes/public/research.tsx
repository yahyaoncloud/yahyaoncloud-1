import { useState } from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAllResearchPapers, type ResearchPaper } from "~/Services/content.server";
import MarkdownViewer from "~/components/MarkdownViewer";

export async function loader() {
  const papers = await getAllResearchPapers();
  return json({ papers });
}

function PaperItem({ paper }: { paper: ResearchPaper }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article className="space-y-2 pb-6 border-b border-zinc-100 dark:border-zinc-900 last:border-b-0">
      <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1">
        <span className="font-mono text-xs md:text-sm text-zinc-400">
          {paper.venue}
        </span>
        <span className="font-mono text-xs md:text-sm text-zinc-400">
          {paper.year}
        </span>
      </div>

      <h3 className="font-medium text-lg md:text-xl text-zinc-900 dark:text-zinc-100">
        {paper.title}
      </h3>

      <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-500">
        {paper.authors.join(", ")}
      </p>

      <p className="text-zinc-600 dark:text-zinc-400 pt-1">
        {paper.abstract}
      </p>

      {/* Tags */}
      {paper.tags && paper.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {paper.tags.map((tag, i) => (
            <span
              key={i}
              className="text-xs md:text-sm font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-800/60"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 text-sm md:text-base">
        {paper.content && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline cursor-pointer transition-colors"
          >
            {isExpanded ? "Hide Findings" : "Read Full Findings"}
          </button>
        )}
        {paper.pdfUrl && (
          <a
            href={paper.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            PDF Document
          </a>
        )}
      </div>

      {isExpanded && paper.content && (
        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <MarkdownViewer content={paper.content} />
        </div>
      )}
    </article>
  );
}

export default function ResearchIndex() {
  const { papers } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <h1>Research & Publications</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Technical papers, architecture benchmarks, and experimental studies on Zero-Trust network topologies and eBPF traffic engineering.
        </p>
      </div>

      {/* Papers List */}
      <div className="space-y-8">
        {papers.map((paper: ResearchPaper) => (
          <PaperItem key={paper.slug} paper={paper} />
        ))}
      </div>
    </div>
  );
}
