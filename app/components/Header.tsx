import { Link } from "@remix-run/react";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
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

  const navLinks = [
    { name: "Blog", href: "/admin/home" },
    // { name: "Posts", href: "/admin/posts" },
    // { name: "Create", href: "/admin/create" },
    { name: "About", href: "/admin/about" },
    { name: "Contact", href: "/admin/contact" },
    { name: "Guestbook", href: "/admin/guestbook" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between ">
          {/* Logo */}
          <Link to="/admin/home" className="flex items-center space-x-2 group">
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
              } transition-all ease-in-out mrs-saint-delafield-regular font-thin  text-gray-900 dark:text-white group-hover:text-navy-600 dark:group-hover:text-blue-400 duration-400`}
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
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-navy-600 dark:hover:text-blue-400  group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </nav>

          {/* Theme Toggle & Mobile Menu */}
          {/* Support Palestine Button + Theme Toggle + Mobile Menu */}
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
                <Moon size={20} className="text-gray-600 dark:text-gray-300" />
              ) : (
                <Sun size={20} className="text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X size={20} className="text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu size={20} className="text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-gray-600 hover:text-navy-600 dark:text-gray-300 dark:hover:text-copper-400 font-medium transition-colors duration-200 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
