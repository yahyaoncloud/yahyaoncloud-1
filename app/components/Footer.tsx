import { Link } from "@remix-run/react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 pt-6 mt-14 text-sm md:text-base text-zinc-500 dark:text-zinc-500 flex items-center justify-between">
      <div>
        <span>© {currentYear} Yahya</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Indirect subtle Admin portal trigger */}
        <Link
          to="/admin"
          className="text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-400 transition-colors"
          title="Management Portal"
        >
          Portal
        </Link>
      </div>
    </footer>
  );
}
