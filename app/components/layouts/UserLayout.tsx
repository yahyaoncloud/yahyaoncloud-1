import { useLocation } from "@remix-run/react";
import { motion } from "framer-motion";
import { ThemeProvider, useTheme } from "../../Contexts/ThemeContext";
import Header from "../Header";
import Footer from "../../components/Footer";
import Sidebar from "../UserSidebar";

interface MainLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode; // optional sidebar content
}

function LayoutContent({ children, sidebar }: MainLayoutProps) {
  const location = useLocation();
  const { theme } = useTheme();

  return (
    <div className="flex flex-col bg-background dark:bg-slate-950 min-h-screen overflow-x-clip">
      <Header />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="flex-grow"
      >
        <div className=" flex py-4 md:px-8 ">
          {sidebar && (
            <aside className="hidden lg:block max-w-2xl  z-40">
              <div className="sticky top-24 w-72" />
            </aside>
          )}
          {/* Main content */}
          <div className="flex mx-auto">{children}</div>

          {/* Sidebar (only on large screens) */}
          {sidebar && (
            <aside className="hidden lg:block w-72 z-40">
              <div className="sticky top-24">{sidebar}</div>
            </aside>
          )}
        </div>
      </motion.main>
      <Footer />
    </div>
  );
}

export default function MainLayout({ children, sidebar }: MainLayoutProps) {
  return (
    <ThemeProvider>
      <LayoutContent
        sidebar={
          <Sidebar
            onSubscribe={function (email: string): void {
              throw new Error("Function not implemented.");
            }}
          />
        }
      >
        {children}
      </LayoutContent>
    </ThemeProvider>
  );
}
