import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuSearch as Search,
  LuPlus as Plus,
  LuFileText as FileText,
  LuBriefcase as Briefcase,
  LuBookOpen as BookOpen,
  LuSettings as Settings,
  LuUser as User,
  LuLayoutDashboard as Dashboard,
  LuSparkles as Sparkles,
  LuGlobe as Globe,
  LuImage as Image,
  LuMessageSquare as MessageSquare,
  LuShare2 as Share2,
  LuExternalLink as ExternalLink,
  LuX as X,
  LuCornerDownLeft as EnterKey,
} from "~/components/ui/icons";

interface CommandItem {
  id: string;
  title: string;
  category: "Quick Actions" | "Navigation" | "Settings" | "Site";
  icon: any;
  href: string;
  external?: boolean;
  keywords?: string[];
}

const commands: CommandItem[] = [
  // Quick Actions
  { id: "new-post", title: "Create New Blog Post", category: "Quick Actions", icon: Plus, href: "/admin/post/create", keywords: ["article", "write", "draft"] },
  { id: "new-project", title: "Create New Project", category: "Quick Actions", icon: Plus, href: "/admin/projects/create", keywords: ["work", "case study", "portfolio"] },
  { id: "new-research", title: "Add Research Paper", category: "Quick Actions", icon: Plus, href: "/admin/research/create", keywords: ["paper", "publication", "academic"] },
  { id: "upload-resume", title: "Upload New Resume / CV", category: "Quick Actions", icon: FileText, href: "/admin/resumes", keywords: ["cv", "pdf", "career"] },

  // Navigation
  { id: "nav-dashboard", title: "Dashboard Overview", category: "Navigation", icon: Dashboard, href: "/admin/dashboard", keywords: ["stats", "metrics", "home"] },
  { id: "nav-posts", title: "Blog Posts & Articles", category: "Navigation", icon: FileText, href: "/admin/posts", keywords: ["posts", "articles", "markdown"] },
  { id: "nav-projects", title: "Projects & Portfolio", category: "Navigation", icon: Briefcase, href: "/admin/projects", keywords: ["portfolio", "apps", "work"] },
  { id: "nav-research", title: "Research & Publications", category: "Navigation", icon: BookOpen, href: "/admin/research", keywords: ["papers", "science", "academia"] },
  { id: "nav-spotlight", title: "Featured Spotlight", category: "Navigation", icon: Sparkles, href: "/admin/featured-articles", keywords: ["pins", "homepage", "highlight"] },
  { id: "nav-about", title: "Homepage & Bio Studio", category: "Navigation", icon: User, href: "/admin/about", keywords: ["profile", "bio", "experience", "skills"] },
  { id: "nav-sections", title: "Homepage Section Toggles", category: "Navigation", icon: Globe, href: "/admin/about?tab=sections", keywords: ["visibility", "show", "hide"] },
  { id: "nav-linktree", title: "Linktree & Social Links", category: "Navigation", icon: Share2, href: "/admin/linktree", keywords: ["links", "social", "tree"] },
  { id: "nav-media", title: "Media & Assets Vault", category: "Navigation", icon: Image, href: "/admin/media", keywords: ["images", "uploads", "cloudinary", "storage"] },
  { id: "nav-messages", title: "Contact Inquiries", category: "Navigation", icon: MessageSquare, href: "/admin/messages", keywords: ["messages", "inbox", "mail"] },
  { id: "nav-guestbook", title: "Guestbook Moderation", category: "Navigation", icon: BookOpen, href: "/admin/guestbook", keywords: ["comments", "moderation"] },

  // Settings
  { id: "set-profile", title: "Account & Password Security", category: "Settings", icon: User, href: "/admin/settings?tab=profile", keywords: ["password", "username", "login"] },
  { id: "set-seo", title: "Site Identity & SEO Defaults", category: "Settings", icon: Globe, href: "/admin/settings?tab=seo", keywords: ["meta", "title", "description", "maintenance"] },
  { id: "set-prefs", title: "Admin Interface Preferences", category: "Settings", icon: Settings, href: "/admin/settings?tab=preferences", keywords: ["sidebar", "theme", "layout"] },
  { id: "set-system", title: "Telemetry & Metrics", category: "Settings", icon: Dashboard, href: "/admin/settings?tab=system", keywords: ["analytics", "views", "reset"] },

  // External
  { id: "site-live", title: "Open Live Public Site", category: "Site", icon: ExternalLink, href: "/", external: true, keywords: ["preview", "public", "website"] },
];

export function AdminCommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filter items based on query
  const filteredCommands = commands.filter((cmd) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      cmd.keywords?.some((k) => k.toLowerCase().includes(q))
    );
  });

  // Keep index within bounds
  useEffect(() => {
    if (selectedIndex >= filteredCommands.length) {
      setSelectedIndex(Math.max(0, filteredCommands.length - 1));
    }
  }, [filteredCommands.length, selectedIndex]);

  // Keyboard navigation inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredCommands[selectedIndex];
      if (selected) {
        executeCommand(selected);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  const executeCommand = (cmd: CommandItem) => {
    onClose();
    if (cmd.external) {
      window.open(cmd.href, "_blank");
    } else {
      navigate(cmd.href);
    }
  };

  // Group filtered results by category
  const categories = Array.from(new Set(filteredCommands.map((c) => c.category)));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs"
          />

          {/* Palette Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: "spring", stiffness: 450, damping: 35 }}
            className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800">
              <Search className="w-5 h-5 text-zinc-400 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or jump to page... (e.g. 'post', 'seo', 'bio')"
                className="w-full bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X size={16} />
                </button>
              )}
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded border border-zinc-200 dark:border-zinc-700">
                ESC
              </kbd>
            </div>

            {/* Command Results List */}
            <div className="max-h-80 overflow-y-auto p-2">
              {filteredCommands.length === 0 ? (
                <div className="py-10 text-center text-sm text-zinc-500">
                  No matching admin actions or routes found.
                </div>
              ) : (
                categories.map((cat) => {
                  const catItems = filteredCommands.filter((c) => c.category === cat);
                  return (
                    <div key={cat} className="mb-2 last:mb-0">
                      <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        {cat}
                      </div>
                      <div className="space-y-0.5">
                        {catItems.map((cmd) => {
                          const itemIndex = filteredCommands.indexOf(cmd);
                          const isSelected = itemIndex === selectedIndex;
                          const Icon = cmd.icon;

                          return (
                            <button
                              key={cmd.id}
                              type="button"
                              onClick={() => executeCommand(cmd)}
                              onMouseEnter={() => setSelectedIndex(itemIndex)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer text-left ${
                                isSelected
                                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-white dark:text-zinc-900" : "text-zinc-400"}`} />
                                <span>{cmd.title}</span>
                              </div>
                              {isSelected && (
                                <div className="flex items-center gap-1 text-[11px] font-mono opacity-80">
                                  <span>Jump</span>
                                  <EnterKey size={12} />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer hints */}
            <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-950/60 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
              <div className="flex items-center gap-2">
                <span>Navigate</span>
                <kbd className="px-1 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded font-mono text-[10px]">↑</kbd>
                <kbd className="px-1 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded font-mono text-[10px]">↓</kbd>
                <span className="ml-2">Select</span>
                <kbd className="px-1 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded font-mono text-[10px]">↵</kbd>
              </div>
              <span className="font-mono">YahyaOnCloud Admin</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
