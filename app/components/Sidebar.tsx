import {
  Home,
  FileText,
  Tags,
  Image,
  Settings,
  Users,
  MessageSquare,
  BarChart3,
  PlusCircle,
  PersonStandingIcon,
} from "lucide-react";
import { NavLink, useLocation } from "@remix-run/react";
import { motion } from "framer-motion";
import Logo from "../assets/yoc-logo.png";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void; // closes mobile overlay
}

const navItems = [
  { name: "Dashboard", icon: Home, href: "/admin/dashboard" },
  { name: "Posts", icon: FileText, href: "/admin/posts" },
  { name: "Create Post", icon: PlusCircle, href: "/admin/post/create" },
  { name: "Categories", icon: Tags, href: "/admin/categories" },
  { name: "Media", icon: Image, href: "/admin/media" },
  { name: "Clients", icon: Users, href: "/admin/clients" },
  { name: "Messages", icon: MessageSquare, href: "/admin/messages" },
  { name: "Analytics", icon: BarChart3, href: "/admin/client-analytics" },
  { name: "Onboarding", icon: PersonStandingIcon, href: "/admin/client/onboard" },
  { name: "Settings", icon: Settings, href: "/admin/settings" },
];

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
        <div className="flex flex-col h-full p-4 overflow-y-auto space-y-2">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-6">
            <img src={Logo} alt="YOC Logo" className="w-10 h-10 rounded-md object-cover" />
            <h2 className="text-2xl  text-zinc-900 dark:text-zinc-100  mrs-saint-delafield-regular">YahyaOnCloud</h2>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                    ? "bg-zinc-800 dark:bg-zinc-700 text-white"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: -256 }}
        animate={{ x: isOpen ? 0 : -256 }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        className="fixed top-0 left-0 z-50 h-screen w-64 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-r border-zinc-200 dark:border-zinc-700 md:hidden"
      >
        <div className="flex flex-col h-full p-4 overflow-y-auto space-y-2">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-6">
            <img src={Logo} alt="YOC Logo" className="w-10 h-10 rounded-md object-cover" />
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">YOC</h2>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                    ? "bg-zinc-800 dark:bg-zinc-700 text-white"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
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
