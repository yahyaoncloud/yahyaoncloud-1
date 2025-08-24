import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, X, User } from "lucide-react";
import { useTheme } from "../Contexts/ThemeContext";
import Logo from "../assets/yoc-logo.png";
import PalestineSVG from "../assets/palestine-svgrepo-com.svg";

interface NavLink {
  name: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" },
  { name: "Guestbook", href: "/guestbook" },
];

const MOTION_VARIANTS = {
  hover: { scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 17 } },
  tap: { scale: 0.95 },
};

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
    transition={{ delay: NAV_LINKS.indexOf(link) * 0.05 + 0.1, type: "spring", stiffness: 100, damping: 12 }}
  >
    <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} transition={MOTION_VARIANTS}>
      <Link
        to={link.href}
        className={`block px-4 py-3 mx-2 rounded-md font-medium transition-colors duration-200 ${isActive
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

const SupportButton = ({ onClick }: { onClick?: () => void }) => (
  <motion.a
    href="https://www.unrwa.org/donate"
    target="_blank"
    rel="noopener noreferrer"
    className="p-2 rounded-md dark:hover:bg-zinc-800 hover:bg-zinc-200 transition-colors duration-200"
    onClick={onClick}
    whileHover={MOTION_VARIANTS.hover}
    whileTap={MOTION_VARIANTS.tap}
  >
    <img src={PalestineSVG} alt="Palestine flag" className="w-6 h-6" />
  </motion.a>
);

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const lastScrollY = useRef(0);

  const isActive = (href: string) => {
    const currentPath = location.pathname;
    return href === "/" ? currentPath === "/" : currentPath === href || currentPath.startsWith(`${href}/`);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY <= 10 || currentScrollY < lastScrollY.current);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest(".mobile-menu-container")) setIsMenuOpen(false);
      if (!(event.target as Element).closest(".profile-dropdown")) setIsProfileOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMenuOpen]);

  return (
    <motion.header
      className="fixed top-0 z-[9999] w-full max-w-3xl border-b dark:border-zinc-700 border-zinc-300 px-4 py-3 dark:bg-zinc-950 text-zinc-900 bg-zinc-50 dark:text-zinc-100 transition-shadow"
      animate={{ y: isVisible ? 0 : -100, opacity: isVisible ? 1 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <motion.div whileHover={MOTION_VARIANTS.hover} whileTap={MOTION_VARIANTS.tap}>
          <Link to="/blog" className="flex items-center space-x-2">
            <img src={Logo} alt="yahyaoncloud logo" className="w-16 h-16 rounded-md object-cover" />
            <span className="text-xl mrs-saint-delafield-regular">Yahya On Cloud</span>
          </Link>
        </motion.div>

        <div className="flex items-center space-x-2">
          {/* Profile Dropdown */}
          <div
            className="relative profile-dropdown"
            onMouseEnter={() => setIsProfileOpen(true)}
            onMouseLeave={() => setIsProfileOpen(false)}
          >
            <motion.button
              className="p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-indigo-400 transition-colors duration-200"
              whileHover={MOTION_VARIANTS.hover}
              whileTap={MOTION_VARIANTS.tap}
            >
              <User size={20} />
            </motion.button>
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  className="absolute right-0 mt-2 w-40 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-lg py-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Link to="/admin" className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    Admin Login
                  </Link>
                  <Link to="/dashboard" className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    User Login
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hamburger */}
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-indigo-400 transition-colors duration-200"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            whileHover={MOTION_VARIANTS.hover}
            whileTap={MOTION_VARIANTS.tap}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="absolute left-0 right-0 z-50 flex justify-center mt-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="mobile-menu-container w-full max-w-3xl bg-white dark:bg-zinc-950 border dark:border-zinc-800 shadow-md flex flex-col p-4 space-y-2 rounded-md">
              {NAV_LINKS.map((link) => (
                <MobileNavLinkItem key={link.name} link={link} isActive={isActive(link.href)} onClick={() => setIsMenuOpen(false)} />
              ))}
              <div className="flex items-center space-x-2 pt-2">
                <SupportButton onClick={() => setIsMenuOpen(false)} />
                <motion.button
                  onClick={() => {
                    setIsMenuOpen(false);
                    toggleTheme();
                  }}
                  className="p-2 rounded-md dark:hover:bg-zinc-800 hover:bg-zinc-200 text-zinc-400 hover:text-indigo-400 transition-colors duration-200"
                  whileHover={MOTION_VARIANTS.hover}
                  whileTap={MOTION_VARIANTS.tap}
                >
                  {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
