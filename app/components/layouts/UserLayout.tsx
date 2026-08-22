import React from "react";
import { motion } from "framer-motion";
import Header from "../Header";
import Footer from "../Footer";

interface UserLayoutProps {
  children: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      <Header />
      <motion.main
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex-grow w-full max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16"
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
}
