import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "@remix-run/react";
import { Sun, Moon, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../Contexts/ThemeContext";

export default function Header() {
  const { theme, toggleTheme, isDark } = useTheme();
  const isDarkMode = isDark !== undefined ? isDark : theme === "dark";
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [workDropdownOpen, setWorkDropdownOpen] = useState(false);
  const [miscDropdownOpen, setMiscDropdownOpen] = useState(false);

  const workDropdownRef = useRef<HTMLDivElement>(null);
  const miscDropdownRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setWorkDropdownOpen(false);
    setMiscDropdownOpen(false);
  }, [location.pathname]);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        workDropdownRef.current &&
        !workDropdownRef.current.contains(event.target as Node)
      ) {
        setWorkDropdownOpen(false);
      }
      if (
        miscDropdownRef.current &&
        !miscDropdownRef.current.contains(event.target as Node)
      ) {
        setMiscDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isBlogActive = location.pathname.startsWith("/blog");
  const isProjectsActive = location.pathname.startsWith("/projects");
  const isResearchActive = location.pathname.startsWith("/research");
  const isWorkActive = isProjectsActive || isResearchActive;
  const isGuestbookActive = location.pathname.startsWith("/guestbook");
  const isMiscActive = isGuestbookActive;

  const getSubpageName = () => {
    if (isBlogActive) return "Blog";
    if (isProjectsActive) return "Projects";
    if (isResearchActive) return "Research";
    if (isGuestbookActive) return "Guestbook";
    return "";
  };

  const subpage = getSubpageName();

  return (
    <header className="relative py-2 mb-6 md:mb-8 text-[15px] text-zinc-600 dark:text-zinc-400">
      <div className="flex items-center justify-between gap-4">
        {/* Title & Subpage Indicator */}
        <div className="flex items-center gap-2.5 min-w-0 shrink-0">
          <Link
            to="/"
            className="font-bold text-zinc-900 dark:text-zinc-100 text-xl md:text-2xl tracking-tight px-1 py-0.5 -ml-1 rounded-md hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
          >
            Yahya
          </Link>
          {subpage && (
            <>
              <span className="text-zinc-300 dark:text-zinc-700 select-none text-lg shrink-0">/</span>
              <span className="text-zinc-500 dark:text-zinc-400 truncate text-lg md:text-xl font-medium">
                {subpage}
              </span>
            </>
          )}
        </div>

        {/* Desktop Navigation Links — Far Right */}
        <nav className="hidden sm:flex items-center gap-1 sm:gap-2 ml-auto">
          {/* Blog Link */}
          <Link
            to="/blog"
            className={`px-3 py-1 rounded-md text-sm sm:text-[15px] transition-all duration-150 active:scale-95 ${
              isBlogActive
                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold"
                : "text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100/70 dark:hover:bg-zinc-900/70 font-normal"
            }`}
          >
            Blog
          </Link>

          {/* Work Dropdown (Projects & Research) */}
          <div
            ref={workDropdownRef}
            className="relative"
            onMouseEnter={() => setWorkDropdownOpen(true)}
            onMouseLeave={() => setWorkDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => setWorkDropdownOpen(!workDropdownOpen)}
              className={`px-3 py-1 rounded-md text-sm sm:text-[15px] transition-all duration-150 cursor-pointer ${
                isWorkActive
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100/70 dark:hover:bg-zinc-900/70 font-normal"
              }`}
            >
              Work
            </button>

            <AnimatePresence>
              {workDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 sm:right-0 sm:left-auto mt-1.5 w-36 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-lg shadow-black/10 dark:shadow-black/40 z-30 overflow-hidden font-mono"
                >
                  <Link
                    to="/projects"
                    onClick={() => setWorkDropdownOpen(false)}
                    className={`flex items-center px-3 py-1.5 text-xs sm:text-sm transition-colors ${
                      isProjectsActive
                        ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                    }`}
                  >
                    Projects
                  </Link>
                  <Link
                    to="/research"
                    onClick={() => setWorkDropdownOpen(false)}
                    className={`flex items-center px-3 py-1.5 text-xs sm:text-sm transition-colors ${
                      isResearchActive
                        ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                    }`}
                  >
                    Research
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Misc Dropdown (Guestbook) */}
          <div
            ref={miscDropdownRef}
            className="relative"
            onMouseEnter={() => setMiscDropdownOpen(true)}
            onMouseLeave={() => setMiscDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => setMiscDropdownOpen(!miscDropdownOpen)}
              className={`px-3 py-1 rounded-md text-sm sm:text-[15px] transition-all duration-150 cursor-pointer ${
                isMiscActive
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100/70 dark:hover:bg-zinc-900/70 font-normal"
              }`}
            >
              Misc
            </button>

            <AnimatePresence>
              {miscDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 sm:right-0 sm:left-auto mt-1.5 w-36 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-lg shadow-black/10 dark:shadow-black/40 z-30 overflow-hidden font-mono"
                >
                  <Link
                    to="/guestbook"
                    onClick={() => setMiscDropdownOpen(false)}
                    className={`flex items-center px-3 py-1.5 text-xs sm:text-sm transition-colors ${
                      isGuestbookActive
                        ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                    }`}
                  >
                    Guestbook
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-1.5 ml-1 rounded-md text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-150 active:scale-90 cursor-pointer shrink-0"
            aria-label="Switch theme"
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>

        {/* Mobile Actions: Theme + Burger Toggle */}
        <div className="flex sm:hidden items-center gap-1 ml-auto">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            aria-label="Switch theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
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
            className="sm:hidden overflow-hidden pt-3 pb-2 border-b border-zinc-200 dark:border-zinc-800"
          >
            <nav className="flex flex-col gap-1 py-1 font-mono text-sm">
              <Link
                to="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  isBlogActive
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60"
                }`}
              >
                Blog
              </Link>

              {/* Work Sublinks */}
              <div className="px-3 py-1 text-xs text-zinc-400 uppercase tracking-wider font-semibold">
                Work
              </div>
              <div className="pl-3 flex flex-col gap-1 text-sm">
                <Link
                  to="/projects"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    isProjectsActive
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60"
                  }`}
                >
                  Projects
                </Link>
                <Link
                  to="/research"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    isResearchActive
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60"
                  }`}
                >
                  Research
                </Link>
              </div>

              {/* Misc Sublinks */}
              <div className="px-3 py-1 text-xs text-zinc-400 uppercase tracking-wider font-semibold">
                Misc
              </div>
              <div className="pl-3 flex flex-col gap-1 text-sm">
                <Link
                  to="/guestbook"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    isGuestbookActive
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60"
                  }`}
                >
                  Guestbook
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
