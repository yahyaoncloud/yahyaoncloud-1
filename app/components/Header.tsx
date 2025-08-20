import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "../Contexts/ThemeContext";
import Logo from "../assets/yoc-logo.png";
import PalestineSVG from "../assets/palestine-svgrepo-com.svg";

// Types
interface NavLink {
  name: string;
  href: string;
}

interface ActiveIndicator {
  width: number;
  left: number;
}

// Constants
const NAV_LINKS: NavLink[] = [
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" },
  { name: "Guestbook", href: "/guestbook" },
];

const MOTION_VARIANTS = {
  hover: {
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 17 },
  },
  tap: { scale: 0.95 },
};

// Utility Components
const NavLinkItem = ({
  link,
  isActive,
  onClick,
}: {
  link: NavLink;
  isActive: boolean;
  onClick?: () => void;
}) => (
  <motion.div>
    <Link
      to={link.href}
      data-path={link.href}
      className={`px-3 py-2 rounded-md font-medium transition-colors duration-200 ${
        isActive
          ? "text-indigo-600 dark:text-indigo-400"
          : "text-zinc-700 dark:text-zinc-300 hover:text-indigo-500 dark:hover:text-indigo-300"
      }`}
      onClick={onClick}
    >
      {link.name}
    </Link>
  </motion.div>
);

