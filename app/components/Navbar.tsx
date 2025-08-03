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

  // Navigation items
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

      setScrolled((prev) => {
        if (prev !== shouldBeScrolled) {
          // Only auto-scroll to top if scrolling up and crossing threshold
          if (prev && !shouldBeScrolled && currentScrollY < lastScrollY) {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
          return shouldBeScrolled;
        }
        return prev;
      });

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update active indicator position
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
      } else {
        // Find the closest matching path
        const currentPath = location.pathname;
        const matchingItem = navItems.find(
          (item) =>
            currentPath.startsWith(item.href) ||
            (item.href === "/admin" && currentPath === "/admin")
        );

        if (matchingItem) {
          const matchingLink = navRef.current.querySelector(
            `[data-path="${matchingItem.href}"]`
          ) as HTMLElement;
          if (matchingLink) {
            const navRect = navRef.current.getBoundingClientRect();
            const linkRect = matchingLink.getBoundingClientRect();

            setActiveIndicator({
              width: linkRect.width,
              left: linkRect.left - navRect.left,
            });
          }
        }
      }
    };

    // Update on mount and route change
    updateIndicator();

    // Update on window resize
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [location.pathname, navItems]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isProfileMenuOpen &&
        !(event.target as Element).closest(".profile-menu-container")
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const isActiveLink = (href: string) => {
    if (href === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(href);
  };

  const profileMenuItems = [
    { name: "Profile", href: "/admin/profile", icon: User },
    { name: "Settings", href: "/admin/settings", icon: Settings },
    { name: "Sign Out", href: "/admin/logout", icon: LogOut },
  ];

  return (
    <header className="w-auto sticky top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-b-gray-200 dark:border-b-gray-700 text-gray-900 dark:text-white z-10 shadow-sm transition-all duration-300">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2 min-h-[4rem] w-full">
          {/* Left side - Hamburger Menu (Mobile only) */}
          <div className="flex items-center md:hidden">
            <motion.button
              onClick={onToggleSidebar}
              className="p-3 rounded-xl bg-gray-100/80 hover:bg-gray-200/80 dark:bg-gray-800/80 dark:hover:bg-gray-700/80 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md"
              aria-label="Toggle sidebar"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Menu size={18} className="text-gray-600 dark:text-gray-300" />
            </motion.button>
          </div>

          {/* Center Navigation - Hidden on mobile, visible on larger screens */}
          <nav className="hidden lg:flex items-center justify-center flex-1 mx-8">
            <div
              ref={navRef}
              className="relative flex items-center space-x-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl p-1 backdrop-blur-sm"
            >
              {/* Sliding background indicator */}
              <motion.div
                className="absolute top-1 bottom-1 bg-white dark:bg-gray-700 rounded-xl shadow-md"
                animate={{
                  width: activeIndicator.width,
                  x: activeIndicator.left,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
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
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 17,
                      }}
                    >
                      <IconComponent
                        size={16}
                        className={`transition-colors duration-300 ${
                          isActive
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200"
                        }`}
                      />
                    </motion.div>
                    <span
                      className={`transition-colors duration-300 ${
                        isActive
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                      }`}
                    >
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Right side controls */}
          <div className="flex items-center space-x-3 ml-auto">
            {/* New Post Button */}
            <Link
              to="/admin/post/create"
              className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r dark:from-blue-400 dark:to-blue-500 from-blue-500 to-blue-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:from-orange-600 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
            >
              <span className="text-sm">New Post</span>
            </Link>

            {/* Theme Toggle Button */}
            <motion.button
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-gray-100/80 hover:bg-gray-200/80 dark:bg-gray-800/80 dark:hover:bg-gray-700/80 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md"
              aria-label="Toggle theme"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <motion.div
                initial={false}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {theme === "light" ? (
                  <Moon
                    size={18}
                    className="text-gray-600 dark:text-gray-300"
                  />
                ) : (
                  <Sun size={18} className="text-yellow-500" />
                )}
              </motion.div>
            </motion.button>

            {/* Profile Menu */}
            <div className="relative profile-menu-container">
              <motion.button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-3 p-2 rounded-xl bg-gray-100/80 hover:bg-gray-200/80 dark:bg-gray-800/80 dark:hover:bg-gray-700/80 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {/* Profile Image */}
                <motion.div
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-navy-500 to-blue-600 dark:from-blue-500 dark:to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/25"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <User size={16} className="text-white" />
                </motion.div>

                {/* Profile Info (hidden on mobile) */}
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    John Doe
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Admin
                  </span>
                </div>

                {/* Dropdown Arrow */}
                <motion.div
                  animate={{ rotate: isProfileMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <ChevronDown
                    size={16}
                    className="text-gray-500 dark:text-gray-400"
                  />
                </motion.div>
              </motion.button>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-gray-800/50 border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-navy-500 to-blue-600 dark:from-blue-500 dark:to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
                          <User size={18} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            John Doe
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            john@example.com
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      {profileMenuItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                          <motion.div
                            key={item.name}
                            whileHover={{ x: 4 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 17,
                            }}
                          >
                            <Link
                              to={item.href}
                              className={`flex items-center space-x-3 px-4 py-3 text-sm transition-all duration-300 ${
                                item.name === "Sign Out"
                                  ? "text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                  : "text-gray-700 hover:text-navy-600 dark:text-gray-300 dark:hover:text-blue-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/50"
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

      {/* Mobile Navigation - Sliding tabs for mobile */}
      <div className="lg:hidden border-t border-gray-200 dark:border-gray-700">
        <nav className="flex overflow-x-auto scrollbar-hide">
          <div className="flex space-x-1 p-2 min-w-full">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = isActiveLink(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
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
