import React from "react";
import Header from "../Header";
import Footer from "../Footer";

interface UserLayoutProps {
  children: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-zinc-200 dark:selection:bg-zinc-800">
      <div className="mx-auto my-8 w-[90%] max-w-[580px] sm:my-14 flex flex-col min-h-[calc(100vh-7rem)]">
        <Header />
        <main className="flex-1 space-y-12">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
