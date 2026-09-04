import { Outlet, useRouteError, isRouteErrorResponse, Link, useRevalidator } from "@remix-run/react";
import Sidebar from "~/components/Sidebar";
import Navbar from "~/components/Navbar";
import { useUIStore } from "~/store/uiStore";
import { useEffect } from "react";
import { LuTriangleAlert as AlertTriangle, LuRefreshCw as RefreshCw, LuLayoutDashboard as LayoutDashboard, LuHouse as Home } from "react-icons/lu";
import { Button } from "~/components/ui/button";

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { requireAdmin } from "~/utils/admin-auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const admin = await requireAdmin(request);
  return json({ admin });
}

export default function AdminLayout() {
  const { isSidebarOpen, closeSidebar, sidebarBehavior, setIsSidebarOpen } = useUIStore();

  useEffect(() => {
    if (sidebarBehavior === "always-open" && !isSidebarOpen) {
      setIsSidebarOpen(true);
    } else if (sidebarBehavior === "always-closed" && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [sidebarBehavior]);

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

export function ErrorBoundary() {
  const error = useRouteError();
  const revalidator = useRevalidator();
  const { isSidebarOpen, closeSidebar } = useUIStore();

  let errorTitle = "Admin Route Error";
  let errorMessage = "An unexpected error occurred while loading this admin section.";
  let errorDetails = "";

  if (isRouteErrorResponse(error)) {
    errorTitle = `${error.status} ${error.statusText || "Error"}`;
    errorMessage = typeof error.data === "string" ? error.data : error.data?.message || "Failed to load route data.";
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorDetails = error.stack || "";
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={closeSidebar} 
      />
      
      <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? "md:ml-64" : "ml-0"}`}>
        <Navbar />
        
        <main className="min-h-[calc(100vh-64px)] p-6 flex items-center justify-center">
          <div className="max-w-2xl w-full bg-zinc-50 dark:bg-zinc-900 border border-red-200 dark:border-red-900/50 rounded-2xl p-8 shadow-lg text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{errorTitle}</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">{errorMessage}</p>
            </div>

            {errorDetails && (
              <details className="text-left bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 text-xs font-mono text-zinc-700 dark:text-zinc-300 overflow-x-auto max-h-48">
                <summary className="cursor-pointer font-semibold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-2">
                  View Stack Trace
                </summary>
                <pre className="whitespace-pre-wrap">{errorDetails}</pre>
              </details>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => revalidator.revalidate()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Loading
              </Button>
              <Button asChild className="flex items-center gap-2">
                <Link to="/admin/dashboard">
                  <LayoutDashboard className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              </Button>
              <Button variant="ghost" asChild className="flex items-center gap-2">
                <Link to="/">
                  <Home className="w-4 h-4" />
                  Public Site
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
