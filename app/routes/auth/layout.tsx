import { Outlet, Link } from "@remix-run/react";
import { ThemeProvider } from "~/Contexts/ThemeContext";
import { LuArrowLeft as ArrowLeft } from "react-icons/lu";

export default function AuthLayout() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between p-4 md:p-8 selection:bg-zinc-200 dark:selection:bg-zinc-800">
        {/* Header Back Link */}
        <div className="w-full max-w-md mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs md:text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft size={15} />
            <span>Back to site</span>
          </Link>

          <span className="font-mono text-xs text-zinc-400 dark:text-zinc-600">
            Yahya Portal
          </span>
        </div>

        {/* Center Container */}
        <main className="w-full max-w-md mx-auto my-8">
          <Outlet />
        </main>

        {/* Footer */}
        <div className="w-full max-w-md mx-auto text-center text-xs text-zinc-400 dark:text-zinc-600">
          <span>Protected Infrastructure Management Portal</span>
        </div>
      </div>
    </ThemeProvider>
  );
}
