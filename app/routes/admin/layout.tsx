import { Outlet } from "@remix-run/react";
import Sidebar from "~/components/Sidebar";
import Navbar from "~/components/Navbar";
import { useUIStore } from "~/store/uiStore";

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { requireAdmin } from "~/utils/admin-auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const admin = await requireAdmin(request);
  return json({ admin });
}

export default function AdminLayout() {
  const { isSidebarOpen, closeSidebar } = useUIStore();

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={closeSidebar} 
      />
      
      <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? "md:ml-64" : "ml-0"}`}>
        <Navbar />
        
        <main className="min-h-[calc(100vh-64px)] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
