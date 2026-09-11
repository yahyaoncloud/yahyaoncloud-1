import { Link } from "@remix-run/react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 pt-6 mt-14 text-xs md:text-sm text-zinc-500 dark:text-zinc-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-4">
        <span>© {currentYear} Yahya</span>
        <span className="text-zinc-300 dark:text-zinc-700">•</span>
        <Link
          to="/privacy-policy"
          className="hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors"
        >
          Privacy
        </Link>
        <span className="text-zinc-300 dark:text-zinc-700">•</span>
        <Link
          to="/terms-and-conditions"
          className="hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors"
        >
          Terms
        </Link>
        <span className="text-zinc-300 dark:text-zinc-700">•</span>
        <Link
          to="/contact"
          className="hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors"
        >
          Contact
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/admin"
          className="text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-400 transition-colors text-xs font-mono"
          title="Management Portal"
        >
          Portal
        </Link>
      </div>
    </footer>
  );
}
