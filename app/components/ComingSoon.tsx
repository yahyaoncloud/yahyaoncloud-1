import { Link } from "@remix-run/react";
import { useTheme } from "../Contexts/ThemeContext";

export default function ComingSoon() {
  useTheme(); // just to trigger theme context if needed

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-100 dark:bg-zinc-950 transition-colors duration-500">
      <div className="text-center flex flex-col items-center justify-center space-y-4 px-4">
        <h1 className="text-4xl font-bold text-indigo-800 dark:text-indigo-400 transition-colors duration-500">
          Coming Soon
        </h1>
        <p className="text-lg text-zinc-900 dark:text-white transition-colors duration-500">
          User management dashboard will be available shortly.
        </p>
        <Link
          prefetch="render"
          to="/blog"
          className="p-2 text-indigo-800 dark:text-indigo-400 bg-zinc-50 dark:bg-zinc-900 m-2 flex text-lg w-40 text-center items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-950 transition-all ease-in-out duration-200 font-bold rounded border dark:border-zinc-700 border-zinc-50"
        >
          Blog Page
        </Link>
      </div>
    </div>
  );
}
