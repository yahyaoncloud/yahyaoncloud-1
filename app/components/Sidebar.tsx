import {
  Home,
  FileText,
  Tags,
  Image,
  Settings,
  Users,
  MessageSquare,
  PlusCircle,
  Briefcase,
  Tag,
  QrCode,
  Share2,
  ChevronDown,
  Layout,
  Globe,
  Mail,
  ChevronRight,
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
    name: "Blog Management",
    icon: FileText,
    children: [
      { name: "All Posts", icon: FileText, href: "/admin/posts" },
      { name: "Create Post", icon: PlusCircle, href: "/admin/post/create" },
      { name: "Categories", icon: Tags, href: "/admin/categories" },
      { name: "Tags", icon: Tag, href: "/admin/tags" },
      { name: "Featured", icon: FileText, href: "/admin/featured-articles" },
      { name: "Media", icon: Image, href: "/admin/media" },
    ],
  },
  {
    name: "Site Content",
    icon: Globe,
    children: [
      { name: "Homepage Cards", icon: Layout, href: "/admin/homepage-cards" },
      { name: "About Page", icon: FileText, href: "/admin/about" },
      { name: "Linktree", icon: Share2, href: "/admin/linktree" },
      { name: "Business Card", icon: Briefcase, href: "/admin/business-card" },
      { name: "PDF Assets", icon: FileText, href: "/admin/assets" },
    ],
  },
  {
    name: "Users & Resumes",
    icon: Users,
    children: [
      { name: "Authors", icon: Users, href: "/admin/authors" },
      { name: "Resumes", icon: FileText, href: "/admin/resumes" },
      { name: "Resume QR", icon: QrCode, href: "/admin/resume/qr" },
    ],
  },
  {
    name: "Communication",
    icon: Mail,
    children: [
      { name: "Messages", icon: MessageSquare, href: "/admin/messages" },
    ],
  },
  {
    name: "Settings",
    icon: Settings,
    children: [
      { name: "My Account", icon: Users, href: "/admin/settings" },
      { name: "Site Settings", icon: Settings, href: "/admin/site-settings" },
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
          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            hasActiveChild
              ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/50"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span>{item.name}</span>
          </div>
          {isOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="ml-4 pl-2 border-l border-zinc-200 dark:border-zinc-700 mt-1 space-y-1">
                {item.children.map((child) => (
                  <NavLink
                    key={child.name}
                    to={child.href!}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-zinc-800 dark:bg-zinc-700 text-white"
                          : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100"
                      }`
                    }
                  >
                    <child.icon className="w-4 h-4 flex-shrink-0" />
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
        `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mb-1 ${
          isActive
            ? "bg-zinc-800 dark:bg-zinc-700 text-white"
            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100"
        }`
      }
    >
      <item.icon className="w-5 h-5 flex-shrink-0" />
      <span>{item.name}</span>
    </NavLink>
  );
}

function SidebarNavContent({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex flex-col h-full p-4 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center mb-6 justify-start gap-4 px-2">
        <img src={Logo} alt="YOC Logo" className="w-12 h-12 rounded-md object-cover" />
        <div>
          <h1 className="text-xl mrs-saint-delafield-regular">YahyaOnCloud</h1>
          <span className="text-xs  text-zinc-500 lacquer-regular">Admin Console</span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1">
        {navItems.map((item) => (
          <SidebarItem key={item.name} item={item} onClose={onClose} />
        ))}
      </nav>
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
        className="hidden md:flex flex-col h-screen w-64 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-r border-zinc-200 dark:border-zinc-700 fixed top-0 left-0 z-40"
      >
        <SidebarNavContent onClose={onClose} />
      </motion.aside>

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: -256 }}
        animate={{ x: isOpen ? 0 : -256 }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        className="fixed top-0 left-0 z-50 h-screen w-64 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-r border-zinc-200 dark:border-zinc-700 md:hidden"
      >
        <SidebarNavContent onClose={onClose} />
      </motion.aside>

      {/* Mobile Overlay */}
      {onClose && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}
    </>
  );
}