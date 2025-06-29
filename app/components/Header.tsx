import { Link } from "@remix-run/react";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../Contexts/ThemeContext";
import Logo from "../assets/yoc-logo.png";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              to="/admin/home"
              className="flex items-center space-x-2 group"
            >
              <img
                src={Logo}
                alt="yahyaoncloud logo"
                className={`rounded-xl object-cover group-hover:scale-105 transition-all duration-400 ${
                  scrolled ? "w-16 h-16" : "w-24 h-24"
                }`}
              />
              <span
                className={`${
                  scrolled ? "md:text-xl text-lg" : "md:text-3xl text-xl"
                } transition-all ease-in-out mrs-saint-delafield-regular font-thin text-gray-900 dark:text-white group-hover:text-navy-600 dark:group-hover:text-blue-400 duration-400`}
              >
                Yahya On Cloud
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-gray-600 hover:text-navy-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium transition-colors duration-200 relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-navy-600 dark:bg-blue-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              ))}
            </nav>

            {/* Theme Toggle & Mobile Menu */}
            <div className="flex items-center space-x-3">
              {/* Support Palestine Button */}
              <a
                href="https://www.unrwa.org/donate"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-block px-3 py-1.5 text-sm font-medium rounded-lg border border-green-500 text-green-600 hover:bg-green-100 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-900/20 transition-all"
              >
                Support 🇵🇸
              </a>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <Moon
                    size={20}
                    className="text-gray-600 dark:text-gray-300"
                  />
                ) : (
                  <Sun size={20} className="text-gray-600 dark:text-gray-300" />
                )}
              </button>

              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200 relative z-[60]"
                aria-label="Toggle menu"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <motion.div
                  animate={{ rotate: isMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMenuOpen ? (
                    <X size={20} className="text-gray-600 dark:text-gray-300" />
                  ) : (
                    <Menu
                      size={20}
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
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            {/* Mobile Menu */}
            <motion.div
              className="mobile-menu-container absolute top-0 right-0 w-80 max-w-[90vw] h-full bg-white dark:bg-slate-900 shadow-2xl"
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
                  className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Menu
                  </span>
                  <motion.button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200"
                    aria-label="Close menu"
                    whileHover={{ scale: 1.05, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <X size={20} className="text-gray-600 dark:text-gray-300" />
                  </motion.button>
                </motion.div>

                {/* Navigation Links */}
                <nav className="flex-1 px-6 py-8">
                  <div className="flex flex-col space-y-6">
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
                            className="block text-lg font-medium text-gray-700 hover:text-navy-600 dark:text-gray-200 dark:hover:text-blue-400 transition-colors duration-200 py-3 border-b border-gray-100 dark:border-gray-800 hover:border-navy-600 dark:hover:border-blue-400"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {link.name}
                          </Link>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </nav>

                {/* Mobile Support Palestine Button */}
                <motion.div
                  className="p-6 border-t border-gray-200 dark:border-gray-700"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <motion.a
                    href="https://www.unrwa.org/donate"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-4 py-3 text-sm font-medium rounded-lg border border-green-500 text-green-600 hover:bg-green-100 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-900/20 transition-all"
                    onClick={() => setIsMenuOpen(false)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    Support 🇵🇸
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
