import { Link } from "@remix-run/react";
import {
  LuSun as Sun,
  LuMoon as Moon,
  LuUser as User,
  LuChevronDown as ChevronDown,
  LuMenu as Menu,
  LuSearch as Search,
} from "~/components/ui/icons";
import { useTheme } from "../Contexts/ThemeContext";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useUIStore } from "../store/uiStore";
import { AdminCommandPalette } from "~/components/admin/AdminCommandPalette";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";

interface MenuItem {
  name: string;
  href: string;
}

interface NavbarProps {
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
  menuItems?: MenuItem[];
}

export default function Navbar({
  showSidebarToggle = true,
  menuItems = [
    { name: "Account & Security", href: "/admin/settings?tab=profile" },
    { name: "Site & SEO Settings", href: "/admin/settings?tab=seo" },
    { name: "Interface Preferences", href: "/admin/settings?tab=preferences" },
    { name: "Sign Out", href: "/admin/logout" },
  ],
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const { toggleSidebar } = useUIStore();

  // Global Keyboard Listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const profileMenuItems = menuItems;

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-20 transition-all duration-300">
        {/* Glassmorphism Background for Navbar */}
        <div className="absolute inset-0 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 z-0" />

        <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-3">
          {/* Left Controls: Sidebar Toggle + Command Palette Trigger */}
          <div className="flex items-center gap-3">
            {showSidebarToggle && (
              <motion.button
                onClick={toggleSidebar}
                className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors duration-200 cursor-pointer"
                aria-label="Toggle sidebar"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Menu size={20} strokeWidth={1.5} />
              </motion.button>
            )}

            {/* Quick Command Palette Button */}
            <motion.button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 text-xs transition-colors cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title="Search commands, pages, and quick actions (⌘K)"
            >
              <Search size={14} className="text-zinc-400" />
              <span className="font-normal">Quick Jump / Search...</span>
              <kbd className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-300/50 dark:border-zinc-700/50">
                ⌘K
              </kbd>
            </motion.button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Command Palette Trigger */}
            <motion.button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="sm:hidden p-2.5 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors duration-200 cursor-pointer"
              aria-label="Search and Commands"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search size={18} strokeWidth={1.5} />
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors duration-200 cursor-pointer"
              aria-label="Toggle theme"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {theme === "light" ? (
                <Moon size={20} strokeWidth={1.5} />
              ) : (
                <Sun size={20} strokeWidth={1.5} />
              )}
            </motion.button>

            {/* Profile Menu (Radix UI) */}
            <DropdownMenu modal={false} open={isProfileMenuOpen} onOpenChange={setIsProfileMenuOpen}>

              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-zinc-200/50 dark:border-zinc-700/50 bg-white/50 dark:bg-zinc-900/50 hover:bg-white/80 dark:hover:bg-zinc-800/80 transition-all duration-200 outline-none cursor-pointer"
                  aria-label="User profile menu"
                >
                  <div className="p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <User size={18} className="text-zinc-600 dark:text-zinc-300" strokeWidth={1.5} />
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-zinc-500 dark:text-zinc-400 transition-transform duration-200 ${
                      isProfileMenuOpen ? "rotate-180" : ""
                    }`}
                    strokeWidth={2}
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-52 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-xl border border-zinc-200/80 dark:border-zinc-800 p-1.5 ring-1 ring-black/5 dark:ring-white/5"
              >
                {profileMenuItems.map((item) => (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link
                      to={item.href}
                      prefetch="intent"
                      className="flex items-center px-3 py-2.5 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150 cursor-pointer w-full"
                    >
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Global Command Palette Dialog */}
      <AdminCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </>
  );
}
