import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "@remix-run/react";
import { Sun, Moon, Menu, X, ChevronDown } from "lucide-react";
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

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
    <header
      className={`sticky top-0 z-50 text-[15px] transition-all duration-200 -mx-4 sm:-mx-6 px-4 sm:px-6 mb-6 md:mb-8 ${
        isScrolled
          ? "pt-4 pb-3.5 sm:py-4.5 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200/70 dark:border-zinc-800/70 shadow-xs shadow-black/5 dark:shadow-black/20"
          : "pt-4 pb-3 sm:py-5 bg-transparent border-b border-transparent"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Title & Subpage Indicator */}
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <Link
            to="/"
            className="font-bold text-zinc-900 dark:text-zinc-100 text-xl md:text-2xl tracking-tight px-1 py-0.5 -ml-1 rounded-md hover:opacity-80 transition-opacity shrink-0"
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

        {/* Desktop Navigation Links */}
        <nav className="hidden sm:flex items-center gap-1 sm:gap-1.5 ml-auto">
          {/* Blog Link */}
          <Link
            to="/blog"
            className={`px-2.5 py-1 rounded-md text-sm transition-all duration-150 ${
              isBlogActive
                ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/80 font-medium"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 font-normal"
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
              className={`px-2.5 py-1 rounded-md text-sm transition-all duration-150 cursor-pointer inline-flex items-center gap-1 ${
                isWorkActive
                  ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/80 font-medium"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 font-normal"
              }`}
            >
              <span>Work</span>
              <ChevronDown size={13} className={`transition-transform duration-150 opacity-60 ${workDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {workDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 3, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 3, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 mt-1 w-36 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg shadow-black/5 dark:shadow-black/30 z-30 overflow-hidden text-sm"
                >
                  <Link
                    to="/projects"
                    onClick={() => setWorkDropdownOpen(false)}
                    className={`flex items-center px-3 py-1.5 transition-colors ${
                      isProjectsActive
                        ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/70 font-medium"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                  >
                    Projects
                  </Link>
                  <Link
                    to="/research"
                    onClick={() => setWorkDropdownOpen(false)}
                    className={`flex items-center px-3 py-1.5 transition-colors ${
                      isResearchActive
                        ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/70 font-medium"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100"
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
              className={`px-2.5 py-1 rounded-md text-sm transition-all duration-150 cursor-pointer inline-flex items-center gap-1 ${
                isMiscActive
                  ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/80 font-medium"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 font-normal"
              }`}
            >
              <span>Misc</span>
              <ChevronDown size={13} className={`transition-transform duration-150 opacity-60 ${miscDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {miscDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 3, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 3, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 mt-1 w-36 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg shadow-black/5 dark:shadow-black/30 z-30 overflow-hidden text-sm"
                >
                  <Link
                    to="/guestbook"
                    onClick={() => setMiscDropdownOpen(false)}
                    className={`flex items-center px-3 py-1.5 transition-colors ${
                      isGuestbookActive
                        ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/70 font-medium"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100"
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
            className="p-1.5 ml-1 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer shrink-0"
            aria-label="Switch theme"
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </nav>

        {/* Mobile Actions: Theme + Burger Toggle */}
        <div className="flex sm:hidden items-center gap-1 ml-auto">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
            aria-label="Switch theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="sm:hidden overflow-hidden pt-3 pb-2 border-b border-zinc-200 dark:border-zinc-800"
          >
            <nav className="flex flex-col gap-1 py-1 text-sm">
              <Link
                to="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  isBlogActive
                    ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/80 font-medium"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40"
                }`}
              >
                Blog
              </Link>

              {/* Work Group */}
              <div className="pt-1">
                <div className="px-3 py-1 text-[11px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Work
                </div>
                <div className="flex flex-col gap-0.5 pl-2">
                  <Link
                    to="/projects"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      isProjectsActive
                        ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/80 font-medium"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40"
                    }`}
                  >
                    Projects
                  </Link>
                  <Link
                    to="/research"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      isResearchActive
                        ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/80 font-medium"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40"
                    }`}
                  >
                    Research
                  </Link>
                </div>
              </div>

              {/* Misc Group */}
              <div className="pt-1">
                <div className="px-3 py-1 text-[11px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Misc
                </div>
                <div className="flex flex-col gap-0.5 pl-2">
                  <Link
                    to="/guestbook"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      isGuestbookActive
                        ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/80 font-medium"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40"
                    }`}
                  >
                    Guestbook
                  </Link>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
