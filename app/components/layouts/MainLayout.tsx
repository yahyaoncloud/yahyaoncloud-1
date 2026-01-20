import { useLocation } from "@remix-run/react";
import { motion } from "framer-motion";
import { ThemeProvider } from "../../Contexts/ThemeContext";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import { useUIStore } from "../../store/uiStore";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const { isSidebarOpen, closeSidebar, toggleSidebar } = useUIStore();

  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-all ease0in-out ">
        <Navbar />

        <div className="flex flex-1 w-full">
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
          />
          
          <div className={`flex-1 w-full transition-all duration-300 ${isSidebarOpen ? "md:ml-64" : ""}`}>
            <div className="max-w-7xl mx-auto px-4 md:px-6">
              <motion.main
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                {children}
              </motion.main>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
