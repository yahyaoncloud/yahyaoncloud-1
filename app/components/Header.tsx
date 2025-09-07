import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "../Contexts/ThemeContext";
import Logo from "../assets/yoc-logo.png";
import PalestineSVG from "../assets/palestine-svgrepo-com.svg";
import dummyImage from "../assets/yahya_glass.png";

// shadcn imports
import { Button } from "../components/ui/button";

interface NavLink {
  name: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" },
  { name: "Guestbook", href: "/guestbook" },
];

const SupportButton = () => (
  <a
    href="https://www.unrwa.org/donate"
    target="_blank"
    rel="noopener noreferrer"
    className="relative px-3 py-2 rounded-lg flex gap-2 hover:opacity-80 transition-all group"
  >
    <div className="absolute inset-0 pointer-events-none">
      <img
        src={dummyImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-10"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/90 dark:to-zinc-900/90" />
    </div>
    <div className="relative z-10 flex gap-2 items-center text-sm">
      <img src={PalestineSVG} alt="Palestine flag" className="w-4 h-4" />
      Support
    </div>
  </a>
);

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();
  const lastScrollY = useRef(0);

  const isActive = (href: string) => {
    const currentPath = location.pathname;
    return href === "/"
      ? currentPath === "/"
      : currentPath === href || currentPath.startsWith(`${href}/`);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY <= 10 || currentScrollY < lastScrollY.current);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className="fixed top-0 z-[9999] w-full max-w-[760px] border-b dark:border-zinc-700 border-zinc-300 px-3 sm:px-4 lg:px-6 py-3 dark:bg-zinc-950/95 bg-zinc-50/95 backdrop-blur-md transition-transform"
      style={{ transform: isVisible ? "translateY(0)" : "translateY(-100%)" }}
    >
      <div className=" mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/blog" prefetch="render" className="flex items-center space-x-2">
          <img src={Logo} alt="logo" className="w-12 h-12 sm:w-14 sm:h-14 rounded-md" />
          <span className="text-lg sm:text-xl lg:text-2xl mrs-saint-delafield-regular">
            Yahya On Cloud
          </span>
        </Link>

        {/* Right side controls */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-indigo-500"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Menu Toggle (always visible, even on desktop) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="absolute left-0 right-0 mt-4  px-3 sm:px-4 z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="w-full  px-4 py-2 my-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col p-4 space-y-2 rounded-lg">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  prefetch="intent"
                  onClick={() => setIsMenuOpen(false)}
                  className={`relative block px-4 py-2 rounded-lg ${isActive(link.href)
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                    }`}
                >
                  {link.name}
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 md:hidden bg-indigo-600 dark:bg-indigo-400 transition-all duration-300 ${isActive(link.href) ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                  />
                </Link>
              ))}

              {/* Inline Admin/User + Support */}
              <div className="flex flex-col gap-2 pt-2 border-t dark:border-zinc-700">
                <div className="flex gap-2">
                  <div className="flex gap-2">
                    <Link to="/admin" prefetch="intent" onClick={() => setIsMenuOpen(false)}>
                      <Button
                        className="w-full border dark:bg-indigo-900 bg-indigo-400 dark:text-indigo-200  text-zinc-900 border-zinc-300 dark:border-zinc-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        Admin Login
                      </Button>
                    </Link>
                    <Link to="/dashboard" prefetch="intent" onClick={() => setIsMenuOpen(false)}>
                      <Button
                        className="w-full border dark:bg-indigo-900 bg-indigo-400 dark:text-indigo-200  text-zinc-900 border-zinc-300 dark:border-zinc-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        User Login
                      </Button>
                    </Link>
                  </div>

                </div>
                <SupportButton />
              </div>

              {/* Footer */}
              <p className="text-xs text-center text-zinc-500 pt-2">
                Developed by{" "}
                <a
                  href="https://github.com/yahyadev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-indigo-500"
                >
                  Yahya
                </a>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