// MobileNavLinkItem
const MobileNavLinkItem = ({
  link,
  isActive,
  onClick,
}: {
  link: NavLink;
  isActive: boolean;
  onClick: () => void;
}) => (
  <motion.div
    initial={{ x: 50, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{
      delay: NAV_LINKS.indexOf(link) * 0.05 + 0.1,
      type: "spring",
      stiffness: 100,
      damping: 12,
    }}
  >
    <motion.div
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      transition={MOTION_VARIANTS}
    >
      <Link
        to={link.href}
        className={`block px-4 py-3 mx-2 rounded-md font-medium transition-colors duration-200 ${
          isActive
            ? "text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-zinc-800"
            : "text-zinc-700 dark:text-zinc-300 hover:text-indigo-500 dark:hover:text-indigo-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
        }`}
        onClick={onClick}
      >
        {link.name}
      </Link>
    </motion.div>
  </motion.div>
);
const SupportButton = ({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) => (
  <motion.a
    href="https://www.unrwa.org/donate"
    target="_blank"
    rel="noopener noreferrer"
    className={`p-2 rounded-md dark:hover:bg-zinc-800 hover:bg-zinc-200 transition-colors duration-200 ${className}`}
    onClick={onClick}
    whileHover={MOTION_VARIANTS.hover}
    whileTap={MOTION_VARIANTS.tap}
  >
    <img src={PalestineSVG} alt="Palestine flag" className="w-6 h-6" />
  </motion.a>
);

// Main Component
export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [activeIndicator, setActiveIndicator] = useState<ActiveIndicator>({
    width: 0,
    left: 0,
  });
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  // Scroll handling

  // Active indicator handling
  useEffect(() => {
    const updateIndicator = () => {
      if (!navRef.current) return;

      const activeLink = NAV_LINKS.find((link) => isActive(link.href));
      if (!activeLink) {
        setActiveIndicator({ width: 0, left: 0 });
        return;
      }

      const activeLinkElement = navRef.current.querySelector(
        `[data-path="${activeLink.href}"]`
      ) as HTMLElement;
      if (activeLinkElement) {
        const navRect = navRef.current.getBoundingClientRect();
        const linkRect = activeLinkElement.getBoundingClientRect();
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

  useEffect(() => {
    if (typeof window === "undefined") return;

    let timeout: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show header near top
      if (currentScrollY <= 10) {
        setIsVisible(true);
      } else {
        // Show header when scrolling up, hide when scrolling down
        setIsVisible(currentScrollY < lastScrollY.current);
      }

      lastScrollY.current = currentScrollY;

      // Optional: small debounce to improve performance
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {}, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  // Mobile menu click outside handling
  useEffect(() => {
    if (!isMenuOpen) {
      document.body.style.overflow = "unset";
      return;
    }

    document.body.style.overflow = "hidden";
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest(".mobile-menu-container")) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const isActive = (href: string) => {
    const currentPath = location.pathname;
    return href === "/"
      ? currentPath === "/"
      : currentPath === href || currentPath.startsWith(`${href}/`);
  };

  return (
    <motion.header
      className={`fixed top-0 z-50 w-full max-w-3xl mx-auto border-b dark:border-zinc-700 border-zinc-300 px-4 py-3 dark:bg-zinc-950 text-zinc-900 bg-zinc-50 dark:text-zinc-100 transition-shadow`}
      animate={{
        y: isVisible ? 0 : -100,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-between">
        {/* Logo */}
        <motion.div
          whileHover={MOTION_VARIANTS.hover}
          whileTap={MOTION_VARIANTS.tap}
        >
          <Link to="/blog" className="flex items-center space-x-2">
            <img
              src={Logo}
              alt="yahyaoncloud logo"
              className={`rounded-md object-cover group-hover:scale-105 transition-all duration-200 ${"w-16 h-16"}`}
            />
            <span className="text-lg font-semibold ">Yahya On Cloud</span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center">
          <div ref={navRef} className="relative flex items-center space-x-1">
            <motion.div
              className="absolute bottom-0 h-0.5 bg-indigo-500 "
              animate={{
                width: activeIndicator.width,
                x: activeIndicator.left,
              }}
              initial={{ width: 0, left: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            {NAV_LINKS.map((link) => (
              <NavLinkItem
                key={link.name}
                link={link}
                isActive={isActive(link.href)}
              />
            ))}
          </div>
        </nav>

        {/* Theme Toggle & Mobile Menu */}
        <div className="flex items-center space-x-2">
          <SupportButton />
          <motion.button
            onClick={toggleTheme}
            className="p-2 rounded-md dark:hover:bg-zinc-800 hover:bg-zinc-200 text-zinc-400 hover:text-indigo-400 transition-colors duration-200"
            aria-label={`Switch to ${
              theme === "light" ? "dark" : "light"
            } theme`}
            whileHover={MOTION_VARIANTS.hover}
            whileTap={MOTION_VARIANTS.tap}
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </motion.button>
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md dark:hover:bg-zinc-800 hover:bg-zinc-200 text-zinc-400 hover:text-indigo-400 transition-colors duration-200"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            whileHover={MOTION_VARIANTS.hover}
            whileTap={MOTION_VARIANTS.tap}
          >
            {isMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="absolute inset-0 w-full dark:bg-zinc-950/80 bg-white/80 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              className="mobile-menu-container absolute top-0 right-0 w-64 max-w-[80vw] h-full dark:bg-zinc-950 bg-white shadow-lg border-l border-zinc-300 dark:border-zinc-800"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex flex-col h-full">
                <motion.div
                  className="flex items-center justify-between p-4 border-b dark:border-zinc-800 border-zinc-300"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  <Link to="/blog" className="flex items-center space-x-2">
                    <img
                      src={Logo}
                      alt="Yahya On Cloud logo"
                      className="w-10 h-10 rounded-md object-cover"
                    />
                    <span className="text-lg font-semibold text-zinc-700">
                      Yahya On Cloud
                    </span>
                  </Link>
                  <motion.button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-indigo-400 transition-colors duration-200"
                    aria-label="Close menu"
                    whileHover={MOTION_VARIANTS.hover}
                    whileTap={MOTION_VARIANTS.tap}
                  >
                    <X size={16} />
                  </motion.button>
                </motion.div>
                <nav className="flex-1 px-4 py-6">
                  <div className="relative flex flex-col space-y-2">
                    {NAV_LINKS.map((link) => (
                      <MobileNavLinkItem
                        key={link.name}
                        link={link}
                        isActive={isActive(link.href)}
                        onClick={() => setIsMenuOpen(false)}
                      />
                    ))}
                  </div>
                </nav>
                <motion.div
                  className="p-4 border-t dark:border-zinc-800 border-zinc-300"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <SupportButton onClick={() => setIsMenuOpen(false)} />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
