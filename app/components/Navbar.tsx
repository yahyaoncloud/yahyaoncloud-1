import { Sun, Moon, User, ChevronDown, Menu } from "lucide-react";
import { useTheme } from "../Contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const profileMenuItems = [
    { name: "Profile", href: "/admin/profile" },
    { name: "Settings", href: "/admin/settings" },
    { name: "Sign Out", href: "/admin/logout" },
  ];

  return (
    <header className="sticky top-0 left-0 right-0 z-10">
      <div className="flex items-center justify-between px-4 py-2 min-h-[4rem]">
        {/* Sidebar Toggle */}
        <motion.button
          onClick={onToggleSidebar}
          className="p-3 rounded-xl bg-zinc-100/80 hover:bg-zinc-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 shadow-sm hover:shadow-md transition-all duration-300"
          aria-label="Toggle sidebar"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Menu size={18} className="text-zinc-600 dark:text-zinc-300" />
        </motion.button>

        {/* Right Controls */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-zinc-100/80 hover:bg-zinc-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 shadow-sm hover:shadow-md transition-all duration-300"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon size={18} className="text-zinc-700 dark:text-zinc-200" />
            ) : (
              <Sun size={18} className="text-zinc-700 dark:text-zinc-200" />
            )}
          </motion.button>

          {/* Profile Menu */}
          <div className="relative">
            <motion.button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center p-2 rounded-lg bg-zinc-100/80 hover:bg-zinc-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <User size={20} className="text-zinc-700 dark:text-zinc-200" />
              <motion.div animate={{ rotate: isProfileMenuOpen ? 180 : 0 }} className="ml-1">
                <ChevronDown size={16} className="text-zinc-700 dark:text-zinc-200" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {isProfileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  className="absolute right-0 mt-2 w-40 bg-zinc-50 dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden z-50"
                >
                  {profileMenuItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      {item.name}
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
