/**
 * Project: yahyaoncloud Official Blog Platform
 * File: app/root.tsx
 * Description: Main root layout for the entire application
 */

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { Toaster } from "sonner";
import { useEffect } from "react";
import AOS from "aos";

// Import styles
import "./styles/tailwind.css";
// Ensure ThemeProvider and useTheme are correctly imported
import { ThemeProvider, useTheme } from "./Contexts/ThemeContext";

export const meta: MetaFunction = () => {
  return [
    { title: "YahyaOnCloud Blog" },
    {
      name: "description",
      content: "yahyaoncloud Official Blog Platform built with RemixJS",
    },
    { name: "viewport", content: "width=device-width,initial-scale=1" },
    { property: "og:title", content: "yahyaoncloud Official Blog" },
    {
      property: "og:description",
      content: "yahyaoncloud Official Blog Platform built with RemixJS",
    },
    { property: "og:type", content: "website" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  // In a real application, you would determine the theme dynamically,
  // e.g., from a cookie, user preference, or system setting.
  // For now, it's hardcoded to "dark" as per your original loader.
  return json({
    theme: "dark", // This theme value is passed to the client via ENV
    ENV: {
      FIREBASE_CONFIG: {
        apiKey: process.env.VITE_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.VITE_PUBLIC_FIREBASE_AUTH_DOMAIN,
        databaseURL: process.env.VITE_PUBLIC_FIREBASE_DATABASE_URL,
        projectId: process.env.VITE_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.VITE_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.VITE_PUBLIC_FIREBASE_APP_ID,
      },
    },
  });
}

// This component will now consume the theme context
function RootLayout() {
  const { ENV } = useLoaderData<typeof loader>();
  // useTheme can now be called safely because RootLayout is a child of ThemeProvider
  const { theme } = useTheme();

  // Initialize AOS (Animate on Scroll)
  useEffect(() => {
    AOS.init({
      once: true,
      duration: 700,
      easing: "ease-out-cubic",
    });
  }, []);

  return (
    // Apply the theme class to the html tag based on the context value
    <html lang="en" className={theme === "dark" ? "dark" : ""}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body
        className={`dark:bg-slate-900 dark:text-dark-100 bg-white text-dark-800 min-h-screen transition-colors duration-300`}
      >
        <Outlet />
        <Toaster position="top-right" richColors />
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)};`,
          }}
        />
        <Scripts />
        {/* <LiveReload /> is commented out as per your original code */}
      </body>
    </html>
  );
}

// The main App component now wraps RootLayout with ThemeProvider
export default function App() {
  return (
    <ThemeProvider>
      <RootLayout />
    </ThemeProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error("ErrorBoundary caught:", error);

  let status = 500;
  let message = "Something went wrong";

  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    "statusText" in error
  ) {
    status = (error as any).status;
    message = (error as any).statusText;
  }

  return (
    // ErrorBoundary also needs to be wrapped by ThemeProvider if it uses useTheme
    // or if its children might use it.
    <ThemeProvider>
      <html lang="en" className="dark">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <title>{`${status} - ${message}`}</title>
          <Meta />
          <Links />
        </head>
        <body className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-800 dark:text-indigo-100">
              {status}
            </h1>
            <p className="text-lg text-gray-500 dark:text-indigo-300 mt-2">
              {message}
            </p>
            <a
              href="/"
              className="mt-4 text-blue-500 dark:text-blue-800 hover:text-blue-600 dark:hover:text-blue-900 underline"
            >
              Back to Home
            </a>
          </div>
          <Scripts />
        </body>
      </html>
    </ThemeProvider>
  );
}
