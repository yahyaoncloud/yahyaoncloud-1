import { Link } from "@remix-run/react";
import { Sun, Moon, User, ChevronDown, Menu } from "lucide-react";
import { useTheme } from "../Contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useUIStore } from "../store/uiStore";

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
    { name: "Profile", href: "/admin/profile" },
    { name: "Settings", href: "/admin/settings" },
    { name: "Sign Out", href: "/admin/logout" },
  ]
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { toggleSidebar } = useUIStore();
  
  const profileMenuItems = menuItems;

  return (
    <header className="sticky top-0 left-0 right-0 z-20 transition-all duration-300">
      {/* Glassmorphism Background for Navbar */}
      <div className="absolute inset-0 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 z-0" />

      <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Sidebar Toggle */}
        <motion.button
          onClick={toggleSidebar}
          className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors duration-200"
          aria-label="Toggle sidebar"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Menu size={20} strokeWidth={1.5} />
        </motion.button>

        {/* Right Controls */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors duration-200"
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

          {/* Profile Menu */}
          <div className="relative">
            <motion.button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-zinc-200/50 dark:border-zinc-700/50 bg-white/50 dark:bg-zinc-900/50 hover:bg-white/80 dark:hover:bg-zinc-800/80 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                <User size={18} className="text-zinc-600 dark:text-zinc-300" strokeWidth={1.5} />
              </div>
              <motion.div
                animate={{ rotate: isProfileMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown
                  size={14}
                  className="text-zinc-500 dark:text-zinc-400"
                  strokeWidth={2}
                />
              </motion.div>
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isProfileMenuOpen && (
                <>
                  {/* Invisible backdrop to close menu on click outside */}
                  <div 
                    className="fixed inset-0 z-30 bg-transparent"
                    onClick={() => setIsProfileMenuOpen(false)} 
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.95, y: -10, filter: "blur(10px)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="absolute right-0 mt-3 w-48 origin-top-right z-40"
                  >
                    <div className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-xl border border-white/20 dark:border-zinc-700/50 p-1.5 overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
                      {profileMenuItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          prefetch="intent" 
                          className="group flex items-center px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-200 rounded-xl hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition-colors duration-150"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <span className="relative">
                            {item.name}
                             <span className="absolute bottom-0 left-0 w-0 h-px bg-current transition-all duration-200 group-hover:w-full" />
                          </span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
