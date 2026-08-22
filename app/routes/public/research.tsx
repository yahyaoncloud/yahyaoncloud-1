import { useState } from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Calendar,
  Users,
} from "lucide-react";
import { getAllResearchPapers, type ResearchPaper } from "~/Services/content.server";
import MarkdownViewer from "~/components/MarkdownViewer";

export async function loader() {
  const papers = await getAllResearchPapers();
  return json({ papers });
}

const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

function PaperCard({ paper }: { paper: ResearchPaper }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 space-y-4">
      {/* Venue & Year */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div className="flex items-center gap-2">
          <Bookmark size={13} className="text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-mono font-medium text-indigo-600 dark:text-indigo-400">
            {paper.venue}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
          <Calendar size={12} />
          <span>{paper.year}</span>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        {paper.title}
      </h2>

      {/* Authors */}
      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <Users size={13} className="text-zinc-400" />
        <span>{paper.authors.join(", ")}</span>
      </div>

      {/* Abstract */}
      <div className="space-y-1.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed bg-zinc-50/50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/60">
        <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs uppercase tracking-wider font-mono">
          Abstract
        </p>
        <p>{paper.abstract}</p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {paper.tags.map((tag, i) => (
          <span
            key={i}
            className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Expandable Extended Analysis */}
      {paper.content && (
        <div className="pt-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={14} />
                <span>Hide Full Report</span>
              </>
            ) : (
              <>
                <ChevronDown size={14} />
                <span>Read Full Technical Findings</span>
              </>
            )}
          </button>

          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60">
              <MarkdownViewer content={paper.content} />
            </div>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/60 text-xs">
        <div>
          {paper.doi && (
            <span className="font-mono text-[11px] text-zinc-400">
              DOI: <span className="text-zinc-600 dark:text-zinc-300">{paper.doi}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {paper.pdfUrl && (
            <a
              href={paper.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
            >
              <Download size={12} />
              <span>PDF Document</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResearchIndex() {
  const { papers } = useLoaderData<typeof loader>();

  return (
    <motion.div className="space-y-10" initial="hidden" animate="visible" variants={fadeInUp}>
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Research & Whitepapers
          </h1>
        </div>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl">
          Technical papers, architecture benchmarks, and experimental studies on Zero-Trust network models, kernel-level eBPF packet processing, and hybrid cloud scalability.
        </p>
      </div>

      {/* Papers List */}
      <div className="space-y-6">
        {papers.map((paper: ResearchPaper) => (
          <PaperCard key={paper.slug} paper={paper} />
        ))}
      </div>
    </motion.div>
  );
}
