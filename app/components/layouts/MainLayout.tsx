import { useLocation } from "@remix-run/react";
import { motion } from "framer-motion";
import { ThemeProvider } from "~/Contexts/ThemeContext";
import Header from "../Header";
import Footer from "~/components/Footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

function LayoutContent({ children }: MainLayoutProps) {
  const location = useLocation();

  // Optional: If you want scroll-to-top or route-based animations
  // useEffect(() => window.scrollTo(0, 0), [location]);

  return (
    <div className="flex flex-col min-h-screen bg-dark-50 dark:bg-dark-900">
      <Header />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="flex-grow"
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <ThemeProvider>
      <LayoutContent>{children}</LayoutContent>
    </ThemeProvider>
  );
}
