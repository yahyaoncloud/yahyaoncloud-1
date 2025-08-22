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
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../Contexts/ThemeContext";
import Logo from "../assets/yoc-logo.png";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  visible?: boolean;
  onToggleVisible?: () => void;
}

const navSections = [
  {
    title: "Blog Management",
    items: [
      { name: "Dashboard", icon: Home, href: "/admin/blog", description: "Overview & Analytics" },
      { name: "Posts", icon: FileText, href: "/admin/posts", description: "Manage blog posts" },
      { name: "Create Post", icon: PlusCircle, href: "/admin/blog/create", description: "Write new content" },
      { name: "Categories", icon: Folder, href: "/admin/categories", description: "Organize content" },
      { name: "Tags", icon: Tags, href: "/admin/tags", description: "Content labels" },
      { name: "Media", icon: Image, href: "/admin/media", description: "Images & files" },
      { name: "Comments", icon: MessageSquare, href: "/admin/comments", description: "User feedback" },
      { name: "Pages", icon: BookOpen, href: "/admin/pages", description: "Static pages" },
    ],
  },
  {
    title: "Client Management",
    items: [
      { name: "Clients", icon: Users, href: "/admin/clients", description: "Manage client accounts" },
      { name: "Messages", icon: MessageSquare, href: "/admin/messages", description: "Client communication" },
      { name: "Analytics", icon: BarChart3, href: "/admin/client-analytics", description: "Client insights" },
    ],
  },
  {
    title: "Settings",
    items: [
      { name: "Site Settings", icon: Settings, href: "/admin/settings", description: "Site configuration" },
    ],
  },
];


export default function Sidebar({ isOpen = true, onClose, visible = true, onToggleVisible }: SidebarProps) {
  const { theme } = useTheme();

  return (
    <>
      {/* Sidebar Toggle Button */}
      <AnimatePresence>
        {!visible && (
          <motion.button
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: "spring", stiffness: 400, damping: 20, duration: 0.3 }}
            onClick={onToggleVisible}
            className="fixed top-6 left-4 z-50 flex items-center justify-center w-12 h-12 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-md border border-zinc-200 dark:border-zinc-700 shadow-md hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
            title="Show Sidebar"
          >
            <ChevronRight size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -256 }}
        animate={{ x: visible ? 0 : -256 }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        className="hidden md:flex flex-col h-screen w-64 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-r border-zinc-200 dark:border-zinc-700 fixed top-0 left-0 z-40"
      >
        <div className="flex flex-col h-full p-4 overflow-hidden">
          {/* Hide Button */}
          <button
            onClick={onToggleVisible}
            className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors"
            title="Hide Sidebar"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Logo */}
          <motion.div className="flex items-center space-x-3 mb-6">
            <motion.img
              src={Logo}
              alt="YOC Logo"
              className="w-10 h-10 rounded-md object-cover"
              whileHover={{ scale: 1.05, rotate: 3 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            />
            <div>
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">YahyaOnCloud</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Content Management</p>
            </div>
          </motion.div>

          {/* Nav Links */}
          <nav className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
            {navSections.map((section) => (
              <div key={section.title} className="mb-4">
                <h3 className="px-3 py-1 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">{section.title}</h3>
                {section.items.map((item, i) => (
                  <motion.div key={item.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                    <NavLink
                      to={item.href}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all relative overflow-hidden ${isActive
                          ? "bg-zinc-800 dark:bg-zinc-700 text-white"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100"
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <div className="flex-1 overflow-hidden">
                        <span className="block">{item.name}</span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                          {item.description}
                        </span>
                      </div>
                    </NavLink>
                  </motion.div>
                ))}
              </div>
            ))}

          </nav>

          {/* Footer */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1">
              <Eye size={12} />
              <span>Blog CMS v2.0</span>
            </div>
            <p className="mt-1">Manage your content with ease</p>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        className="fixed top-0 left-0 z-50 h-screen w-64 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-r border-zinc-200 dark:border-zinc-700 md:hidden"
      >
        <div className="flex flex-col h-full p-4 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <motion.img
                src={Logo}
                alt="YOC Logo"
                className="w-10 h-10 rounded-md object-cover"
                whileHover={{ scale: 1.05, rotate: 3 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              />
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">YOC</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Content Management</p>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors">
              <ChevronLeft size={20} />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
            {navSections.map((section) => (
              <div key={section.title} className="mb-4">
                <h3 className="px-3 py-1 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">{section.title}</h3>
                {section.items.map((item, i) => (
                  <motion.div key={item.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                    <NavLink
                      to={item.href}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all relative overflow-hidden ${isActive
                          ? "bg-zinc-800 dark:bg-zinc-700 text-white"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100"
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <div className="flex-1 overflow-hidden">
                        <span className="block">{item.name}</span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                          {item.description}
                        </span>
                      </div>
                    </NavLink>
                  </motion.div>
                ))}
              </div>
            ))}

          </nav>

          {/* Footer */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1">
              <Eye size={12} />
              <span>Blog CMS v2.0</span>
            </div>
            <p className="mt-1">Manage your content with ease</p>
          </div>
        </div>
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
