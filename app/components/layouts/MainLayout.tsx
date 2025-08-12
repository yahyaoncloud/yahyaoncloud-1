import { motion } from "framer-motion";
import { ThemeProvider } from "../../Contexts/ThemeContext";
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

function LayoutContent({ children }: AdminLayoutProps) {
  return (
    <div className="flex flex-col bg-background dark:bg-slate-950 min-h-screen">
      {/* Header */}
      <Navbar />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-72 bg-slate-100 dark:bg-slate-900">
          <div className="sticky top-24 left-0 h-full w-full overflow-y-auto">
            <Sidebar onSubscribe={() => { }} />
          </div>
        </aside>

        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="flex-1 p-4 md:p-8 overflow-y-auto"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ThemeProvider>
      <LayoutContent>{children}</LayoutContent>
    </ThemeProvider>
  );
}
