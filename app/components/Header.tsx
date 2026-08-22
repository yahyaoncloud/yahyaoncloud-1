import { Link, useLocation } from "@remix-run/react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../Contexts/ThemeContext";

interface NavLink {
  name: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { name: "Home", href: "/" },
  { name: "Projects", href: "/projects" },
  { name: "Research", href: "/research" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  const { theme, toggleTheme, isDark } = useTheme();
  const isDarkMode = isDark !== undefined ? isDark : theme === "dark";
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto flex items-center justify-between gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full border border-zinc-200/70 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md shadow-sm transition-all duration-200">
        {/* Brand / Name */}
        <Link
          to="/"
          className="flex items-center gap-1.5 px-2 py-1 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 hover:opacity-80 transition-opacity"
        >
          <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
          <span className="font-mono text-xs uppercase tracking-wider hidden sm:inline">Yahya</span>
        </Link>

        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block" />

        {/* Nav Links */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                to={link.href}
                className={`relative px-2.5 sm:px-3 py-1 rounded-full text-xs transition-all duration-150 ${
                  active
                    ? "font-medium text-zinc-900 dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Toggle theme"
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </nav>
    </header>
  );
}
