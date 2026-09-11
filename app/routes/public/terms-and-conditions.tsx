import { Link } from "@remix-run/react";
import { LuFileText, LuArrowLeft, LuArrowUp } from "~/components/ui/icons";

export default function TermsPage() {
  return (
    <div className="space-y-8 text-sm sm:text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
      {/* Breadcrumb Navigation Bar */}
      <nav
        className="flex items-center justify-between gap-3 text-xs sm:text-sm font-mono"
        aria-label="Breadcrumb"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Link
            to="/"
            prefetch="intent"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 border border-zinc-200/70 dark:border-zinc-800/70 transition-colors"
          >
            <LuArrowLeft size={13} />
            <span>Home</span>
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700 select-none text-base">/</span>
          <span className="text-zinc-800 dark:text-zinc-200 font-medium truncate">
            terms
          </span>
        </div>

        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100/70 dark:bg-zinc-900/70 text-zinc-500 dark:text-zinc-400 text-xs border border-zinc-200/60 dark:border-zinc-800/60">
          Open Source & Attribution
        </span>
      </nav>

      {/* Header Card */}
      <header className="space-y-3 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
          <LuFileText className="text-indigo-600 dark:text-indigo-400 shrink-0" size={26} />
          <span>Terms & Conditions</span>
        </h1>
        <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
          Last updated: 2026 • General Usage Guidelines
        </p>
      </header>

      <div className="space-y-4">
        <p>
          By using this website, submitting inquiries, or accessing technical articles and case studies, you agree to the following terms:
        </p>
        <ul className="list-disc pl-6 space-y-2 marker:text-zinc-400 dark:marker:text-zinc-600 text-sm">
          <li>Content, architecture diagrams, and articles are published for educational and reference purposes.</li>
          <li>You may freely reference and link to publicly published materials with proper attribution.</li>
          <li>All original code snippets and research implementations are subject to their respective open-source licenses.</li>
        </ul>
      </div>

      {/* Footer Navigation Bar */}
      <div className="pt-8 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-xs sm:text-sm font-mono">
        <Link
          to="/"
          prefetch="intent"
          className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"
        >
          <LuArrowLeft size={13} />
          <span>Back to home</span>
        </Link>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="inline-flex items-center gap-1 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <span>Top</span>
          <LuArrowUp size={13} />
        </button>
      </div>
    </div>
  );
}