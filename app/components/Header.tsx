import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useRouteLoaderData } from "@remix-run/react";
import {
  LuSun as Sun,
  LuMoon as Moon,
  LuMenu as Menu,
  LuX as X,
  LuChevronDown as ChevronDown,
  LuBookOpen as BookOpen,
  LuBriefcase as Briefcase,
  LuFileText as FileText,
  LuMessageSquare as MessageSquare,
  LuDownload as Download,
} from "~/components/ui/icons";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../Contexts/ThemeContext";

export default function Header() {
  const { theme, toggleTheme, isDark } = useTheme();
  const isDarkMode = isDark !== undefined ? isDark : theme === "dark";
  const location = useLocation();
  const rootData = useRouteLoaderData<{ hasResearch?: boolean; researchCount?: number }>("root");
  const hasResearch = rootData?.hasResearch ?? false;
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

  // Close menus on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        setWorkDropdownOpen(false);
        setMiscDropdownOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close mobile menu on desktop breakpoint resize
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 640) {
        setMobileMenuOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent background scroll when mobile dropdown is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

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
  const isWorkActive = isProjectsActive || (hasResearch && isResearchActive);
  const isGuestbookActive = location.pathname.startsWith("/guestbook");
  const isMiscActive = isGuestbookActive;

  const getSubpageName = () => {
    if (isBlogActive) return "Blog";
    if (isProjectsActive) return "Projects";
    if (hasResearch && isResearchActive) return "Research";
    if (isGuestbookActive) return "Guestbook";
    return "";
  };

  const subpage = getSubpageName();

  return (
    <header className="sticky top-0 z-50 text-[15px] -mx-5 sm:-mx-6 px-5 sm:px-6 mb-6 md:mb-8">
      {/* Background with Blur (independent layer to avoid trapping fixed viewport children) */}
      <div
        className={`absolute inset-0 z-0 pointer-events-none transition-all duration-200 ${
          isScrolled || mobileMenuOpen
            ? "bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200/70 dark:border-zinc-800/70 shadow-xs shadow-black/5 dark:shadow-black/20"
            : "bg-transparent border-b border-transparent"
        }`}
      />

      <div className="relative z-50 flex items-center justify-between gap-4 py-3.5 sm:py-4">
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
            prefetch="intent"
            className={`px-2.5 py-1 rounded-md text-sm transition-all duration-150 ${
              isBlogActive
                ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/80 font-medium"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 font-normal"
            }`}
          >
            Blog
          </Link>

          {/* Work / Projects */}
          {hasResearch ? (
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
                      prefetch="intent"
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
                      prefetch="intent"
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
          ) : (
            <Link
              to="/projects"
              prefetch="intent"
              className={`px-2.5 py-1 rounded-md text-sm transition-all duration-150 cursor-pointer ${
                isProjectsActive
                  ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/80 font-medium"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 font-normal"
              }`}
            >
              Projects
            </Link>
          )}

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
                    prefetch="intent"
                    onClick={() => setMiscDropdownOpen(false)}
                    className={`flex items-center px-3 py-1.5 transition-colors ${
                      isGuestbookActive
                        ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/70 font-medium"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                  >
                    Guestbook
                  </Link>
                  <a
                    href="/resume"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMiscDropdownOpen(false)}
                    className="flex items-center justify-between px-3 py-1.5 transition-colors text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    <span>Resume</span>
                    <span className="text-[10px] font-mono text-zinc-400">PDF</span>
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Switcher */}
          <button
            type="button"
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
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
            aria-label="Switch theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop Overlay (dims background and closes menu on outside tap) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-nav-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 top-0 z-40 bg-black/25 dark:bg-black/60 backdrop-blur-[2px] sm:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Mobile Dropdown Navbar Overlay (floats over content without moving page) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-nav-menu"
            initial={{ opacity: 0, y: -8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 z-50 sm:hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl shadow-black/10 dark:shadow-black/40 px-5 py-3.5 max-h-[calc(100vh-5rem)] overflow-y-auto"
          >
            <nav className="flex flex-col gap-1 text-sm font-normal">
              <Link
                to="/blog"
                prefetch="intent"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors ${
                  isBlogActive
                    ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/80 font-medium"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40"
                }`}
              >
                <BookOpen size={16} className="opacity-70 shrink-0" />
                <span>Blog</span>
              </Link>

              {/* Work / Projects Section */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 mt-1">
                <div className="px-3.5 pb-1 text-[11px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  {hasResearch ? "Work" : "Projects"}
                </div>
                <div className="flex flex-col gap-0.5">
                  <Link
                    to="/projects"
                    prefetch="intent"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors ${
                      isProjectsActive
                        ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/80 font-medium"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40"
                    }`}
                  >
                    <Briefcase size={16} className="opacity-70 shrink-0" />
                    <span>Projects</span>
                  </Link>
                  {hasResearch && (
                    <Link
                      to="/research"
                      prefetch="intent"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors ${
                        isResearchActive
                          ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/80 font-medium"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40"
                      }`}
                    >
                      <FileText size={16} className="opacity-70 shrink-0" />
                      <span>Research</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Community & Links Section */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 mt-1">
                <div className="px-3.5 pb-1 text-[11px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Community & Links
                </div>
                <div className="flex flex-col gap-0.5">
                  <Link
                    to="/guestbook"
                    prefetch="intent"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors ${
                      isGuestbookActive
                        ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/80 font-medium"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40"
                    }`}
                  >
                    <MessageSquare size={16} className="opacity-70 shrink-0" />
                    <span>Guestbook</span>
                  </Link>
                  <a
                    href="/resume"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Download size={16} className="opacity-70 shrink-0" />
                      <span>Resume / CV</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 rounded">PDF</span>
                  </a>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
