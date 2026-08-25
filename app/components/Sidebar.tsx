import {
  Home,
  FileText,
  Tags,
  Image,
  Settings,
  User,
  MessageSquare,
  PlusCircle,
  Briefcase,
  Tag,
  Share2,
  ChevronDown,
  Layout,
  LayoutGrid,
  Globe,
  Mail,
  Sparkles,
  ChevronRight,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { NavLink, useLocation } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Logo from "../assets/yoc-logo.png";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface NavItem {
  name: string;
  icon: LucideIcon;
  href?: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: Home },
  {
    name: "Engineering & Blog",
    icon: Globe,
    children: [
      { name: "Blog Articles", icon: FileText, href: "/admin/posts" },
      { name: "Create Article", icon: PlusCircle, href: "/admin/post/create" },
      { name: "Projects", icon: Briefcase, href: "/admin/projects" },
      { name: "Research Papers", icon: BookOpen, href: "/admin/research" },
      { name: "Featured Spotlight", icon: Sparkles, href: "/admin/featured-articles" },
      { name: "Categories", icon: Tag, href: "/admin/categories" },
      { name: "Tags", icon: Tags, href: "/admin/tags" },
    ],
  },
  {
    name: "Site Content",
    icon: Layout,
    children: [
      { name: "About & Bio", icon: User, href: "/admin/about" },
      { name: "Homepage Sections", icon: LayoutGrid, href: "/admin/about?tab=sections" },
      { name: "Homepage Cards", icon: Layout, href: "/admin/homepage-cards" },
      { name: "Linktree", icon: Share2, href: "/admin/linktree" },
      { name: "Media Assets", icon: Image, href: "/admin/media" },
    ],
  },
  {
    name: "Communication",
    icon: Mail,
    children: [
      { name: "Contact Messages", icon: MessageSquare, href: "/admin/messages" },
      { name: "Guestbook Moderation", icon: BookOpen, href: "/admin/guestbook" },
    ],
  },
  {
    name: "Settings",
    icon: Settings,
    children: [
      { name: "My Account", icon: User, href: "/admin/settings" },
      { name: "Site & SEO Settings", icon: Settings, href: "/admin/site-settings" },
      { name: "Blog Config", icon: Settings, href: "/admin/blog-settings" },
    ],
  },
];

function SidebarItem({ item, onClose }: { item: NavItem; onClose?: () => void }) {
  const location = useLocation();
  
  // Check if any child is active
  const hasActiveChild = item.children?.some(
    (child) => child.href && location.pathname.startsWith(child.href)
  );

  // Initialize state based on active child status
  const [isOpen, setIsOpen] = useState(() => hasActiveChild || false);

  useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true);
    }
  }, [hasActiveChild]);

  if (item.children) {
    return (
      <div className="mb-1">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            hasActiveChild
              ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/60"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <item.icon className="w-4 h-4 flex-shrink-0 text-zinc-500 dark:text-zinc-400" />
            <span>{item.name}</span>
          </div>
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          )}
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="ml-3 pl-3 border-l border-zinc-200 dark:border-zinc-800 mt-1 space-y-0.5">
                {item.children.map((child) => (
                  <NavLink
                    key={child.name}
                    to={child.href!}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                          : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100"
                      }`
                    }
                  >
                    <child.icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{child.name}</span>
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <NavLink
      to={item.href!}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1 ${
          isActive
            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 hover:text-zinc-900 dark:hover:text-zinc-100"
        }`
      }
    >
      <item.icon className="w-4 h-4 flex-shrink-0" />
      <span>{item.name}</span>
    </NavLink>
  );
}

function SidebarNavContent({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex flex-col h-full p-4 overflow-y-auto">
      {/* Brand Header */}
      <div className="flex items-center mb-6 justify-start gap-3 px-2">
        <img src={Logo} alt="YOC Logo" className="w-10 h-10 rounded-lg object-cover shadow-xs" />
        <div>
          <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">YahyaOnCloud</h1>
          <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold">Admin Console</span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <SidebarItem key={item.name} item={item} onClose={onClose} />
        ))}
      </nav>

      {/* Footer / Quick View */}
      <div className="pt-4 mt-auto border-t border-zinc-200 dark:border-zinc-800">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 rounded-lg transition-colors"
        >
          <span>View Public Website</span>
          <span className="text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">↗</span>
        </a>
      </div>
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const isLogoutPage = location.pathname === "/admin/logout";
  
  if (isLogoutPage) {
    return null;
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -256 }}
        animate={{ x: isOpen ? 0 : -256 }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        className="hidden md:flex flex-col h-screen w-64 bg-zinc-50 dark:bg-zinc-900/90 backdrop-blur-md text-zinc-900 dark:text-zinc-100 border-r border-zinc-200 dark:border-zinc-800 fixed top-0 left-0 z-40"
      >
        <SidebarNavContent />
      </motion.aside>

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: -256 }}
        animate={{ x: isOpen ? 0 : -256 }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        className="fixed top-0 left-0 z-50 h-screen w-64 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-r border-zinc-200 dark:border-zinc-800 md:hidden shadow-xl"
      >
        <SidebarNavContent onClose={onClose} />
      </motion.aside>

      {/* Mobile Overlay */}
      {onClose && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden"
          onClick={onClose}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}
    </>
  );
}