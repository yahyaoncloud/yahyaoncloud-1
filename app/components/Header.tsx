import { useState, useEffect } from "react";
import { Link, useLocation } from "@remix-run/react";
import { Sun, Moon, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../Contexts/ThemeContext";

interface NavLink {
  name: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { name: "Blog", href: "/blog" },
  { name: "Projects", href: "/projects" },
  { name: "Research", href: "/research" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  const { theme, toggleTheme, isDark } = useTheme();
  const isDarkMode = isDark !== undefined ? isDark : theme === "dark";
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  const getSubpageName = () => {
    if (location.pathname.startsWith("/blog/")) return "Blog";
    if (location.pathname.startsWith("/blog")) return "Blog";
    if (location.pathname.startsWith("/projects/")) return "Project";
    if (location.pathname.startsWith("/projects")) return "Projects";
    if (location.pathname.startsWith("/research")) return "Research";
    if (location.pathname.startsWith("/contact")) return "Contact";
    return "";
  };

  const subpage = getSubpageName();

  return (
    <header className="relative py-1.5 mb-5 md:mb-6 text-[15px] text-zinc-600 dark:text-zinc-400">
      <div className="flex items-center justify-between">
        {/* Title & Breadcrumbs */}
        <div className="flex items-center gap-2 min-w-0">
          <Link
            to="/"
            className="font-normal text-zinc-900 dark:text-zinc-100 text-base px-1.5 py-0.5 -ml-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-150 active:scale-95"
          >
            Yahya
          </Link>
          {subpage && (
            <>
              <span className="text-zinc-300 dark:text-zinc-700 select-none text-sm">/</span>
              <span className="text-zinc-500 dark:text-zinc-400 truncate text-sm font-medium">
                {subpage}
              </span>
            </>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 md:gap-2">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                to={link.href}
                className={`px-3 py-1 rounded text-[15px] transition-all duration-150 active:scale-95 ${active
                  ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-medium"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/70 dark:hover:bg-zinc-900/70 font-normal"
                  }`}
              >
                {link.name}
              </Link>
            );
          })}

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-1.5 ml-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-150 active:scale-90 cursor-pointer"
            aria-label="Switch theme"
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </nav>

        {/* Mobile Actions: Theme + Burger Toggle */}
        <div className="flex md:hidden items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            aria-label="Switch theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="md:hidden overflow-hidden pt-3 pb-2 border-b border-zinc-200 dark:border-zinc-800"
          >
            <nav className="flex flex-col gap-1 py-1">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3.5 py-2 rounded-lg text-base transition-all duration-150 ${active
                      ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-medium"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60"
                      }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
