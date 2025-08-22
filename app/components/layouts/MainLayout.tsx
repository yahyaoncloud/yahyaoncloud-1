import { useLocation } from "@remix-run/react";
import { motion } from "framer-motion";
import { ThemeProvider } from "../../Contexts/ThemeContext";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import Footer from "../../components/Footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

function LayoutContent({ children }: MainLayoutProps) {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Navbar */}
      <Navbar />

      <div className="flex flex-1 w-full max-w-7xl mx-auto px-4 md:px-6">
        {/* Main content with animation */}
        <motion.main
          key={location.pathname} // re-animate on route change
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="flex-1 w-full"
        >
          {children}
        </motion.main>

        {/* Sidebar */}
        <Sidebar />
      </div>

      {/* Footer */}
      {/* <Footer /> */}
    </div>
  );
}

export default function MainLayout({ children }: MainLayoutProps) {
  return <ThemeProvider><LayoutContent>{children}</LayoutContent></ThemeProvider>;
}
