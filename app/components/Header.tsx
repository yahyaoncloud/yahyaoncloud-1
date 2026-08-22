import { Link, useLocation } from "@remix-run/react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../Contexts/ThemeContext";

interface NavLink {
  name: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { name: "Projects", href: "/projects" },
  { name: "Research", href: "/research" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  const { theme, toggleTheme, isDark } = useTheme();
  const isDarkMode = isDark !== undefined ? isDark : theme === "dark";
  const location = useLocation();

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  const getSubpageName = () => {
    if (location.pathname.startsWith("/projects/")) return "Project";
    if (location.pathname.startsWith("/projects")) return "Projects";
    if (location.pathname.startsWith("/research")) return "Research";
    if (location.pathname.startsWith("/contact")) return "Contact";
    return "";
  };

  const subpage = getSubpageName();

  return (
    <header className="flex items-center justify-between py-2 mb-10 text-sm text-zinc-600 dark:text-zinc-400">
      {/* Title & Breadcrumbs */}
      <div className="flex items-center gap-1.5 min-w-0">
        <Link
          to="/"
          className="font-medium text-zinc-900 dark:text-zinc-100 px-1.5 py-0.5 -ml-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-150 active:scale-95"
        >
          Yahya
        </Link>
        {subpage && (
          <>
            <span className="text-zinc-300 dark:text-zinc-700 select-none">/</span>
            <span className="text-zinc-500 dark:text-zinc-400 truncate text-xs sm:text-sm">
              {subpage}
            </span>
          </>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex items-center gap-1 sm:gap-1.5">
        {NAV_LINKS.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.name}
              to={link.href}
              className={`px-2 py-1 rounded text-xs sm:text-sm transition-all duration-150 active:scale-95 ${
                active
                  ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-medium"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/70 dark:hover:bg-zinc-900/70"
              }`}
            >
              {link.name}
            </Link>
          );
        })}

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-1.5 ml-0.5 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-150 active:scale-90"
          aria-label="Switch theme"
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </nav>
    </header>
  );
}
