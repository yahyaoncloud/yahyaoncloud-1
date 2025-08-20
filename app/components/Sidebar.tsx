// Sidebar.tsx
import {
  Home,
  FileText,
  Tags,
  Image,
  Settings,
  Users,
  MessageSquare,
  BarChart3,
  BookOpen,
  Folder,
  Eye,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { NavLink } from "@remix-run/react";
import { useTheme } from "../Contexts/ThemeContext";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import Logo from "../assets/yoc-logo.png";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  visible?: boolean;
  onToggleVisible?: () => void;
}

const navItems = [
  {
    name: "Dashboard",
    icon: Home,
    href: "/admin/blog",
    description: "Overview & Analytics",
  },
  {
    name: "Posts",
    icon: FileText,
    href: "/admin/posts",
    description: "Manage blog posts",
  },
  {
    name: "Create Post",
    icon: PlusCircle,
    href: "/admin/blog/create",
    description: "Write new content",
  },
  {
    name: "Categories",
    icon: Folder,
    href: "/admin/categories",
    description: "Organize content",
  },
  {
    name: "Tags",
    icon: Tags,
    href: "/admin/tags",
    description: "Content labels",
  },
  {
    name: "Media",
    icon: Image,
    href: "/admin/media",
    description: "Images & files",
  },
  {
    name: "Comments",
    icon: MessageSquare,
    href: "/admin/comments",
    description: "User feedback",
  },
  {
    name: "Pages",
    icon: BookOpen,
    href: "/admin/pages",
    description: "Static pages",
  },
  {
    name: "Users",
    icon: Users,
    href: "/admin/users",
    description: "User management",
  },
  {
    name: "Analytics",
    icon: BarChart3,
    href: "/admin/analytics",
    description: "Site statistics",
  },
  {
    name: "Settings",
    icon: Settings,
    href: "/admin/settings",
    description: "Site configuration",
  },
];

export default function Sidebar({
  isOpen = true,
  onClose,
  visible = true,
  onToggleVisible,
}: SidebarProps) {
  const { theme } = useTheme();

  return (
    <>
      {/* Toggle Button - Shows when sidebar is hidden */}
      <AnimatePresence>
        {!visible && (
          <motion.button
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 20,
              duration: 0.3,
            }}
            onClick={onToggleVisible}
            className="fixed top-6 left-4 z-[60] flex items-center justify-center w-12 h-12 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-md shadow-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
            style={{
              display: "flex !important",
            }}
            title="Show Sidebar"
          >
            <ChevronRight size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -256 }}
        animate={{
          x: visible ? 0 : -256,
          width: 256,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        className="hidden md:flex flex-col h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white border-r border-zinc-200 dark:border-zinc-700 fixed top-0 left-0 z-40"
      >
        <div className="p-3 h-full flex flex-col overflow-hidden">
          {/* Hide Button */}
          <button
            onClick={onToggleVisible}
            className="absolute top-4 right-4 z-10 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors"
            title="Hide Sidebar"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Logo */}
          <motion.div
            className="mb-6 flex items-center space-x-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <motion.img
              src={Logo}
              alt="YOC Logo"
              className="w-10 h-10 rounded-md object-cover   flex-shrink-0"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            />
            <div className="overflow-hidden">
              <h2 className="mrs-saint-delafield-regular text-2xl bg-gradient-to-r from-zinc-900 via-indigo-800 to-zinc-900 dark:from-white dark:via-indigo-300 dark:to-white bg-clip-text text-transparent">
                YahyaOnCloud
              </h2>
              <p className="text-xs pt-2 text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wide">
                Content Management
              </p>
            </div>
          </motion.div>

          {/* Nav Links */}
          <nav className="space-y-1 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-all relative overflow-hidden ${
                      isActive
                        ? "bg-gradient-to-r from-navy-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 dark:from-indigo-500 dark:to-indigo-400"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 hover:text-navy-600 dark:hover:text-indigo-400"
                    }`
                  }
                >
                  <motion.div
                    className="flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <item.icon className="w-5 h-5" />
                  </motion.div>

                  <div className="flex-1 overflow-hidden">
                    <span className="block">{item.name}</span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 group-hover:text-navy-500 dark:group-hover:text-indigo-400 transition-colors duration-300">
                      {item.description}
                    </span>
                  </div>
                </NavLink>
              </motion.div>
            ))}
          </nav>

          {/* Footer */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <div className="flex items-center space-x-2 text-xs text-zinc-500 dark:text-zinc-400">
              <Eye size={12} />
              <span>Blog CMS v2.0</span>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              Manage your content with ease
            </p>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        className="fixed top-0 left-0 z-50 h-screen w-64 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white border-r border-zinc-200 dark:border-zinc-700 md:hidden"
      >
        <div className="p-3 h-full flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-6">
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <motion.img
                src={Logo}
                alt="YOC Logo"
                className="w-10 h-10 rounded-md object-cover shadow-lg shadow-indigo-500/25"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              />
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-zinc-900 via-indigo-800 to-zinc-900 dark:from-white dark:via-indigo-300 dark:to-white bg-clip-text text-transparent">
                  YOC
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wide">
                  Content Management
                </p>
              </div>
            </motion.div>

            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <NavLink
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-all relative overflow-hidden ${
                      isActive
                        ? "bg-gradient-to-r from-navy-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 dark:from-indigo-500 dark:to-indigo-400"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 hover:text-navy-600 dark:hover:text-indigo-400"
                    }`
                  }
                >
                  <motion.div
                    className="relative z-10"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <item.icon className="w-5 h-5" />
                  </motion.div>

                  <div className="flex-1 relative z-10">
                    <span className="block">{item.name}</span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 group-hover:text-navy-500 dark:group-hover:text-indigo-400 transition-colors duration-300">
                      {item.description}
                    </span>
                  </div>
                </NavLink>
              </motion.div>
            ))}
          </nav>

          {/* Footer */}
          <motion.div
            className="pt-4 border-t border-zinc-200 dark:border-zinc-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="flex items-center space-x-2 text-xs text-zinc-500 dark:text-zinc-400">
              <Eye size={12} />
              <span>Blog CMS v2.0</span>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              Manage your content with ease
            </p>
          </motion.div>
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      {onClose && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onClose();
          }}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}
    </>
  );
}
