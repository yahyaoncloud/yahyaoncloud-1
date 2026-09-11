import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "@remix-run/react";
import {
  LuSun as Sun,
  LuMoon as Moon,
  LuMenu as Menu,
  LuX as X,
  LuChevronDown as ChevronDown,
  LuBriefcase as Briefcase,
  LuFileText as FileText,
  LuMessageSquare as MessageSquare,
  LuDownload as Download,
} from "~/components/ui/icons";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../Contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";

export default function Header() {
  const { theme, toggleTheme, isDark } = useTheme();
  const isDarkMode = isDark !== undefined ? isDark : theme === "dark";
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [workDropdownOpen, setWorkDropdownOpen] = useState(false);
  const [miscDropdownOpen, setMiscDropdownOpen] = useState(false);

  // Hover delay timers (100ms stay container grace period)
  const workTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const miscTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearWorkTimeout = () => {
    if (workTimeoutRef.current) {
      clearTimeout(workTimeoutRef.current);
      workTimeoutRef.current = null;
    }
  };

  const handleWorkMouseEnter = () => {
    clearWorkTimeout();
    setWorkDropdownOpen(true);
  };

  const handleWorkMouseLeave = () => {
    clearWorkTimeout();
    workTimeoutRef.current = setTimeout(() => {
      setWorkDropdownOpen(false);
    }, 100);
  };

  const clearMiscTimeout = () => {
    if (miscTimeoutRef.current) {
      clearTimeout(miscTimeoutRef.current);
      miscTimeoutRef.current = null;
    }
  };

  const handleMiscMouseEnter = () => {
    clearMiscTimeout();
    setMiscDropdownOpen(true);
  };

  const handleMiscMouseLeave = () => {
    clearMiscTimeout();
    miscTimeoutRef.current = setTimeout(() => {
      setMiscDropdownOpen(false);
    }, 100);
  };

  // Close menus on route change and cleanup timers
  useEffect(() => {
    setMobileMenuOpen(false);
    clearWorkTimeout();
    clearMiscTimeout();
    setWorkDropdownOpen(false);
    setMiscDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      clearWorkTimeout();
      clearMiscTimeout();
    };
  }, []);


  // Close menus on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        setWorkDropdownOpen(false);
        setMiscDropdownOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
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
  const isProjectsActive = location.pathname.startsWith("/projects") || location.pathname.startsWith("/work");
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
            prefetch="intent"
            className={`px-2.5 py-1 rounded-md text-sm transition-all duration-150 ${
              isBlogActive
                ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/80 font-medium"
                : "text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 font-normal"
            }`}
          >
            Blog
          </Link>

          {/* Work Dropdown (Projects & Research) */}
          <div
            className="relative"
            onMouseEnter={handleWorkMouseEnter}
            onMouseLeave={handleWorkMouseLeave}
          >
            <DropdownMenu modal={false} open={workDropdownOpen} onOpenChange={setWorkDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  onClick={() => setWorkDropdownOpen((prev) => !prev)}
                  className={`px-2.5 py-1 rounded-md text-sm transition-all duration-150 cursor-pointer inline-flex items-center gap-1 outline-none ${
                    isWorkActive
                      ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/80 font-medium"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 font-normal"
                  }`}
                >
                  <span>Work</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-150 opacity-60 ${workDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={6}
                onMouseEnter={handleWorkMouseEnter}
                onMouseLeave={handleWorkMouseLeave}
                className="w-36 p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg shadow-black/5 dark:shadow-black/30"
              >
                <DropdownMenuItem asChild>
                  <Link
                    to="/projects"
                    prefetch="intent"
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors ${
                      isProjectsActive
                        ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/70 font-medium"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400"
                    }`}
                  >
                    Projects
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/research"
                    prefetch="intent"
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors ${
                      isResearchActive
                        ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/70 font-medium"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400"
                    }`}
                  >
                    Research
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Misc Dropdown (Guestbook, Resume) */}
          <div
            className="relative"
            onMouseEnter={handleMiscMouseEnter}
            onMouseLeave={handleMiscMouseLeave}
          >
            <DropdownMenu modal={false} open={miscDropdownOpen} onOpenChange={setMiscDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  onClick={() => setMiscDropdownOpen((prev) => !prev)}
                  className={`px-2.5 py-1 rounded-md text-sm transition-all duration-150 cursor-pointer inline-flex items-center gap-1 outline-none ${
                    isMiscActive
                      ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/80 font-medium"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 font-normal"
                  }`}
                >
                  <span>Misc</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-150 opacity-60 ${miscDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={6}
                onMouseEnter={handleMiscMouseEnter}
                onMouseLeave={handleMiscMouseLeave}
                className="w-36 p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg shadow-black/5 dark:shadow-black/30"
              >
                <DropdownMenuItem asChild>
                  <Link
                    to="/guestbook"
                    prefetch="intent"
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors ${
                      isGuestbookActive
                        ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/70 font-medium"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400"
                    }`}
                  >
                    Guestbook
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href="/resume"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors text-zinc-600 dark:text-zinc-400 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <span>Resume</span>
                    <span className="text-[10px] font-mono text-zinc-400">PDF</span>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 ml-1 rounded-md text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer shrink-0"
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
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
            aria-label="Switch theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            type="button"
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
                prefetch="intent"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3.5 py-2 rounded-lg transition-colors ${
                  isBlogActive
                    ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/80 font-medium"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30"
                }`}
              >
                Blog
              </Link>

              {/* Work Group */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 mt-1">
                <div className="px-3.5 pb-1 text-[11px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Work
                </div>
                <div className="flex flex-col gap-0.5">
                  <Link
                    to="/projects"
                    prefetch="intent"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors ${
                      isProjectsActive
                        ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/80 font-medium"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30"
                    }`}
                  >
                    <Briefcase size={16} className="opacity-70 shrink-0" />
                    <span>Projects</span>
                  </Link>
                  <Link
                    to="/research"
                    prefetch="intent"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors ${
                      isResearchActive
                        ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/80 font-medium"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30"
                    }`}
                  >
                    <FileText size={16} className="opacity-70 shrink-0" />
                    <span>Research</span>
                  </Link>
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
                        : "text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30"
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
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 transition-colors"
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
