import { Link, useLocation } from "@remix-run/react";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../Contexts/ThemeContext";
import Logo from "../assets/yoc-logo.png";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

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

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest(".mobile-menu-container")) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const navLinks = [
    { name: "Blog", href: "/admin/home" },
    // { name: "Posts", href: "/admin/posts" },
    // { name: "Create", href: "/admin/create" },
    { name: "About", href: "/admin/about" },
    { name: "Contact", href: "/admin/contact" },
    { name: "Guestbook", href: "/admin/guestbook" },
  ];

  const isActive = (href) => {
    return location.pathname === href;
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm dark:shadow-gray-900/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link
                to="/admin/home"
                className="flex items-center space-x-3 group"
              >
                <motion.img
                  src={Logo}
                  alt="yahyaoncloud logo"
                  className={`rounded-2xl object-cover transition-all duration-500 ${
                    scrolled ? "w-14 h-14" : "w-20 h-20"
                  }`}
                  whileHover={{ rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
                <span
                  className={`${
                    scrolled ? "md:text-xl text-lg" : "md:text-2xl text-xl"
                  } transition-all ease-in-out mrs-saint-delafield-regular font-thin bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-300 dark:to-white bg-clip-text text-transparent group-hover:from-navy-600 group-hover:via-blue-500 group-hover:to-navy-600 dark:group-hover:from-blue-300 dark:group-hover:via-blue-100 dark:group-hover:to-blue-300 duration-500`}
                >
                  Yahya On Cloud
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              {navLinks.map((link) => (
                <motion.div
                  key={link.name}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link
                    to={link.href}
                    className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 group ${
                      isActive(link.href)
                        ? "bg-gradient-to-r from-navy-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 dark:from-blue-500 dark:to-blue-400"
                        : "text-gray-600 hover:text-navy-600 dark:text-gray-300 dark:hover:text-blue-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    {link.name}

                    {/* Active indicator */}
                    {isActive(link.href) && (
                      <motion.div
                        className="absolute -bottom-1 left-1/2 w-2 h-2 bg-white dark:bg-blue-100 rounded-full shadow-sm"
                        layoutId="activeIndicator"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                        style={{ x: "-50%" }}
                      />
                    )}

                    {/* Hover effect for non-active links */}
                    {!isActive(link.href) && (
                      <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-navy-500/10 to-blue-600/10 dark:from-blue-500/10 dark:to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    )}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Theme Toggle & Mobile Menu */}
            <div className="flex items-center space-x-3">
              {/* Support Palestine Button */}
              <motion.a
                href="https://www.unrwa.org/donate"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-block px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <span className="flex items-center space-x-1">
                  <span>Support</span>
                  <span>🇵🇸</span>
                </span>
              </motion.a>

              {/* Theme Toggle Button */}
              <motion.button
                onClick={toggleTheme}
                className="p-3 rounded-xl bg-gray-100/80 hover:bg-gray-200/80 dark:bg-gray-800/80 dark:hover:bg-gray-700/80 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md"
                aria-label="Toggle theme"
                whileHover={{ scale: 1.05, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: theme === "dark" ? 360 : 0 }}
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

              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-3 rounded-xl bg-gray-100/80 hover:bg-gray-200/80 dark:bg-gray-800/80 dark:hover:bg-gray-700/80 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md relative z-[60]"
                aria-label="Toggle menu"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <motion.div
                  animate={{ rotate: isMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {isMenuOpen ? (
                    <X size={18} className="text-gray-600 dark:text-gray-300" />
                  ) : (
                    <Menu
                      size={18}
                      className="text-gray-600 dark:text-gray-300"
                    />
                  )}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay with Framer Motion */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[55] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-gray-950/60 backdrop-blur-md"
              onClick={() => setIsMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            {/* Mobile Menu */}
            <motion.div
              className="mobile-menu-container absolute top-0 right-0 w-80 max-w-[90vw] h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl border-l border-gray-200/50 dark:border-gray-700/50"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                opacity: { duration: 0.2 },
              }}
            >
              <div className="flex flex-col h-full">
                {/* Menu Header */}
                <motion.div
                  className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-transparent to-gray-50/50 dark:to-gray-800/50"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 dark:from-white dark:to-blue-300 bg-clip-text text-transparent">
                    Navigation
                  </span>
                  <motion.button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-xl bg-gray-100/80 hover:bg-gray-200/80 dark:bg-gray-800/80 dark:hover:bg-gray-700/80 transition-colors duration-200"
                    aria-label="Close menu"
                    whileHover={{ scale: 1.05, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <X size={18} className="text-gray-600 dark:text-gray-300" />
                  </motion.button>
                </motion.div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-6">
                  <div className="flex flex-col space-y-2">
                    {navLinks.map((link, index) => (
                      <motion.div
                        key={link.name}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                          delay: 0.1 + index * 0.1,
                          duration: 0.4,
                          type: "spring",
                          stiffness: 100,
                          damping: 12,
                        }}
                      >
                        <motion.div
                          whileHover={{ x: 8, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 17,
                          }}
                        >
                          <Link
                            to={link.href}
                            className={`block px-4 py-4 mx-2 rounded-2xl font-semibold transition-all duration-300 ${
                              isActive(link.href)
                                ? "bg-gradient-to-r from-navy-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                                : "text-gray-700 hover:text-navy-600 dark:text-gray-200 dark:hover:text-blue-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/50"
                            }`}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-lg">{link.name}</span>
                              {isActive(link.href) && (
                                <motion.div
                                  className="w-2 h-2 bg-white dark:bg-blue-100 rounded-full"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30,
                                  }}
                                />
                              )}
                            </div>
                          </Link>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </nav>

                {/* Mobile Support Palestine Button */}
                <motion.div
                  className="p-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-transparent to-gray-50/50 dark:to-gray-800/50"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <motion.a
                    href="https://www.unrwa.org/donate"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-6 py-4 text-sm font-bold rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>Support Palestine</span>
                      <span>🇵🇸</span>
                    </span>
                  </motion.a>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
