import { useState } from "react";
import { useLocation } from "@remix-run/react";
import { motion } from "framer-motion";
import { ThemeProvider } from "../../Contexts/ThemeContext";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-all ease0in-out ">
        <Navbar onToggleSidebar={toggleSidebar} />

        <div className="flex flex-1 w-full max-w-7xl mx-auto px-4 md:px-6">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className={`mx-auto w-full transition-all ${isSidebarOpen ? "" : ""}`}
          >
            {children}
          </motion.main>

          <Sidebar
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
            onToggle={toggleSidebar}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}
