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
  const { theme } = useTheme();

  return (
    <div className="flex flex-col max-w-3xl mx-auto items-center justify-center bg-zinc-50 dark:bg-zinc-950 min-h-screen overflow-x-clip">
      <Header />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="flex-grow py-12 p-6 "
      >
        <div className="flex my-8">
          {/* {sidebar && (
            <aside className="hidden lg:block max-w-xs w-full  z-40">
              <div className="sticky flex bg-blue-400" />
            </aside>
          )} */}
          {/* Main content */}
          <div className="flex">{children}</div>

          {/* Sidebar (only on large screens) */}
          {/* {sidebar && (
            <aside className="hidden lg:block max-w-xs z-40">
              <div className="sticky top-24">{sidebar}</div>
            </aside>
          )} */}
        </div>
      </motion.main>
      <Footer />
    </div>
  );
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();

  // Render sidebar only if path matches /blog/posts/*
  const showSidebar = location.pathname.startsWith("/blog/posts");

  return (
    <ThemeProvider>
      <LayoutContent
        sidebar={
          showSidebar ? (
            <Sidebar
              onSubscribe={(email: string) => {
                console.log("Subscribed:", email);
              }}
            />
          ) : undefined
        }
      >
        {children}
      </LayoutContent>
    </ThemeProvider>
  );
}
