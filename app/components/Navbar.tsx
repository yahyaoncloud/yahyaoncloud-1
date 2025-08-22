// components/Navbar.tsx
import {
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  Home,
  FileText,
  Users,
  BarChart3,
} from "lucide-react";
import { useTheme } from "../Contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "@remix-run/react";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeIndicator, setActiveIndicator] = useState({ width: 0, left: 0 });
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Posts", href: "/admin/posts", icon: FileText },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  ];

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const shouldBeScrolled = currentScrollY > 20;
      setScrolled((prev) => (prev !== shouldBeScrolled ? shouldBeScrolled : prev));
      lastScrollY = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const updateIndicator = () => {
      if (!navRef.current) return;
      const activeLink = navRef.current.querySelector(`[data-path="${location.pathname}"]`) as HTMLElement;
      if (activeLink) {
        const navRect = navRef.current.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        setActiveIndicator({ width: linkRect.width, left: linkRect.left - navRect.left });
      }
    };
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isProfileMenuOpen && !(event.target as Element).closest(".profile-menu-container")) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isProfileMenuOpen]);

  const isActiveLink = (href: string) =>
    href === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(href);

  const profileMenuItems = [
    { name: "Profile", href: "/admin/profile", icon: User },
    { name: "Settings", href: "/admin/settings", icon: Settings },
    { name: "Sign Out", href: "/admin/logout", icon: LogOut },
  ];

  return (
    <header className="w-auto sticky top-0 left-0 right-0 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 z-10 shadow-sm transition-all duration-300">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2 min-h-[4rem] w-full">
          {/* Collapsible Sidebar Button */}
          <div className="flex items-center">
            <motion.button
              onClick={onToggleSidebar}
              className="p-3 rounded-xl bg-zinc-100/80 hover:bg-zinc-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md"
              aria-label="Toggle sidebar"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Menu size={18} className="text-zinc-600 dark:text-zinc-300" />
            </motion.button>
          </div>

          {/* Center Navigation */}
          <nav className="hidden lg:flex items-center justify-center flex-1 mx-8">
            <div
              ref={navRef}
              className="relative flex items-center space-x-1 bg-zinc-100/50 dark:bg-zinc-800/50 rounded-2xl p-1 backdrop-blur-sm"
            >
              <motion.div
                className="absolute top-1 bottom-1 bg-zinc-200 dark:bg-zinc-700 rounded-xl shadow-md"
                animate={{ width: activeIndicator.width, x: activeIndicator.left }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = isActiveLink(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    data-path={item.href}
                    className="relative z-10 flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300"
                  >
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                      <IconComponent
                        size={16}
                        className={`transition-colors duration-300 ${isActive ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-50"}`}
                      />
                    </motion.div>
                    <span className={`transition-colors duration-300 ${isActive ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"}`}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center space-x-3 ml-auto">
            {/* New Post */}
            <Link
              to="/admin/post/create"
              className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-50 font-medium shadow-md hover:shadow-lg transition-all duration-300"
            >
              <span className="text-sm">New Post</span>
            </Link>

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-zinc-100/80 hover:bg-zinc-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md"
              aria-label="Toggle theme"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {theme === "light" ? <Moon size={18} className="text-zinc-600 dark:text-zinc-300" /> : <Sun size={18} className="text-zinc-300 dark:text-zinc-50" />}
            </motion.button>

            {/* Profile Menu */}
            <div className="relative profile-menu-container">
              <motion.button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-3 p-2 rounded-xl bg-zinc-100/80 hover:bg-zinc-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <motion.div className="w-8 h-8 rounded-full bg-zinc-700 dark:bg-zinc-600 flex items-center justify-center shadow" whileHover={{ scale: 1.1 }}>
                  <User size={16} className="text-zinc-50" />
                </motion.div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">John Doe</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Admin</span>
                </div>
                <motion.div animate={{ rotate: isProfileMenuOpen ? 180 : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
                  <ChevronDown size={16} className="text-zinc-500 dark:text-zinc-400" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-zinc-50 dark:bg-zinc-900 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-700 overflow-hidden z-50"
                  >
                    <div className="py-2">
                      {profileMenuItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                          <motion.div key={item.name} whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                            <Link
                              to={item.href}
                              className={`flex items-center space-x-3 px-4 py-3 text-sm transition-all duration-300 ${item.name === "Sign Out"
                                  ? "text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                  : "text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                                }`}
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              <IconComponent size={16} />
                              <span>{item.name}</span>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden border-t border-zinc-200 dark:border-zinc-700">
        <nav className="flex overflow-x-auto scrollbar-hide">
          <div className="flex space-x-1 p-2 min-w-full">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = isActiveLink(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${isActive ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                >
                  <IconComponent size={16} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
