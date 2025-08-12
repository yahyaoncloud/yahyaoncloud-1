import { motion } from "framer-motion";
import { ThemeProvider } from "../../Contexts/ThemeContext";
import Header from "../Header";
import Footer from "../../components/Footer";

interface UserLayoutProps {
  children: React.ReactNode;
}

function LayoutContent({ children }: UserLayoutProps) {
  return (
    <div className="flex flex-col bg-background dark:bg-slate-950 min-h-screen overflow-x-clip">
      <Header />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="flex-grow flex justify-center py-4 md:px-8"
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
}

export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <ThemeProvider>
      <LayoutContent>{children}</LayoutContent>
    </ThemeProvider>
  );
}
