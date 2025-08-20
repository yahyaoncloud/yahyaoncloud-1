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
    const updateIndicator = () => {
      if (!navRef.current) return;
      const activeLink = navRef.current.querySelector(
        `[data-path="${location.pathname}"]`
      ) as HTMLElement;

      if (activeLink) {
        const navRect = navRef.current.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();

        setActiveIndicator({
          width: linkRect.width,
          left: linkRect.left - navRect.left,
        });
      }
    };
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [location.pathname]);

  const isActiveLink = (href: string) => {
    if (href === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(href);
  };

  const profileMenuItems = [
    { name: "Profile", href: "/admin/profile", icon: User },
    { name: "Settings", href: "/admin/settings", icon: Settings },
    { name: "Sign Out", href: "/admin/logout", icon: LogOut },
  ];

  return (
    <header className="w-auto sticky  top-0 left-0 right-0 border-b border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white z-10 ">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2 min-h-[4rem] w-full">
          {/* Hamburger (mobile) */}
          <div className="flex items-center md:hidden">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu size={18} className="text-zinc-600 dark:text-zinc-300" />
            </button>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center justify-center flex-1 mx-8">
            <div
              ref={navRef}
              className="relative flex items-center space-x-1 rounded-md p-1"
            >
              {/* Active indicator */}
              <motion.div
                className="absolute top-1 bottom-1 bg-zinc-200 dark:bg-zinc-700 rounded-md"
                animate={{
                  width: activeIndicator.width,
                  x: activeIndicator.left,
                }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              />

              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = isActiveLink(item.href);

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    data-path={item.href}
                    className="relative z-10 flex items-center space-x-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors"
                  >
                    <IconComponent
                      size={16}
                      className={`${
                        isActive
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-zinc-600 dark:text-zinc-400"
                      }`}
                    />
                    <span
                      className={
                        isActive
                          ? "text-zinc-900 dark:text-white"
                          : "text-zinc-600 dark:text-zinc-400"
                      }
                    >
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Right controls */}
          <div className="flex items-center space-x-3 ml-auto">
            {/* New Post */}
            <Link
              to="/admin/post/create"
              className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <span>New Post</span>
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon size={18} className="text-zinc-600 dark:text-zinc-300" />
              ) : (
                <Sun size={18} className="text-yellow-500" />
              )}
            </button>

            {/* Profile */}
            <div className="relative profile-menu-container">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <ChevronDown
                  size={16}
                  className={`text-zinc-500 dark:text-zinc-400 transition-transform ${
                    isProfileMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-48 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-700 overflow-hidden z-50"
                  >
                    {profileMenuItems.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsProfileMenuOpen(false)}
                          className={`flex items-center space-x-3 px-4 py-3 text-sm transition-colors ${
                            item.name === "Sign Out"
                              ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          }`}
                        >
                          <IconComponent size={16} />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
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
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
