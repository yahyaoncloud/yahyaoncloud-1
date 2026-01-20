import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
  const location = useLocation();
  const lastScrollY = useRef(0);

  const isActive = (href: string) => {
    const currentPath = location.pathname;
    return href === "/"
      ? currentPath === "/"
      : currentPath === href || currentPath.startsWith(`${href}/`);
  };

  useEffect(() => {
    setMounted(true);
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
   
      className="fixed top-0 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-[760px] border-b dark:border-zinc-700 backdrop-blur-md border-zinc-200 px-3 sm:px-4 lg:px-6 py-3 dark:bg-zinc-950/70 bg-white/70 transition-transform"
      style={{ transform: isVisible ? "translate(-50%, 0)" : "translate(-50%, -100%)" }}
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
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors relative z-50"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
             {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Dropdown Menu Portal */}
          {/* We render the portal only on the client (mounted) */}
          {/* AnimatePresence must be INSIDE the portal to handle animations correctly */}
          {mounted && createPortal(
            <AnimatePresence>
              {isMenuOpen && (
                <div className="fixed inset-0 z-[99999]">
                   {/* Backdrop */}
                  <motion.div 
                      key="backdrop"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsMenuOpen(false)}
                      className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md"
                  />
                  
                  {/* Menu Container */}
                  <motion.div
                    key="menu"
                    className="absolute top-20 right-4 sm:right-[max(1rem,calc(50vw-380px+1rem))] w-72 z-50 origin-top-right"
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl overflow-hidden ring-1 ring-black/5">
                      <div className="p-2 space-y-1">
                        {NAV_LINKS.map((link) => (
                          <Link
                            key={link.name}
                            to={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={`relative group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                              isActive(link.href)
                                ? "text-indigo-600 dark:text-indigo-400 font-medium bg-zinc-50/50 dark:bg-zinc-800/30"
                                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                            }`}
                          >
                            <span className="relative text-sm">
                              {link.name}
                               <span className={`absolute bottom-0 left-0 h-px bg-current transition-all duration-200 ${isActive(link.href) ? "w-full" : "w-0 group-hover:w-full"}`} />
                            </span>
                          </Link>
                        ))}
                      </div>

                      <div className="h-px bg-zinc-200 dark:bg-zinc-800 mx-4 my-1" />

                      <div className="p-2 grid grid-cols-2 gap-2">
                          <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="col-span-1">
                              <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full justify-start text-xs h-9 border-dashed border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
                              >
                                  Admin
                              </Button>
                          </Link>
                          <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="col-span-1">
                               <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full justify-start text-xs h-9 border-dashed border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
                              >
                                  User
                              </Button>
                          </Link>
                          <div className="col-span-2 mt-1">
                               <SupportButton />
                          </div>
                      </div>

                      <div className="bg-zinc-50/50 dark:bg-zinc-900/50 p-3 text-center border-t border-zinc-100 dark:border-zinc-800">
                          <p className="text-[10px] text-zinc-400 font-medium">
                              Designed by Yahya
                          </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>,
            document.body
          )}
        </div>
      </div>
    </header>
  );
}
