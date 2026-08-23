import { Link } from "@remix-run/react";

export default function TermsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1>Terms & Conditions</h1>
        <p className="text-xs font-mono text-zinc-400">
          Last updated: 2026
        </p>
      </div>

      <div className="space-y-4">
        <p>
          By using this website, submitting inquiries, or accessing technical articles and case studies, you agree to the following terms:
        </p>
        <ul className="list-disc pl-6 space-y-2 marker:text-zinc-400 dark:marker:text-zinc-600">
          <li>Content, architecture diagrams, and articles are published for educational and reference purposes.</li>
          <li>You may freely reference and link to publicly published materials with attribution.</li>
          <li>All original code snippets and research implementations are subject to their respective open-source licenses.</li>
        </ul>
      </div>

      <div className="pt-4">
        <Link
          to="/"
          className="text-sm md:text-base text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}